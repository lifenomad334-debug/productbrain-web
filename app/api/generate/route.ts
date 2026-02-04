import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { assertEnv, publicStorageUrl, safeBase64ToBuffer } from "@/lib/utils";
import type { EdgeResponse, RenderResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const sb = supabaseAdmin();

  const EDGE_URL = assertEnv("EDGE_GENERATE_URL");
  const RENDER_URL = assertEnv("RENDER_SERVER_URL");
  const BUCKET = assertEnv("SUPABASE_BUCKET");

  let productTitle: string;
  let platform: string;
  let additionalInfo: string;
  let imageFiles: File[] = [];

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    productTitle = (formData.get("product_title") as string) || "";
    platform = (formData.get("platform") as string) || "";
    additionalInfo = (formData.get("additional_info") as string) || "";
    imageFiles = formData.getAll("images") as File[];
  } else {
    const body = await req.json();
    productTitle = body.product_title || "";
    platform = body.platform || "";
    additionalInfo = body.additional_info || "";
  }

  if (!productTitle || !platform) {
    return NextResponse.json(
      { ok: false, error: "product_title and platform are required" },
      { status: 400 }
    );
  }

  const { data: genRow, error: genErr } = await sb
    .from("generations")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      product_title: productTitle,
      platform: platform,
      style: "trust_dense",
      seller_input: { product_title: productTitle, platform, additional_info: additionalInfo },
      status: "generating",
    })
    .select("id")
    .single();

  if (genErr || !genRow?.id) {
    return NextResponse.json(
      { ok: false, error: genErr?.message ?? "DB insert failed" },
      { status: 500 }
    );
  }
  const generationId = genRow.id as string;

  try {
    const uploadedImageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `seller-photos/${generationId}/photo-${i}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

      if (!upErr) {
        const url = `${assertEnv("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}/${path}`;
        uploadedImageUrls.push(url);
      }
    }

    if (uploadedImageUrls.length > 0) {
      await sb.from("generations").update({
        seller_input: {
          product_title: productTitle,
          platform,
          additional_info: additionalInfo,
          image_urls: uploadedImageUrls,
        },
      }).eq("id", generationId);
    }

    // 3) Edge Function: JSON 생성
    console.log("EDGE CALL START:", EDGE_URL);
    console.log("EDGE CALL BODY:", JSON.stringify({ product_title: productTitle, platform, additional_info: additionalInfo }));
    const edgeRes = await fetch(EDGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${assertEnv("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        product_title: productTitle,
        platform: platform,
        additional_info: additionalInfo,
      }),
    });

    const edgeText = await edgeRes.text();
    console.log("EDGE RAW STATUS:", edgeRes.status);
    console.log("EDGE RAW BODY (first 500):", edgeText.substring(0, 500));

    let edgeJson: EdgeResponse;
    try {
      edgeJson = JSON.parse(edgeText) as EdgeResponse;
    } catch (parseErr) {
      console.error("EDGE JSON PARSE FAILED:", edgeText.substring(0, 500));
      await sb.from("generations").update({
        status: "failed",
        error_message: `Edge JSON parse failed: ${edgeText.substring(0, 200)}`,
      }).eq("id", generationId);
      return NextResponse.json(
        { ok: false, generation_id: generationId, status: "failed", error: `Edge JSON parse failed: ${edgeText.substring(0, 200)}` },
        { status: 500 }
      );
    }

    const llmTimeMs = edgeJson.llm_time_ms ?? 0;
    console.log("EDGE LLM TIME:", llmTimeMs, "STATUS:", edgeJson.status, "ATTEMPTS:", (edgeJson as any).attempts);

    if (!edgeRes.ok || !edgeJson.json) {
      console.log("EDGE FAILED - edgeRes.ok:", edgeRes.ok, "edgeJson.json exists:", !!edgeJson.json, "edgeJson.error:", edgeJson.error);
      await sb.from("generations").update({
        status: "failed",
        error_message: edgeJson.error ?? `Edge function failed (${edgeRes.status})`,
        llm_time_ms: llmTimeMs,
      }).eq("id", generationId);

      return NextResponse.json(
        { ok: false, generation_id: generationId, status: "failed", error: edgeJson.error ?? "LLM failed" },
        { status: 500 }
      );
    }

    // === VALIDATION GATE: validation error가 있으면 렌더 차단 ===
    const validation = (edgeJson as any).validation;
    const validationErrors = validation?.errors ?? [];
    const isValidationFail = 
      (edgeJson.status as string) === "validation_warning" ||
      validation?.valid === false ||
      validationErrors.length > 0;

    if (isValidationFail) {
      console.log("VALIDATION FAILED:", JSON.stringify(validationErrors));
      await sb.from("generations").update({
        status: "failed",
        generated_json: edgeJson.json,
        error_message: `Validation failed (${validationErrors.length} errors): ${validationErrors.slice(0, 3).join('; ')}`,
        llm_time_ms: llmTimeMs,
      }).eq("id", generationId);

      return NextResponse.json(
        { 
          ok: false, 
          generation_id: generationId, 
          status: "validation_failed", 
          errors: validationErrors,
          warnings: validation?.warnings ?? [],
          attempts: (edgeJson as any).attempts ?? 1,
        },
        { status: 422 }
      );
    }

    // 4) Render
    await sb.from("generations").update({
      status: "rendering",
      generated_json: edgeJson.json,
      llm_time_ms: llmTimeMs,
    }).eq("id", generationId);

    console.log("RENDER CALL START:", RENDER_URL);
    const renderRes = await fetch(RENDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: edgeJson.json,
        platform,
        image_urls: uploadedImageUrls,
      }),
    });

    const renderText = await renderRes.text();
    console.log("RENDER RAW STATUS:", renderRes.status);
    console.log("RENDER RAW BODY (first 300):", renderText.substring(0, 300));

    let renderJson: RenderResponse;
    try {
      renderJson = JSON.parse(renderText) as RenderResponse;
    } catch (renderParseErr) {
      console.error("RENDER JSON PARSE FAILED:", renderText.substring(0, 300));
      await sb.from("generations").update({
        status: "failed",
        error_message: `Render JSON parse failed: ${renderText.substring(0, 200)}`,
      }).eq("id", generationId);
      return NextResponse.json(
        { ok: false, generation_id: generationId, status: "failed", error: `Render JSON parse failed: ${renderText.substring(0, 200)}` },
        { status: 500 }
      );
    }

    const renderTimeMs = renderJson.render_time_ms ?? 0;
    console.log("RENDER TIME:", renderTimeMs, "SLIDES:", renderJson?.slides?.length);

    if (!renderRes.ok || !renderJson?.slides?.length) {
      await sb.from("generations").update({
        status: "failed",
        error_message: `Render failed (${renderRes.status})`,
        render_time_ms: renderTimeMs,
      }).eq("id", generationId);

      return NextResponse.json(
        { ok: false, generation_id: generationId, status: "failed", error: "Render failed" },
        { status: 500 }
      );
    }

    // 5) 슬라이드 Storage 업로드
    const assetsToInsert: any[] = [];
    for (const s of renderJson.slides) {
      const buf = safeBase64ToBuffer(s.base64);
      const fileSizeKb = Math.round(buf.byteLength / 1024);
      const storagePath = `${generationId}/${s.slide_id}.png`;

      const { error: upErr } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
        contentType: "image/png",
        upsert: true,
      });

      if (upErr) throw new Error(`Storage upload failed for ${s.slide_id}: ${upErr.message}`);

      assetsToInsert.push({
        generation_id: generationId,
        slide_id: s.slide_id,
        image_url: publicStorageUrl(storagePath),
        width: s.width,
        height: s.height,
        file_size_kb: fileSizeKb,
      });
    }

    const { error: assetErr } = await sb.from("generation_assets").insert(assetsToInsert);
    if (assetErr) throw new Error(`DB insert generation_assets failed: ${assetErr.message}`);

    // 6) 완료
    await sb.from("generations").update({
      status: "complete",
      render_time_ms: renderTimeMs,
    }).eq("id", generationId);

    console.log("GENERATION COMPLETE:", generationId, "TOTAL:", Date.now() - startedAt, "ms");

    return NextResponse.json({
      ok: true,
      generation_id: generationId,
      status: "complete",
      total_time_ms: Date.now() - startedAt,
    });
  } catch (e: any) {
    console.error("GENERATION ERROR:", e?.message);
    await sb.from("generations").update({
      status: "failed",
      error_message: e?.message ?? "Unknown error",
    }).eq("id", generationId);

    return NextResponse.json(
      { ok: false, generation_id: generationId, status: "failed", error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

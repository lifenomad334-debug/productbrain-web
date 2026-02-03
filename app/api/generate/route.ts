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

  // FormData or JSON 둘 다 지원
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

  // 1) DB: generations 생성
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
    // 2) 상품 사진 Storage 업로드
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

    // seller_input에 image_urls 추가
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
    const edgeRes = await fetch(EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_title: productTitle,
        platform: platform,
        additional_info: additionalInfo,
      }),
    });

    const edgeJson = (await edgeRes.json()) as EdgeResponse;
    const llmTimeMs = edgeJson.llm_time_ms ?? 0;

    if (!edgeRes.ok || edgeJson.status !== "complete" || !edgeJson.json) {
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

    // 4) Render: 이미지 생성
    await sb.from("generations").update({
      status: "rendering",
      generated_json: edgeJson.json,
      llm_time_ms: llmTimeMs,
    }).eq("id", generationId);

    const renderRes = await fetch(RENDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: edgeJson.json, platform }),
    });

    const renderJson = (await renderRes.json()) as RenderResponse;
    const renderTimeMs = renderJson.render_time_ms ?? 0;

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

    // 5) 슬라이드 Storage 업로드 + generation_assets 저장
    const assetsToInsert: any[] = [];
    for (const s of renderJson.slides) {
      const buf = safeBase64ToBuffer(s.base64);
      const fileSizeKb = Math.round(buf.byteLength / 1024);
      const path = `${generationId}/${s.slide_id}.png`;

      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, {
        contentType: "image/png",
        upsert: true,
      });

      if (upErr) throw new Error(`Storage upload failed for ${s.slide_id}: ${upErr.message}`);

      assetsToInsert.push({
        generation_id: generationId,
        slide_id: s.slide_id,
        image_url: publicStorageUrl(path),
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

    return NextResponse.json({
      ok: true,
      generation_id: generationId,
      status: "complete",
      total_time_ms: Date.now() - startedAt,
    });
  } catch (e: any) {
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

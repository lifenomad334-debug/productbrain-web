import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { assertEnv, publicStorageUrl, safeBase64ToBuffer } from "@/lib/utils";
import type { EdgeResponse, RenderResponse, SellerInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const startedAt = Date.now();
  const sb = supabaseAdmin();

  const EDGE_URL = assertEnv("EDGE_GENERATE_URL");
  const RENDER_URL = assertEnv("RENDER_SERVER_URL");
  const BUCKET = assertEnv("SUPABASE_BUCKET");

  let input: SellerInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!input?.product_title || !input?.platform) {
    return NextResponse.json(
      { ok: false, error: "product_title and platform are required" },
      { status: 400 }
    );
  }

  const { data: genRow, error: genErr } = await sb
    .from("generations")
    .insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      product_title: input.product_title,
      platform: input.platform,
      style: "trust_dense",
      seller_input: input,
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
    const llmStart = Date.now();
    const edgeRes = await fetch(EDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_title: input.product_title,
        platform: input.platform,
        additional_info: input.additional_info ?? "",
      }),
    });

    const edgeJson = (await edgeRes.json()) as EdgeResponse;
    const llmTimeMs = edgeJson.llm_time_ms ?? (Date.now() - llmStart);

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

    await sb.from("generations").update({
      status: "rendering",
      generated_json: edgeJson.json,
      llm_time_ms: llmTimeMs,
    }).eq("id", generationId);

    const renderRes = await fetch(RENDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: edgeJson.json, platform: input.platform }),
    });

    const renderJson = (await renderRes.json()) as RenderResponse;
    const renderTimeMs = renderJson.render_time_ms ?? (Date.now() - llmStart);

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

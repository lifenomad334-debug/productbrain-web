import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type RequestBody = {
  generation_id: string;
  slide_id: string;
  // 기존 방식 (하위호환)
  edited_text?: string;
  tweak?: "shorter" | "direct" | "premium" | null;
  // 새 방식: 전체 JSON 업데이트
  full_json_update?: any;
};

// 인메모리 레이트리밋 (generation당 10초 쿨다운)
const editCooldowns = new Map<string, number>();

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  try {
    const body: RequestBody = await req.json();
    const { generation_id, slide_id, edited_text, tweak, full_json_update } = body;

    if (!generation_id || !slide_id) {
      return NextResponse.json(
        { ok: false, error: "generation_id and slide_id are required" },
        { status: 400 }
      );
    }

    // 레이트리밋 체크 (10초 쿨다운)
    const cooldownKey = generation_id;
    const lastEdit = editCooldowns.get(cooldownKey);
    const now = Date.now();
    
    if (lastEdit && now - lastEdit < 10000) {
      const remainingSeconds = Math.ceil((10000 - (now - lastEdit)) / 1000);
      return NextResponse.json(
        { ok: false, error: `${remainingSeconds}초 후에 다시 시도해주세요` },
        { status: 429 }
      );
    }

    // 1. generation 조회
    const { data: gen, error: genErr } = await sb
      .from("generations")
      .select("id, user_id, generated_json, platform, style, seller_input")
      .eq("id", generation_id)
      .single();

    if (genErr || !gen) {
      return NextResponse.json(
        { ok: false, error: "Generation not found" },
        { status: 404 }
      );
    }

    // 2. 해당 컷의 asset 조회
    const { data: asset, error: assetErr } = await sb
      .from("generation_assets")
      .select("id, slide_id, image_url")
      .eq("generation_id", generation_id)
      .eq("slide_id", slide_id)
      .single();

    if (assetErr || !asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    // 3. JSON 업데이트 결정
    let updatedJson: any;

    if (full_json_update) {
      // 새 방식: 프론트에서 수정된 전체 JSON을 직접 전달
      updatedJson = full_json_update;
    } else {
      // 기존 방식: slides 기반 (하위호환)
      const generatedJson = gen.generated_json || {};
      const slides = generatedJson.slides || [];

      if (slides.length > 0) {
        const updatedSlides = slides.map((s: any) => {
          if (s.slide_id === slide_id) {
            let newText = edited_text || s.text;
            if (tweak && !edited_text) {
              if (tweak === "shorter") newText = `[더 짧게] ${s.text}`;
              else if (tweak === "direct") newText = `[더 직설적으로] ${s.text}`;
              else if (tweak === "premium") newText = `[더 고급스럽게] ${s.text}`;
            }
            return { ...s, text: newText };
          }
          return s;
        });
        updatedJson = { ...generatedJson, slides: updatedSlides };
      } else {
        updatedJson = generatedJson;
      }
    }

    // 4. Railway 렌더 서버로 전송
    const renderUrl = process.env.RENDER_SERVER_URL || process.env.RAILWAY_RENDER_URL;
    if (!renderUrl) {
      return NextResponse.json(
        { ok: false, error: "Render server URL not configured" },
        { status: 500 }
      );
    }

    // 렌더 서버는 /api/render 엔드포인트 사용
    // seller_input에서 실제 업로드된 이미지 URL 가져오기
    const sellerInput = gen.seller_input || {};
    const imageUrls = sellerInput.image_urls || [];

    const renderRes = await fetch(`${renderUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: updatedJson,
        platform: gen.platform || "coupang",
        image_urls: imageUrls,
        design_style: sellerInput.design_style || "modern_red",
      }),
    });

    if (!renderRes.ok) {
      const errorText = await renderRes.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Render failed: ${errorText}` },
        { status: 500 }
      );
    }

    const renderData = await renderRes.json();
    
    // renderData.slides = [{ slide_id, base64 }, ...]
    const targetImage = renderData.slides?.find(
      (img: any) => img.slide_id === slide_id
    );

    if (!targetImage || !targetImage.base64) {
      return NextResponse.json(
        { ok: false, error: "Rendered image not found in response" },
        { status: 500 }
      );
    }

    // 5. Storage 업로드
    const bytes = Buffer.from(targetImage.base64, "base64");
    const path = `generations/${generation_id}/${slide_id}-${Date.now()}.png`;

    const { error: uploadErr } = await sb.storage
      .from(process.env.SUPABASE_BUCKET || "generation-images")
      .upload(path, bytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { ok: false, error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = sb.storage
      .from(process.env.SUPABASE_BUCKET || "generation-images")
      .getPublicUrl(path);

    const image_url = publicData.publicUrl;

    // 6. DB 업데이트
    const { error: updateAssetErr } = await sb
      .from("generation_assets")
      .update({ image_url })
      .eq("id", asset.id);

    if (updateAssetErr) {
      return NextResponse.json(
        { ok: false, error: `Asset update failed: ${updateAssetErr.message}` },
        { status: 500 }
      );
    }

    // generated_json 업데이트
    const { error: updateGenErr } = await sb
      .from("generations")
      .update({ 
        generated_json: updatedJson
      })
      .eq("id", gen.id);

    if (updateGenErr) {
      return NextResponse.json(
        { ok: false, error: `Generation update failed: ${updateGenErr.message}` },
        { status: 500 }
      );
    }

    // 7. 쿨다운 갱신
    editCooldowns.set(cooldownKey, now);

    return NextResponse.json({
      ok: true,
      image_url,
    });
  } catch (err: any) {
    console.error("Edit cut error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

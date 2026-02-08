import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  try {
    const formData = await req.formData();
    const generationId = formData.get("generation_id") as string;
    const slideId = formData.get("slide_id") as string;
    const imageFile = formData.get("image") as File;

    if (!generationId || !slideId || !imageFile) {
      return NextResponse.json(
        { ok: false, error: "generation_id, slide_id, image are required" },
        { status: 400 }
      );
    }

    // 1. generation 조회 (권한 확인)
    const { data: gen, error: genErr } = await sb
      .from("generations")
      .select("id, user_id, generated_json, platform")
      .eq("id", generationId)
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
      .eq("generation_id", generationId)
      .eq("slide_id", slideId)
      .single();

    if (assetErr || !asset) {
      return NextResponse.json(
        { ok: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    // 3. 새 이미지를 Supabase Storage에 업로드
    const BUCKET = process.env.SUPABASE_BUCKET || "productbrain-assets";
    const ext = imageFile.name.split(".").pop() || "png";
    const uploadPath = `seller-photos/${generationId}/replace-${slideId}-${Date.now()}.${ext}`;
    
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadErr } = await sb.storage.from(BUCKET).upload(uploadPath, buffer, {
      contentType: imageFile.type || "image/jpeg",
      upsert: true,
    });

    if (uploadErr) {
      return NextResponse.json(
        { ok: false, error: `Image upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    const newImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${uploadPath}`;

    // 4. generated_json에서 해당 슬라이드의 이미지 URL 업데이트
    const updatedJson = { ...gen.generated_json };
    
    // slide_id에 따라 이미지 인덱스 매핑
    const slideImageMap: Record<string, number> = {
      hero: 0,
      "problem-benefits": 1,
      details: 2,
      "reasons-specs": 3,
      faq: -1, // FAQ는 이미지 없음
      cta: -1,  // CTA도 이미지 없음
    };

    const imageIndex = slideImageMap[slideId];
    
    // seller_input에 이미지 URL 추가/업데이트
    if (!updatedJson._replaced_images) {
      updatedJson._replaced_images = {};
    }
    updatedJson._replaced_images[slideId] = newImageUrl;

    // 5. 렌더 서버로 재렌더링 요청
    const renderUrl = process.env.RENDER_SERVER_URL || process.env.RAILWAY_RENDER_URL;
    if (!renderUrl) {
      return NextResponse.json(
        { ok: false, error: "Render server URL not configured" },
        { status: 500 }
      );
    }

    // 기존 이미지 URL 목록 가져오기
    const { data: genFull } = await sb
      .from("generations")
      .select("seller_input")
      .eq("id", generationId)
      .single();
    
    let imageUrls: string[] = genFull?.seller_input?.image_urls || [];
    
    // 해당 인덱스의 이미지를 새 이미지로 교체
    if (imageIndex >= 0) {
      while (imageUrls.length <= imageIndex) {
        imageUrls.push(""); // 부족한 슬롯 채우기
      }
      imageUrls[imageIndex] = newImageUrl;
    }

    const renderRes = await fetch(`${renderUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: updatedJson,
        platform: gen.platform || "coupang",
        image_urls: imageUrls,
        design_style: "modern_red",
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
    const targetSlide = renderData.slides?.find(
      (s: any) => s.slide_id === slideId
    );

    if (!targetSlide || !targetSlide.base64) {
      return NextResponse.json(
        { ok: false, error: "Rendered slide not found" },
        { status: 500 }
      );
    }

    // 6. 렌더링된 이미지를 Storage에 업로드
    const renderedBytes = Buffer.from(targetSlide.base64, "base64");
    const renderedPath = `generations/${generationId}/${slideId}-${Date.now()}.png`;

    const { error: renderedUploadErr } = await sb.storage
      .from(BUCKET)
      .upload(renderedPath, renderedBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (renderedUploadErr) {
      return NextResponse.json(
        { ok: false, error: `Rendered image upload failed: ${renderedUploadErr.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = sb.storage
      .from(BUCKET)
      .getPublicUrl(renderedPath);

    const finalImageUrl = publicData.publicUrl;

    // 7. DB 업데이트
    await sb
      .from("generation_assets")
      .update({ image_url: finalImageUrl })
      .eq("id", asset.id);

    // generated_json도 업데이트 (교체 이미지 정보 저장)
    await sb
      .from("generations")
      .update({ generated_json: updatedJson })
      .eq("id", generationId);

    // seller_input의 image_urls도 업데이트
    if (imageIndex >= 0) {
      const sellerInput = genFull?.seller_input || {};
      await sb
        .from("generations")
        .update({
          seller_input: { ...sellerInput, image_urls: imageUrls },
        })
        .eq("id", generationId);
    }

    return NextResponse.json({
      ok: true,
      image_url: finalImageUrl,
    });
  } catch (err: any) {
    console.error("Replace image error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

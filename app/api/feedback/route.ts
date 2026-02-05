import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  try {
    const body = await req.json();
    const {
      generation_id,
      user_id,
      score,
      weak_cuts,
      weak_cut_reasons,
      upload_intent,
      upload_reason,
      paid_intent,
      improvement_areas,
      improvement_other,
    } = body;

    if (!generation_id) {
      return NextResponse.json(
        { ok: false, error: "generation_id is required" },
        { status: 400 }
      );
    }

    // 1. feedbacks 테이블에 저장
    const { error: insertError } = await sb.from("feedbacks").insert({
      generation_id,
      user_id: user_id || null,
      score: score || null,
      weak_cuts: weak_cuts || [],
      weak_cut_reasons: weak_cut_reasons || [],
      upload_intent: upload_intent || null,
      upload_reason: upload_reason || null,
      paid_intent: paid_intent || null,
      improvement_areas: improvement_areas || [],
      improvement_other: improvement_other || null,
    });

    if (insertError) {
      console.error("Feedback insert error:", insertError);
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    // 2. generations 테이블 업데이트 (피드백 제출 완료 표시)
    const { error: updateError } = await sb
      .from("generations")
      .update({ feedback_submitted: true })
      .eq("id", generation_id);

    if (updateError) {
      console.error("Generation update error:", updateError);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Feedback API error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

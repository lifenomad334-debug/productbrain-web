import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { generation_id, rating, tags, comment } = body;

    if (!generation_id || !rating) {
      return NextResponse.json({ ok: false, error: "generation_id and rating required" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb.from("generation_feedback").insert({
      generation_id,
      rating,
      tags: tags || [],
      comment: comment || "",
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}

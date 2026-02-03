import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = supabaseAdmin();

  const { data: gen, error: genErr } = await sb
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (genErr || !gen) {
    return NextResponse.json({ ok: false, error: "Generation not found" }, { status: 404 });
  }

  const { data: assets, error: aErr } = await sb
    .from("generation_assets")
    .select("*")
    .eq("generation_id", id)
    .order("created_at", { ascending: true });

  if (aErr) {
    return NextResponse.json({ ok: false, error: aErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, generation: gen, assets: assets ?? [] });
}

import SlideGallery from "@/components/SlideGallery";
import DownloadButtons from "@/components/DownloadButtons";
import FeedbackBox from "@/components/FeedbackBox";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function fetchGenerationFromDB(id: string) {
  const sb = supabaseAdmin();

  const { data: generation, error: genErr } = await sb
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (genErr || !generation) return { ok: false };

  const { data: assets, error: aErr } = await sb
    .from("generation_assets")
    .select("*")
    .eq("generation_id", id)
    .order("created_at", { ascending: true });

  if (aErr) return { ok: false };

  return { ok: true, generation, assets: assets ?? [] };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchGenerationFromDB(id);

  if (!data.ok) {
    return (
      <main className="min-h-screen p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold">결과를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-600 mt-2">ID: {id}</p>
      </main>
    );
  }

  const { generation, assets } = data as any;

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">생성 결과</h1>
          <p className="text-sm text-gray-600 mt-2">
            {generation.product_title} · {generation.platform}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            LLM: {generation.llm_time_ms ?? "-"}ms · Render: {generation.render_time_ms ?? "-"}ms
          </p>
        </div>

        <DownloadButtons assets={assets} />
      </div>

      <div className="mt-6">
        <SlideGallery assets={assets} />
      </div>

      <div className="mt-10">
        <FeedbackBox generationId={id} />
      </div>
    </main>
  );
}

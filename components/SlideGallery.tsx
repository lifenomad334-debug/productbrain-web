export default function SlideGallery({ assets }: { assets: any[] }) {
  if (!assets?.length) {
    return <div className="text-sm text-gray-600">슬라이드가 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {assets.map((a: any) => (
        <section key={a.id} className="border rounded-md overflow-hidden">
          <div className="px-3 py-2 text-xs bg-gray-50 border-b flex justify-between">
            <span className="font-medium">{a.slide_id}</span>
            <span className="text-gray-500">
              {a.width ?? "?"}x{a.height ?? "?"} · {a.file_size_kb ?? "?"}KB
            </span>
          </div>
          <img src={a.image_url} alt={a.slide_id} className="w-full h-auto" />
        </section>
      ))}
    </div>
  );
}

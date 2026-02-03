"use client";

import JSZip from "jszip";

export default function DownloadButtons({ assets }: { assets: any[] }) {
  async function downloadAllZip() {
    if (!assets?.length) return;

    const zip = new JSZip();
    const folder = zip.folder("productbrain")!;

    for (const a of assets) {
      const res = await fetch(a.image_url);
      const blob = await res.blob();
      folder.file(`${a.slide_id}.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "productbrain_slides.zip";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={downloadAllZip}
        className="px-3 py-2 rounded-md bg-black text-white text-sm"
      >
        ZIP 다운로드
      </button>
    </div>
  );
}

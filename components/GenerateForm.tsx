"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/types";
import ProgressBox from "@/components/ProgressBox";

export default function GenerateForm() {
  const router = useRouter();
  const [productTitle, setProductTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("coupang");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productTitle.trim()) return;

    setLoading(true);
    setStage("LLM JSON 생성 + 이미지 렌더링 중...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_title: productTitle.trim(),
          platform,
          additional_info: additionalInfo.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "생성 실패");

      router.push(`/generate/${data.generation_id}`);
    } catch (err: any) {
      alert(err?.message ?? "에러가 발생했습니다.");
      setLoading(false);
      setStage("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">제품명</span>
        <input
          className="mt-1 w-full border rounded-md p-2"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="예: 에어쿨 프로 넥밴드 선풍기"
          required
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">플랫폼</legend>
        <div className="flex gap-4">
          {(["coupang", "naver", "shopify"] as Platform[]).map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="platform"
                value={p}
                checked={platform === p}
                onChange={() => setPlatform(p)}
              />
              <span className="text-sm">{p}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium">추가정보</span>
        <textarea
          className="mt-1 w-full border rounded-md p-2 min-h-[120px]"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="제품 스펙, 강조 포인트, 주의사항 등 자유롭게 적어주세요."
        />
      </label>

      <button
        disabled={loading}
        className="w-full bg-black text-white rounded-md py-2 disabled:opacity-60"
      >
        {loading ? "생성 중..." : "상세페이지 생성하기"}
      </button>

      {loading && <ProgressBox stage={stage} />}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/types";
import ProgressBox from "@/components/ProgressBox";

const EXAMPLE_INPUT = `1. 타겟/상황: 출근길 차 안에서 커피를 자주 마시는 직장인
2. 가장 빡치는 문제: 30분이면 미지근해져서 결국 다 버린다
3. 핵심 차별점: 진공 3중 단열 구조, 원터치 누수방지 캡
4. 스펙 숫자: 500ml, 316 스테인리스, 12시간 보온 24시간 보냉
5. 불안/반박 포인트: 세척 어렵지 않나? 냄새 배지 않나? 무겁지 않나?
6. 금지 표현: 최저가, 업계 1등, 무조건, 혁신적인`;

export default function GenerateForm() {
  const router = useRouter();
  const [productTitle, setProductTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("coupang");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string>("");
  const [showGuide, setShowGuide] = useState(false);

  function fillExample() {
    setProductTitle("스테인리스 보온 텀블러 500ml");
    setAdditionalInfo(EXAMPLE_INPUT);
  }

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
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 제품명 */}
      <label className="block">
        <span className="text-sm font-medium">제품명</span>
        <input
          className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="예: 에어쿨 프로 넥밴드 선풍기"
          required
        />
      </label>

      {/* 플랫폼 */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">플랫폼</legend>
        <div className="flex gap-4">
          {(["coupang", "naver", "shopify"] as Platform[]).map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="platform"
                value={p}
                checked={platform === p}
                onChange={() => setPlatform(p)}
                className="accent-black"
              />
              <span className="text-sm">{p === "coupang" ? "쿠팡" : p === "naver" ? "네이버" : "Shopify"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 추가정보 + 가이드 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">추가정보</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showGuide ? "가이드 닫기" : "✏️ 뭘 적어야 하나요?"}
            </button>
            <button
              type="button"
              onClick={fillExample}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300"
            >
              예시 채우기
            </button>
          </div>
        </div>

        {/* 6컷 입력 가이드 */}
        {showGuide && (
          <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-blue-800">📋 이 6가지를 적으면 결과물이 확 좋아집니다</p>
            <div className="space-y-1.5 text-xs leading-relaxed">
              <p><span className="font-semibold">1. 타겟/상황</span> — 누가, 어떤 상황에서 쓰나요?</p>
              <p className="text-gray-500 ml-4">예: "출근길 차 안에서 커피를 자주 마시는 직장인"</p>
              <p><span className="font-semibold">2. 가장 빡치는 문제</span> — 고객이 겪는 불편 1개</p>
              <p className="text-gray-500 ml-4">예: "30분이면 미지근해져서 결국 다 버린다"</p>
              <p><span className="font-semibold">3. 핵심 차별점</span> — 경쟁사와 다른 점 1~2개</p>
              <p className="text-gray-500 ml-4">예: "진공 3중 단열 구조, 원터치 누수방지 캡"</p>
              <p><span className="font-semibold">4. 스펙 숫자</span> — 구체적인 수치 2~3개</p>
              <p className="text-gray-500 ml-4">예: "500ml, 316 스테인리스, 12시간 보온"</p>
              <p><span className="font-semibold">5. 불안/반박 포인트</span> — 구매 전 걱정거리</p>
              <p className="text-gray-500 ml-4">예: "세척 어렵지 않나? 냄새 배지 않나?"</p>
              <p><span className="font-semibold">6. 금지 표현</span> — 쓰면 안 되는 말</p>
              <p className="text-gray-500 ml-4">예: "최저가, 업계 1등, 무조건"</p>
            </div>
          </div>
        )}

        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[180px] focus:ring-2 focus:ring-black focus:border-black outline-none"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder={`1. 타겟/상황: 누가, 어떤 상황에서 쓰나요?\n2. 가장 빡치는 문제: 고객이 겪는 불편 1개\n3. 핵심 차별점: 경쟁사와 다른 점 1~2개\n4. 스펙 숫자: 구체적인 수치 2~3개\n5. 불안/반박 포인트: 구매 전 걱정거리\n6. 금지 표현: 쓰면 안 되는 말`}
        />
      </div>

      {/* 생성 버튼 */}
      <button
        disabled={loading}
        className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
      >
        {loading ? "생성 중... (30~60초 소요)" : "상세페이지 생성하기"}
      </button>

      {loading && <ProgressBox stage={stage} />}
    </form>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Platform } from "@/lib/types";
import ProgressBox from "@/components/ProgressBox";

// ============================================================
// 컷 역할 프리셋 정의 (ProductBrain의 핵심 구조)
// ============================================================
type CutRole = {
  id: string;
  label: string;
  purpose: string;
  guide: string;
  placeholder: string;
};

const CUT_PRESETS: Record<4 | 6 | 8 | 10 | 12, CutRole[]> = {
  4: [
    {
      id: "hook",
      label: "첫 문장",
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      guide: "고객이 언제, 어디서 이 상품을 쓰나요? (상황 1-2줄로)",
      placeholder: "예: 출퇴근길 차 안에서 커피를 따뜻하게 마시고 싶을 때",
    },
    {
      id: "problem",
      label: "문제 공감",
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      guide: "기존 제품은 뭐가 불편했나요? (구체적으로 1가지만)",
      placeholder: "예: 30분이면 미지근해져서 계속 데워야 하는 번거로움",
    },
    {
      id: "solution",
      label: "해결/효과",
      purpose: "이 상품의 좋은 점을 쓰는 문장",
      guide: "이 상품 쓰면 뭐가 좋아지나요? (핵심 1-2가지만)",
      placeholder: "예: 진공 3중 단열로 12시간 내내 따뜻함 유지",
    },
    {
      id: "cta",
      label: "구매 유도",
      purpose: "할인/이벤트 정보를 쓰는 문장",
      guide: "지금 사면 뭐가 이득인가요? (할인가, 사은품, 무료배송 등)",
      placeholder: "예: 최저가 46% 할인, 오늘만 1+1 무료배송",
    },
  ],
  6: [
    {
      id: "hook",
      label: "첫 문장",
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      guide: "고객이 언제, 어디서 이 상품을 쓰나요? (상황 1-2줄로)",
      placeholder: "예: 출퇴근길, 등산, 캠핑 등 야외에서 온도 유지가 필요할 때",
    },
    {
      id: "problem",
      label: "문제 공감",
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      guide: "기존 제품은 뭐가 불편했나요? (구체적으로 1가지만)",
      placeholder: "예: 보온병인데 2시간이면 식어서 다시 끓여야 함",
    },
    {
      id: "benefit",
      label: "변화/효과",
      purpose: "이 상품의 좋은 점을 쓰는 문장",
      guide: "경쟁 상품보다 이게 더 좋은 점 2가지만 쓰세요",
      placeholder: "예: 진공 3중 단열로 12시간 보온, 24시간 보냉 둘 다 가능",
    },
    {
      id: "proof",
      label: "근거/신뢰",
      purpose: "믿을 수 있는 이유를 쓰는 문장",
      guide: "믿을 수 있는 근거가 뭔가요? (소재, 인증, 후기 중 1-2개)",
      placeholder: "예: 316 스테인리스 소재, KC인증, 네이버 리뷰 평점 4.8",
    },
    {
      id: "detail",
      label: "상세 정보",
      purpose: "스펙/옵션을 쓰는 문장",
      guide: "고객이 궁금해할 스펙이 뭔가요? (용량, 색상, 크기 등 2-3개)",
      placeholder: "예: 500ml, 블랙/화이트/핑크 3색, 뚜껑 분리 세척 가능",
    },
    {
      id: "cta",
      label: "구매 유도",
      purpose: "할인/이벤트 정보를 쓰는 문장",
      guide: "지금 사면 뭐가 이득인가요? (할인가, 사은품, 무료배송 등)",
      placeholder: "예: 최저가 46% 할인, 오늘만 1+1 무료배송",
    },
  ],
  8: [
    {
      id: "hook",
      label: "첫 문장",
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      guide: "고객이 언제, 어디서 이 상품을 쓰나요? (상황 1-2줄로)",
      placeholder: "예: 출퇴근길 차 안, 사무실 책상, 야외 활동 시",
    },
    {
      id: "problem",
      label: "문제 공감",
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      guide: "기존 제품은 뭐가 불편했나요? (구체적으로 1가지만)",
      placeholder: "예: 1시간만 지나도 미지근해져서 맛이 없음",
    },
    {
      id: "benefit_1",
      label: "핵심 효과 1",
      purpose: "가장 강한 장점 1개를 쓰는 문장",
      guide: "이 상품의 가장 강력한 장점 1가지만 쓰세요",
      placeholder: "예: 진공 3중 단열로 12시간 동안 따뜻함 유지",
    },
    {
      id: "benefit_2",
      label: "핵심 효과 2",
      purpose: "추가 장점 1개를 쓰는 문장",
      guide: "추가로 강조할 장점 1가지 더 쓰세요",
      placeholder: "예: 24시간 냉장 보냉도 가능 (여름철 아이스커피용)",
    },
    {
      id: "proof",
      label: "근거/신뢰",
      purpose: "믿을 수 있는 이유를 쓰는 문장",
      guide: "믿을 수 있는 근거가 뭔가요? (소재, 인증, 후기 중 1-2개)",
      placeholder: "예: 316 스테인리스, KC인증, 누적 판매 10만개",
    },
    {
      id: "detail",
      label: "상세 스펙",
      purpose: "스펙/옵션을 쓰는 문장",
      guide: "고객이 궁금해할 스펙이 뭔가요? (용량, 색상, 크기 등)",
      placeholder: "예: 500ml, 5가지 컬러, 손잡이 있음/없음 선택 가능",
    },
    {
      id: "concern",
      label: "불안 해소",
      purpose: "걱정거리를 해결해주는 문장",
      guide: "고객이 걱정할 만한 점과 해결책을 쓰세요",
      placeholder: "예: 새는 거 아니야? → 밀폐 테스트 100% 통과, 1년 품질보증",
    },
    {
      id: "cta",
      label: "구매 유도",
      purpose: "할인/이벤트 정보를 쓰는 문장",
      guide: "지금 사면 뭐가 이득인가요? (할인가, 사은품, 긴급성)",
      placeholder: "예: 최저가 46% 할인, 오늘 자정까지 1+1",
    },
  ],
  10: [
    {
      id: "hook",
      label: "첫 문장",
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      guide: "고객이 언제, 어디서 이 상품을 쓰나요? (상황 1-2줄로)",
      placeholder: "예: 매일 아침 출근 전 5분 만에 완성하는 스킨케어",
    },
    {
      id: "problem",
      label: "문제 공감",
      purpose: "기존 제품의 불편을 짚는 문장",
      guide: "기존 제품이 뭐가 불편한가요? (구체적으로 1-2가지)",
      placeholder: "예: 기존 선크림은 백탁이 심하고 끈적여서 매일 바르기 싫었다면",
    },
    {
      id: "benefit_1",
      label: "핵심 효과 1",
      purpose: "가장 강력한 장점 1가지를 쓰는 문장",
      guide: "이 상품의 가장 강력한 장점 1가지만 자세히",
      placeholder: "예: 투명하게 발리는 무기자차 선크림, 백탁 제로",
    },
    {
      id: "benefit_2",
      label: "핵심 효과 2",
      purpose: "추가 장점 1가지를 쓰는 문장",
      guide: "추가로 강조할 장점 1가지 더 자세히",
      placeholder: "예: SPF50+ PA++++ 자외선 차단, 12시간 지속력",
    },
    {
      id: "benefit_3",
      label: "핵심 효과 3",
      purpose: "세 번째 장점을 쓰는 문장",
      guide: "또 다른 차별화 포인트 1가지",
      placeholder: "예: 수분감 가득한 촉촉한 마무리, 건조함 없이 하루 종일",
    },
    {
      id: "proof",
      label: "근거/신뢰",
      purpose: "믿을 수 있는 이유를 쓰는 문장",
      guide: "믿을 수 있는 근거가 뭔가요? (소재, 인증, 수치 중 1-2가지)",
      placeholder: "예: 피부과 테스트 완료, 민감성 피부 사용 적합 판정",
    },
    {
      id: "detail",
      label: "상세 스펙",
      purpose: "스펙/옵션을 쓰는 문장",
      guide: "고객이 궁금해할 스펙은? (용량, 성분, 크기 등)",
      placeholder: "예: 50ml, 무향, 비건 인증, 7가지 유해성분 무첨가",
    },
    {
      id: "comparison",
      label: "비교 우위",
      purpose: "경쟁 제품 대비 장점을 쓰는 문장",
      guide: "비슷한 제품과 비교했을 때 뭐가 더 좋은가요?",
      placeholder: "예: A사 제품보다 2배 촉촉, 가격은 30% 저렴",
    },
    {
      id: "concern",
      label: "불안 해소",
      purpose: "걱정거리를 해결해주는 문장",
      guide: "고객이 걱정할 만한 점과 해결책을 자세히",
      placeholder: "예: 트러블 걱정? 비커머제닉 테스트 완료, 30일 환불 보장",
    },
    {
      id: "cta",
      label: "구매 유도",
      purpose: "할인/이벤트 정보를 쓰는 문장",
      guide: "지금 사면 뭐가 이득인가요? (할인가, 사은품, 긴급성)",
      placeholder: "예: 첫 구매 40% 할인 + 미니어처 키트 증정",
    },
  ],
  12: [
    {
      id: "hook",
      label: "첫 문장",
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      guide: "고객이 언제, 어디서 이 상품을 쓰나요? (상황 1-2줄로)",
      placeholder: "예: 새벽 운동 후 단백질 보충이 필요한 순간",
    },
    {
      id: "problem_1",
      label: "문제 공감 1",
      purpose: "기존 제품의 불편 첫 번째",
      guide: "가장 큰 불편 1가지를 구체적으로",
      placeholder: "예: 기존 프로틴은 물에 잘 안 풀려서 덩어리가 남았다면",
    },
    {
      id: "problem_2",
      label: "문제 공감 2",
      purpose: "기존 제품의 불편 두 번째",
      guide: "추가 불편 1가지를 구체적으로",
      placeholder: "예: 맛이 없어서 억지로 마셔야 했다면",
    },
    {
      id: "benefit_1",
      label: "핵심 효과 1",
      purpose: "가장 강력한 장점",
      guide: "이 상품의 가장 강력한 장점 1가지만 자세히",
      placeholder: "예: 3초 쉐이킹으로 완벽 용해, 덩어리 제로",
    },
    {
      id: "benefit_2",
      label: "핵심 효과 2",
      purpose: "두 번째 장점",
      guide: "추가 장점 1가지",
      placeholder: "예: 초코/바닐라/딸기 3가지 맛, 실제 후기 평점 4.9",
    },
    {
      id: "benefit_3",
      label: "핵심 효과 3",
      purpose: "세 번째 장점",
      guide: "또 다른 차별화 포인트",
      placeholder: "예: 1회분 단백질 30g, 칼로리는 120kcal로 부담 없는",
    },
    {
      id: "benefit_4",
      label: "핵심 효과 4",
      purpose: "네 번째 장점",
      guide: "추가 강조 포인트 1가지",
      placeholder: "예: WPC+WPI 혼합으로 흡수율 극대화",
    },
    {
      id: "proof",
      label: "근거/신뢰",
      purpose: "믿을 수 있는 이유",
      guide: "인증, 수상, 판매량 등 신뢰 근거",
      placeholder: "예: HACCP 인증, 누적 판매 100만 봉지 돌파",
    },
    {
      id: "detail",
      label: "상세 스펙",
      purpose: "스펙/옵션 정보",
      guide: "용량, 성분, 맛 종류 등",
      placeholder: "예: 2kg(66회분), 유청단백질 농축분말, 스테비아 감미",
    },
    {
      id: "comparison",
      label: "비교 우위",
      purpose: "경쟁 제품 대비 장점",
      guide: "비슷한 제품과 비교했을 때 뭐가 더 좋은가요?",
      placeholder: "예: 타사 대비 단백질 함량 20% 높고, 1회당 가격 40% 저렴",
    },
    {
      id: "concern",
      label: "불안 해소",
      purpose: "걱정거리를 해결해주는 문장",
      guide: "고객이 걱정할 만한 점과 해결책",
      placeholder: "예: 유당불내증 걱정 없는 WPI 포뮬러, 30일 환불 보장",
    },
    {
      id: "cta",
      label: "구매 유도",
      purpose: "할인/이벤트 정보",
      guide: "지금 사면 뭐가 이득인가요?",
      placeholder: "예: 오늘만 1+1 + 쉐이커 증정, 무료배송",
    },
  ],
};

const MAX_IMAGES = 999; // 실질적 제한 없음 (서버에서 용량 제한)

// ============================================================
// GenerateForm - 3단계 플로우
// ============================================================
export default function GenerateForm({
  userId,
}: {
  userId?: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 상태
  const [productTitle, setProductTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("coupang");
  const [category, setCategory] = useState<string>("electronics");
  const [designStyle, setDesignStyle] = useState<string>("modern_red");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string>("");

  // 2단계 플로우 상태
  const [currentStep, setCurrentStep] = useState(1); // 1: 컷수 선택, 2: 컷별 입력
  const [selectedCutCount, setSelectedCutCount] = useState<4 | 6 | 8 | 10 | 12>(6);
  const [cutInputs, setCutInputs] = useState<Record<string, string>>({});

  // 이미지 핸들러 (제한 없음)
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const updated = [...images, ...files];
    setImages(updated);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Step 진행
  function handleCutCountSelect(count: 4 | 6 | 8 | 10 | 12) {
    setSelectedCutCount(count);
    setCurrentStep(2); // 바로 입력 단계로
  }

  function handleBackToStep1() {
    setCurrentStep(1);
  }

  // 제출
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productTitle.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    setLoading(true);
    setStage("이미지 압축 중...");

    try {
      const formData = new FormData();
      formData.append("product_title", productTitle.trim());
      formData.append("platform", platform);
      formData.append("category", category);
      formData.append("design_style", designStyle);
      
      // 컷별 입력을 additional_info로 변환
      const cutPreset = CUT_PRESETS[selectedCutCount];
      const additionalInfo = cutPreset
        .map((cut, idx) => {
          const input = cutInputs[cut.id] || "";
          return `${idx + 1}. ${cut.label}: ${input || "(미입력)"}`;
        })
        .join("\n");
      
      formData.append("additional_info", additionalInfo);
      formData.append("cut_count", String(selectedCutCount));
      
      if (userId) {
        formData.append("user_id", userId);
      }
      images.forEach((img) => formData.append("images", img));

      setStage("LLM JSON 생성 + 이미지 렌더링 중...");

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error === "no_credits") {
        alert("무료 생성 크레딧을 모두 사용했습니다.");
        setLoading(false);
        setStage("");
        router.refresh();
        return;
      }

      if (!res.ok || !data.ok) throw new Error(data.error ?? "생성 실패");

      router.push(`/generate/${data.generation_id}`);
    } catch (err: any) {
      alert(err?.message ?? "오류가 발생했습니다.");
      setLoading(false);
      setStage("");
    }
  }

  // ============================================================
  // Step 1: 컷 수 선택
  // ============================================================
  if (currentStep === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            이 페이지는 몇 단계로 구성할까요?
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            컷 수는 페이지의 흐름과 설득 깊이를 결정합니다
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { count: 4 as const, label: "4컷", desc: "간단한 전환용" },
            { count: 6 as const, label: "6컷", desc: "가장 많이 쓰는 설득 구조", recommended: true },
            { count: 8 as const, label: "8컷", desc: "정보가 많은 상품용" },
            { count: 10 as const, label: "10컷", desc: "깊은 설득 + 비교까지" },
            { count: 12 as const, label: "12컷", desc: "프리미엄 풀 구성" },
          ].map(({ count, label, desc, recommended }) => (
            <button
              key={count}
              type="button"
              onClick={() => handleCutCountSelect(count)}
              className={`relative rounded-lg border-2 p-4 text-left transition-all hover:border-neutral-900 hover:shadow-md ${
                selectedCutCount === count
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200"
              }`}
            >
              {recommended && (
                <span className="absolute -top-2 right-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                  추천
                </span>
              )}
              <div className="text-lg font-semibold text-neutral-900">{label}</div>
              <div className="mt-1 text-sm text-neutral-600">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // Step 2: 컷별 입력 + 기본 정보
  // ============================================================
  const cutPreset = CUT_PRESETS[selectedCutCount];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 상단 안내 */}
      <div>
        <button
          type="button"
          onClick={handleBackToStep1}
          className="mb-2 text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← 컷 수 다시 선택
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">
          {selectedCutCount}컷 정보 입력
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          각 컷의 역할에 맞는 정보를 입력하세요
        </p>
      </div>

      {/* 기본 정보: 상품명 */}
      <label className="block">
        <span className="text-sm font-medium text-neutral-900">상품명</span>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900"
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="예: 스테인리스 보온 텀블러 500ml"
          required
        />
      </label>

      {/* 플랫폼 */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-900">플랫폼</legend>
        <div className="flex gap-4">
          {(["coupang", "naver", "shopify"] as Platform[]).map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="platform"
                value={p}
                checked={platform === p}
                onChange={() => setPlatform(p)}
                className="accent-neutral-900"
              />
              <span className="text-sm">
                {p === "coupang" ? "쿠팡" : p === "naver" ? "네이버" : "Shopify"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 상품 이미지 — 핵심 영역 */}
      <div className="rounded-xl border-2 border-blue-300 bg-gradient-to-b from-blue-50 to-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg">📸</span>
          <span className="text-sm font-bold text-neutral-900">
            상품 이미지 업로드
          </span>
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            중요
          </span>
          <span className="ml-auto text-xs font-medium text-blue-700">
            {images.length}장 업로드됨
          </span>
        </div>

        <div className="mb-3 rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-900 leading-relaxed">
            이미지가 있으면 상세페이지 완성도가 확 올라갑니다!
          </p>
          <p className="mt-1 text-xs text-blue-700 leading-relaxed">
            제품 사진, 사용 장면, 디테일 컷 등을 올려주세요.
            직접 촬영한 사진이나 AI 이미지 생성 도구로 만든 이미지 모두 사용 가능합니다.
            많이 올릴수록 각 컷에 맞는 이미지가 자동 배치됩니다.
          </p>
        </div>

        {/* 이미지 가이드 태그 */}
        <div className="mb-3 flex flex-wrap gap-2">
          {["대표 제품 사진", "사용 장면", "디테일/소재 컷", "패키지/구성품", "비교 사진"].map((tag) => (
            <span key={tag} className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700">
              {tag}
            </span>
          ))}
        </div>

        {previews.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative h-24 w-24 overflow-hidden rounded-lg border-2 border-blue-200"
              >
                <img
                  src={src}
                  alt={`상품이미지 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-white px-5 py-3 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
          <span className="text-lg">+</span>
          <span>{images.length === 0 ? "이미지 업로드하기" : "이미지 더 추가하기"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </label>

        {images.length === 0 && (
          <p className="mt-2 text-xs text-neutral-400">
            * 이미지 없이도 생성은 가능하지만, 이미지가 비어있는 상세페이지가 만들어집니다
          </p>
        )}
      </div>

      {/* 상품 카테고리 */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-900">상품 카테고리</legend>
        <p className="mb-2 text-xs text-neutral-500">
          카테고리에 맞는 문장 예시와 톤을 제공합니다
        </p>
        <div className="flex flex-wrap gap-3">
          {([
            { value: "electronics", label: "전자/가전", emoji: "💻" },
            { value: "beauty", label: "화장품/뷰티", emoji: "💄" },
            { value: "food", label: "식품", emoji: "🍽️" },
            { value: "fashion", label: "의류/패션", emoji: "👕" },
            { value: "other", label: "기타", emoji: "📦" },
          ] as const).map((cat) => (
            <label
              key={cat.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm transition-all hover:border-neutral-900 ${
                category === cat.value
                  ? "border-neutral-900 bg-neutral-50 font-medium"
                  : "border-neutral-200"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={category === cat.value}
                onChange={() => setCategory(cat.value)}
                className="hidden"
              />
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 디자인 스타일 */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-900">디자인 스타일</legend>
        <p className="mb-2 text-xs text-neutral-500">
          상품 분위기에 맞는 디자인을 선택하세요
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {([
            {
              value: "modern_red",
              label: "모던 레드",
              desc: "강렬한 전환율",
              colors: ["#E6002D", "#1A1A1A", "#FFFFFF"],
            },
            {
              value: "premium_navy",
              label: "프리미엄 네이비",
              desc: "고급 · 신뢰감",
              colors: ["#1B2A4A", "#D4A843", "#F8F6F0"],
            },
            {
              value: "natural_warm",
              label: "내추럴 웜",
              desc: "자연 · 건강",
              colors: ["#3D7A2A", "#B87830", "#FDF8F0"],
            },
            {
              value: "ocean_blue",
              label: "오션 블루",
              desc: "테크 · 전자",
              colors: ["#2563EB", "#BFDBFE", "#F0F5FF"],
            },
            {
              value: "soft_coral",
              label: "소프트 코랄",
              desc: "뷰티 · 코스메틱",
              colors: ["#D4615A", "#F5CCC8", "#FFF0EE"],
            },
            {
              value: "mocha_brown",
              label: "모카 브라운",
              desc: "카페 · 식품",
              colors: ["#6B4226", "#A67C52", "#FAF3ED"],
            },
            {
              value: "slate_dark",
              label: "슬레이트 다크",
              desc: "미니멀 · 모던",
              colors: ["#475569", "#CBD5E1", "#F1F5F9"],
            },
            {
              value: "rose_gold",
              label: "로즈골드",
              desc: "여성 · 프리미엄",
              colors: ["#9B6B5A", "#C4956A", "#FDF4F0"],
            },
          ] as const).map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setDesignStyle(style.value)}
              className={`rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                designStyle === style.value
                  ? "border-neutral-900 shadow-md"
                  : "border-neutral-200"
              }`}
            >
              <div className="mb-2 flex gap-1.5">
                {style.colors.map((c, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full border border-neutral-200"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="text-sm font-semibold text-neutral-900">{style.label}</div>
              <div className="text-xs text-neutral-500">{style.desc}</div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* 컷별 입력 영역 */}
      <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-semibold text-blue-900">
          각 컷에 필요한 정보를 입력하세요
        </h3>
        {cutPreset.map((cut, idx) => (
          <div key={cut.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900">{cut.label}</div>
                <div className="text-xs text-neutral-500">{cut.purpose}</div>
              </div>
            </div>
            <label className="block">
              <span className="text-sm text-neutral-700">{cut.guide}</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                value={cutInputs[cut.id] || ""}
                onChange={(e) =>
                  setCutInputs((prev) => ({ ...prev, [cut.id]: e.target.value }))
                }
                placeholder={cut.placeholder}
                rows={2}
              />
            </label>
          </div>
        ))}
      </div>

      {/* 생성 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "생성 중... (30~60초 소요)" : "상세페이지 생성하기"}
      </button>

      {loading && <ProgressBox stage={stage} />}
    </form>
  );
}

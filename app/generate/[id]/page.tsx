"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import FeedbackBox from "@/components/FeedbackBox";

// ============================================================
// 카테고리별 예시 데이터 (hook, problem만 분기 / 나머지는 범용)
// ============================================================
type CategoryExamples = {
  hook: string[];
  problem: string[];
};

const CATEGORY_EXAMPLES: Record<string, CategoryExamples> = {
  electronics: {
    hook: [
      "앱 전환할 때, 멈칫거림 거의 없는 노트북",
      "카페에서 일하다가도 성능 걱정 없는 이유",
      "20개 탭 열어도 작업 흐름이 안 끊기는 경험",
    ],
    problem: [
      "탭 몇 개만 열어도 팬 소음이 커졌다면",
      "화상회의 중에 화면이 끊겨 당황한 적 있다면",
      "무거운 노트북 때문에 들고 다니기 부담됐다면",
    ],
  },
  beauty: {
    hook: [
      "아침 세안 후, 2분이면 끝나는 기초 루틴",
      "퇴근 후에도 처음 바른 그대로 유지되는 피부",
      "메이크업 전, 이것만 바르면 밀림이 사라지는 경험",
    ],
    problem: [
      "오후만 되면 무너지는 메이크업에 지쳤다면",
      "민감한 피부 때문에 새 제품 시도가 두려웠다면",
      "화장품을 바꿔도 피부 변화를 못 느꼈다면",
    ],
  },
  food: {
    hook: [
      "바쁜 아침, 3분이면 차리는 든든한 한 끼",
      "야근 후 집에서 간단히 즐기는 레스토랑 맛",
      "아이 간식 걱정 없이 꺼내주는 건강한 선택",
    ],
    problem: [
      "배달 음식이 느끼하고 비싸서 고민됐다면",
      "건강한 식단을 챙기고 싶은데 시간이 없다면",
      "맛과 건강 둘 다 포기하기 싫었다면",
    ],
  },
  fashion: {
    hook: [
      "입자마자 핏이 잡히는, 거울 볼 필요 없는 옷",
      "출근부터 퇴근까지, 편하면서 깔끔한 룩",
      "체형 커버와 스타일을 동시에 잡는 한 벌",
    ],
    problem: [
      "온라인으로 사면 핏이 달라서 반품이 잦았다면",
      "편한 옷은 촌스럽고, 예쁜 옷은 불편했다면",
      "세탁 몇 번에 늘어나는 옷에 실망했다면",
    ],
  },
  other: {
    hook: [
      "처음 써보는 순간, 기대 이상이라고 느끼는 경험",
      "매일 쓰는 물건이 이렇게 달라질 수 있다는 걸",
      "한 번 써보면, 이전 제품으로 못 돌아가는 이유",
    ],
    problem: [
      "비슷한 제품을 써봤는데 만족스럽지 않았다면",
      "가격 대비 기대한 만큼의 효과를 못 느꼈다면",
      "좋다는 제품을 사도 뭐가 다른지 모르겠다면",
    ],
  },
};

// 카테고리 기반으로 예시를 가져오는 헬퍼 함수
function getExamplesForCut(
  cutId: string,
  category: string,
  defaultExamples: string[]
): string[] {
  // hook, problem 컷만 카테고리별 분기
  if (cutId === "hook" || cutId === "problem") {
    const catExamples = CATEGORY_EXAMPLES[category];
    if (catExamples) {
      return catExamples[cutId];
    }
  }
  // 나머지 컷은 범용 예시 유지
  return defaultExamples;
}

// ============================================================
// CUT_PRESETS - GenerateForm과 동일한 구조 + why 설명 추가
// ============================================================
type CutRole = {
  id: string;
  label: string;
  purpose: string;
  why: string; // ⓘ 툴팁용 설명
  goal: string; // 🎯 목표
  examples: string[]; // 💡 예시 3개
};

const CUT_PRESETS: Record<4 | 6 | 8, CutRole[]> = {
  4: [
    { 
      id: "hook", 
      label: "첫 문장", 
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      why: "스크롤을 멈추게 만드는 첫 줄입니다. 고객의 '사용 장면'을 먼저 보여주면 읽을 이유가 생깁니다.",
      goal: "고객이 스크롤을 멈추게 만드는 한 문장입니다. 제품 설명이 아니라, 사용 장면이 바로 떠오르는 문장이 좋습니다.",
      examples: [
        "앱 전환할 때, 멈칫거림 거의 없는 노트북",
        "카페에서 일하다가도 성능 걱정 없는 이유",
        "20개 탭 열어도 작업 흐름이 안 끊기는 경험"
      ]
    },
    { 
      id: "problem", 
      label: "문제 공감", 
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      why: "고객이 겪는 불편을 정확히 짚으면 '내 얘기'가 됩니다. 이 컷이 공감을 만들어요.",
      goal: "고객이 '이거 내 얘기네' 하고 고개를 끄덕이게 만드는 문장입니다. 기존 제품의 불편을 구체적인 상황으로 짚어주세요.",
      examples: [
        "탭 몇 개만 열어도 팬 소음이 커졌다면",
        "화상회의 중에 화면이 끊겨 당황한 적 있다면",
        "무거운 노트북 때문에 들고 다니기 부담됐다면"
      ]
    },
    { 
      id: "solution", 
      label: "해결/효과", 
      purpose: "이 상품의 좋은 점을 쓰는 문장",
      why: "문제를 해결해주는 변화를 보여줍니다. 구매 이유가 명확해지는 순간이에요.",
      goal: "이 제품을 쓰면 무엇이 달라지는지를 바로 보여주는 문장입니다. 스펙 나열이 아니라 체감 변화를 말해야 합니다.",
      examples: [
        "작업 중 앱을 옮겨도 흐름이 끊기지 않습니다",
        "장시간 사용해도 화면이 편안하게 느껴집니다",
        "외출할 때 가방 무게가 확실히 가벼워집니다"
      ]
    },
    { 
      id: "cta", 
      label: "구매 유도", 
      purpose: "할인/이벤트 정보를 쓰는 문장",
      why: "지금 구매해야 하는 이유를 만듭니다. 긴급성과 혜택을 동시에 전달해요.",
      goal: "지금 결정해도 괜찮다는 확신을 주는 문장입니다. 과한 할인보다 상황 정리형 문장이 효과적입니다.",
      examples: [
        "지금 필요한 작업용 노트북을 찾고 있다면",
        "성능 때문에 고민하는 시간을 줄이고 싶다면",
        "매일 쓰는 노트북을 바꿀 때가 됐다면"
      ]
    },
  ],
  6: [
    { 
      id: "hook", 
      label: "첫 문장", 
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      why: "스크롤을 멈추게 만드는 첫 줄입니다. 고객의 '사용 장면'을 먼저 보여주면 읽을 이유가 생깁니다.",
      goal: "고객이 스크롤을 멈추게 만드는 한 문장입니다. 제품 설명이 아니라, 사용 장면이 바로 떠오르는 문장이 좋습니다.",
      examples: [
        "앱 전환할 때, 멈칫거림 거의 없는 노트북",
        "카페에서 일하다가도 성능 걱정 없는 이유",
        "20개 탭 열어도 작업 흐름이 안 끊기는 경험"
      ]
    },
    { 
      id: "problem", 
      label: "문제 공감", 
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      why: "고객이 겪는 불편을 정확히 짚으면 '내 얘기'가 됩니다. 이 컷이 공감을 만들어요.",
      goal: "고객이 '이거 내 얘기네' 하고 고개를 끄덕이게 만드는 문장입니다. 기존 제품의 불편을 구체적인 상황으로 짚어주세요.",
      examples: [
        "탭 몇 개만 열어도 팬 소음이 커졌다면",
        "화상회의 중에 화면이 끊겨 당황한 적 있다면",
        "무거운 노트북 때문에 들고 다니기 부담됐다면"
      ]
    },
    { 
      id: "benefit", 
      label: "변화/효과", 
      purpose: "이 상품의 좋은 점을 쓰는 문장",
      why: "상품을 쓴 후 달라지는 모습을 보여줍니다. '나도 이렇게 될 수 있다'는 기대를 만들어요.",
      goal: "이 제품을 쓰면 무엇이 달라지는지를 바로 보여주는 문장입니다. 스펙 나열이 아니라 체감 변화를 말해야 합니다.",
      examples: [
        "작업 중 앱을 옮겨도 흐름이 끊기지 않습니다",
        "장시간 사용해도 화면이 편안하게 느껴집니다",
        "외출할 때 가방 무게가 확실히 가벼워집니다"
      ]
    },
    { 
      id: "proof", 
      label: "근거/신뢰", 
      purpose: "믿을 수 있는 이유를 쓰는 문장",
      why: "고객의 의심을 해소합니다. 검증된 정보나 후기로 신뢰를 쌓아요.",
      goal: "'좋다'는 말을 믿어도 되는 이유를 제시하는 문장입니다. 숫자, 조건, 비교 중 하나만 있어도 충분합니다.",
      examples: [
        "동시에 20개 이상의 앱을 실행해도 안정적입니다",
        "하루 8시간 이상 사용해도 발열이 크지 않습니다",
        "동급 제품 대비 무게를 눈에 띄게 줄였습니다"
      ]
    },
    { 
      id: "detail", 
      label: "상세 정보", 
      purpose: "스펙/옵션을 쓰는 문장",
      why: "구매 결정에 필요한 구체적 정보를 제공합니다. '확인했다'는 안심을 줘요.",
      goal: "구매 전 마지막으로 궁금해할 정보를 정리하는 문장입니다. 기술 설명보다는 사용자 기준 정리가 좋습니다.",
      examples: [
        "문서 작업, 영상 시청, 화상회의에 적합합니다",
        "카페·사무실·집 어디서나 사용하기 좋습니다",
        "출장이나 외근이 잦은 분께 부담 없는 구성입니다"
      ]
    },
    { 
      id: "cta", 
      label: "구매 유도", 
      purpose: "할인/이벤트 정보를 쓰는 문장",
      why: "지금 구매해야 하는 이유를 만듭니다. 긴급성과 혜택을 동시에 전달해요.",
      goal: "지금 결정해도 괜찮다는 확신을 주는 문장입니다. 과한 할인보다 상황 정리형 문장이 효과적입니다.",
      examples: [
        "지금 필요한 작업용 노트북을 찾고 있다면",
        "성능 때문에 고민하는 시간을 줄이고 싶다면",
        "매일 쓰는 노트북을 바꿀 때가 됐다면"
      ]
    },
  ],
  8: [
    { 
      id: "hook", 
      label: "첫 문장", 
      purpose: "고객이 쓰는 상황을 보여주는 문장",
      why: "스크롤을 멈추게 만드는 첫 줄입니다. 고객의 '사용 장면'을 먼저 보여주면 읽을 이유가 생깁니다.",
      goal: "고객이 스크롤을 멈추게 만드는 한 문장입니다. 제품 설명이 아니라, 사용 장면이 바로 떠오르는 문장이 좋습니다.",
      examples: [
        "앱 전환할 때, 멈칫거림 거의 없는 노트북",
        "카페에서 일하다가도 성능 걱정 없는 이유",
        "20개 탭 열어도 작업 흐름이 안 끊기는 경험"
      ]
    },
    { 
      id: "problem", 
      label: "문제 공감", 
      purpose: "기존 제품의 불편한 점을 쓰는 문장",
      why: "고객이 겪는 불편을 정확히 짚으면 '내 얘기'가 됩니다. 이 컷이 공감을 만들어요.",
      goal: "고객이 '이거 내 얘기네' 하고 고개를 끄덕이게 만드는 문장입니다. 기존 제품의 불편을 구체적인 상황으로 짚어주세요.",
      examples: [
        "탭 몇 개만 열어도 팬 소음이 커졌다면",
        "화상회의 중에 화면이 끊겨 당황한 적 있다면",
        "무거운 노트북 때문에 들고 다니기 부담됐다면"
      ]
    },
    { 
      id: "benefit_1", 
      label: "핵심 효과 1", 
      purpose: "가장 강한 장점 1개를 쓰는 문장",
      why: "가장 임팩트 있는 장점을 먼저 보여줍니다. 고객의 핵심 니즈를 정확히 맞춰요.",
      goal: "이 제품의 가장 큰 장점을 바로 보여주는 문장입니다. 하나만 명확하게 전달하세요.",
      examples: [
        "작업 중 앱을 옮겨도 흐름이 끊기지 않습니다",
        "멀티태스킹 속도가 체감상 빨라집니다",
        "동시 작업이 많을수록 차이가 확실합니다"
      ]
    },
    { 
      id: "benefit_2", 
      label: "핵심 효과 2", 
      purpose: "추가 장점 1개를 쓰는 문장",
      why: "보너스 가치를 더합니다. '이것도 되네?'라는 추가 매력 포인트를 만들어요.",
      goal: "추가로 얻을 수 있는 장점을 보여주는 문장입니다. 첫 번째와 다른 각도여야 합니다.",
      examples: [
        "장시간 사용해도 화면이 편안하게 느껴집니다",
        "외출할 때 가방 무게가 확실히 가벼워집니다",
        "배터리 잔량 걱정 없이 하루를 쓸 수 있습니다"
      ]
    },
    { 
      id: "proof", 
      label: "근거/신뢰", 
      purpose: "믿을 수 있는 이유를 쓰는 문장",
      why: "고객의 의심을 해소합니다. 검증된 정보나 후기로 신뢰를 쌓아요.",
      goal: "'좋다'는 말을 믿어도 되는 이유를 제시하는 문장입니다. 숫자, 조건, 비교 중 하나만 있어도 충분합니다.",
      examples: [
        "동시에 20개 이상의 앱을 실행해도 안정적입니다",
        "하루 8시간 이상 사용해도 발열이 크지 않습니다",
        "동급 제품 대비 무게를 눈에 띄게 줄였습니다"
      ]
    },
    { 
      id: "detail", 
      label: "상세 스펙", 
      purpose: "스펙/옵션을 쓰는 문장",
      why: "구매 결정에 필요한 구체적 정보를 제공합니다. '확인했다'는 안심을 줘요.",
      goal: "구매 전 마지막으로 궁금해할 정보를 정리하는 문장입니다. 기술 설명보다는 사용자 기준 정리가 좋습니다.",
      examples: [
        "문서 작업, 영상 시청, 화상회의에 적합합니다",
        "카페·사무실·집 어디서나 사용하기 좋습니다",
        "출장이나 외근이 잦은 분께 부담 없는 구성입니다"
      ]
    },
    { 
      id: "concern", 
      label: "불안 해소", 
      purpose: "걱정거리를 해결해주는 문장",
      why: "마지막 망설임을 없앱니다. '이 정도면 괜찮겠다'는 확신을 줘요.",
      goal: "구매 전 마지막 걱정을 해소하는 문장입니다. A/S, 환불, 품질 등 불안 요소를 다루세요.",
      examples: [
        "초기 불량은 무상 교환이 가능합니다",
        "사용 중 문제 발생 시 빠른 지원을 받을 수 있습니다",
        "품질 검수를 거친 제품만 출고됩니다"
      ]
    },
    { 
      id: "cta", 
      label: "구매 유도", 
      purpose: "할인/이벤트 정보를 쓰는 문장",
      why: "지금 구매해야 하는 이유를 만듭니다. 긴급성과 혜택을 동시에 전달해요.",
      goal: "지금 결정해도 괜찮다는 확신을 주는 문장입니다. 과한 할인보다 상황 정리형 문장이 효과적입니다.",
      examples: [
        "지금 필요한 작업용 노트북을 찾고 있다면",
        "성능 때문에 고민하는 시간을 줄이고 싶다면",
        "매일 쓰는 노트북을 바꿀 때가 됐다면"
      ]
    },
  ],
};

type Generation = {
  id: string;
  user_id: string;
  product_title: string;
  platform: string;
  category: string | null;
  status: string;
  zip_url: string | null;
  generated_json: any;
  edits_remaining: number;
  created_at: string;
  error_message?: string;
  feedback_submitted: boolean;
};

type GenerationAsset = {
  slide_id: string;
  image_url: string;
  width: number;
  height: number;
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [assets, setAssets] = useState<GenerationAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // 수정 기능 상태
  const [openSlideId, setOpenSlideId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [tweak, setTweak] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null); // 툴팁 state
  useEffect(() => {
    async function fetchGeneration() {
      try {
        // 1. generations 테이블에서 기본 정보 조회
        const { data, error: fetchError } = await supabaseBrowser
          .from("generations")
          .select("*")
          .eq("id", generationId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("생성 결과를 찾을 수 없습니다");

        setGeneration(data);
        setFeedbackSubmitted(data.feedback_submitted || false);

        // 2. generation_assets 테이블에서 이미지 조회
        const { data: assetsData, error: assetsError } = await supabaseBrowser
          .from("generation_assets")
          .select("slide_id, image_url, width, height")
          .eq("generation_id", generationId)
          .order("created_at", { ascending: true }); // slide_id 대신 생성 순서로

        if (assetsError) {
          console.error("Assets fetch error:", assetsError);
        } else {
          setAssets(assetsData || []);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "알 수 없는 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    }

    fetchGeneration();
  }, [generationId]);

  // 아코디언 토글 (한 번에 1개만 열림)
  function toggleEdit(slideId: string) {
    setOpenSlideId((prev) => (prev === slideId ? null : slideId));
  }

  // 컷 수정 제출
  async function submitEdit(slideId: string) {
    if (!generation) return;

    setIsSaving((s) => ({ ...s, [slideId]: true }));
    try {
      const res = await fetch("/api/edit-cut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          slide_id: slideId,
          edited_text: draftText[slideId] ?? "",
          tweak: tweak[slideId] ?? null,
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        // 레이트리밋 에러는 특별 처리
        if (res.status === 429) {
          throw new Error(json.error); // "N초 후에 다시 시도해주세요"
        }
        throw new Error(json.error || "수정에 실패했습니다");
      }

      // UI 업데이트
      setAssets((prev) =>
        prev.map((a) =>
          a.slide_id === slideId ? { ...a, image_url: json.image_url } : a
        )
      );
      setOpenSlideId(null);
      setDraftText((d) => ({ ...d, [slideId]: "" }));
      setTweak((t) => ({ ...t, [slideId]: "" }));

      alert("컷이 성공적으로 수정되었습니다!");
    } catch (err: any) {
      alert(err.message || "수정 중 오류가 발생했습니다");
    } finally {
      setIsSaving((s) => ({ ...s, [slideId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-neutral-900">
            불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error || !generation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium text-red-600">오류 발생</div>
          <p className="text-sm text-neutral-600">{error}</p>
          <button
            onClick={() => router.push("/generate")}
            className="mt-4 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            새로 생성하기
          </button>
        </div>
      </div>
    );
  }

  const cutCount = assets.length as 4 | 6 | 8;
  const cutPreset = CUT_PRESETS[cutCount] || CUT_PRESETS[6];
  const currentCategory = generation.category || "electronics";

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        {/* 역할 선언 배너 (최상단) */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h2 className="text-lg font-bold text-blue-900">
              이 화면의 역할
            </h2>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-blue-900">
            이 화면은 이미 만들어진 상세페이지 문장을
            <br />
            <strong>'디자인이 아니라, 문장 기준으로'</strong> 더 잘 읽히게 다듬는 곳입니다.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-700">
              <span>✔</span>
              <span className="font-medium">수정 가능:</span>
              <span>문구 표현 · 톤 · 길이</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-600">
              <span>✖</span>
              <span className="font-medium">수정 불가:</span>
              <span>글꼴 · 색상 · 레이아웃 (다음 업데이트 예정)</span>
            </div>
          </div>
        </div>

        {/* 상단 헤더 */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {generation.product_title}
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {generation.platform} · {cutCount}컷
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
              <div className="text-sm font-medium text-blue-900">
                ✨ 베타: 무제한 수정
              </div>
            </div>
          </div>
        </div>

        {/* 컷 카드 목록 */}
        <div className="space-y-6">
          {assets.map((asset, idx) => {
            // 인덱스 기반으로 컷 역할 매칭
            const cut = cutPreset[idx] || {
              id: asset.slide_id,
              label: `컷 ${idx + 1}`,
              purpose: "상세페이지 문장",
              why: "이 컷의 역할 설명",
              goal: "이 컷의 목표 설명",
              examples: ["예시 문장 1", "예시 문장 2", "예시 문장 3"],
            };

            const isOpen = openSlideId === asset.slide_id;

            return (
              <div
                key={asset.slide_id}
                className="rounded-2xl border border-neutral-200 bg-white p-6"
              >
                {/* 컷 헤더 */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                        {idx + 1}
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {cut.label}
                      </div>

                      {/* ⓘ 툴팁 (state 기반) */}
                      <div className="relative">
                        <button
                          type="button"
                          onMouseEnter={() => setShowTooltip(cut.id)}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-xs font-medium text-neutral-600 hover:border-neutral-900 hover:bg-neutral-50"
                        >
                          i
                        </button>
                        {showTooltip === cut.id && (
                          <div className="absolute left-0 top-8 z-10 w-80 rounded-xl border border-neutral-200 bg-white p-4 text-sm shadow-lg">
                            <div className="mb-2 font-semibold text-neutral-900">
                              왜 이 컷이 필요한가요?
                            </div>
                            <div className="text-neutral-700">{cut.why}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {cut.purpose}
                    </div>
                  </div>

                  {/* 수정 버튼 */}
                  <button
                    type="button"
                    onClick={() => toggleEdit(asset.slide_id)}
                    className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                  >
                    {isOpen ? "닫기" : "이 컷 다듬기"}
                  </button>
                </div>

                {/* 이미지 + 워터마크 */}
                <div className="relative overflow-hidden rounded-lg border border-neutral-200">
                  <img
                    src={asset.image_url}
                    alt={`${cut.label} - ${idx + 1}번째 컷`}
                    className="w-full select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* 워터마크 오버레이 */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-8 opacity-5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="rotate-[-30deg] text-xl font-bold text-black"
                        >
                          {generation.user_id?.substring(0, 8) || "PREVIEW"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 인라인 수정 아코디언 */}
                {isOpen && (
                  <div className="mt-4 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    {/* 목표 */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-blue-900">
                        <span>🎯</span>
                        <span>이 컷의 목표</span>
                      </div>
                      <p className="text-sm leading-relaxed text-blue-800">
                        {cut.goal}
                      </p>
                    </div>

                    {/* 예시 */}
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                      <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-green-900">
                        <span>💡</span>
                        <span>이런 문장이 좋아요</span>
                      </div>
                      <ul className="space-y-1.5">
                        {getExamplesForCut(cut.id, currentCategory, cut.examples).map((example, i) => (
                          <li
                            key={i}
                            className="text-sm text-green-800"
                          >
                            • {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 입력 영역 */}
                    <div>
                      <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-neutral-900">
                        <span>✍️</span>
                        <span>여기서 문장을 다듬어보세요</span>
                      </div>

                      <textarea
                        className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900"
                        rows={4}
                        placeholder="수정하고 싶은 내용을 입력하거나, 아래 버튼으로 톤만 조절하세요"
                        value={draftText[asset.slide_id] ?? ""}
                        onChange={(e) =>
                          setDraftText((d) => ({
                            ...d,
                            [asset.slide_id]: e.target.value,
                          }))
                        }
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="group relative">
                          <button
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                              tweak[asset.slide_id] === "shorter"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-neutral-300 hover:border-neutral-900"
                            }`}
                            onClick={() =>
                              setTweak((t) => ({
                                ...t,
                                [asset.slide_id]:
                                  t[asset.slide_id] === "shorter" ? "" : "shorter",
                              }))
                            }
                          >
                            더 짧게 <span className="text-xs">ⓘ</span>
                          </button>
                          <div className="pointer-events-none absolute bottom-full left-0 mb-1 hidden w-56 rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-700 shadow-lg group-hover:block">
                            문장을 5~7단어 중심으로 압축합니다
                          </div>
                        </div>

                        <div className="group relative">
                          <button
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                              tweak[asset.slide_id] === "direct"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-neutral-300 hover:border-neutral-900"
                            }`}
                            onClick={() =>
                              setTweak((t) => ({
                                ...t,
                                [asset.slide_id]:
                                  t[asset.slide_id] === "direct" ? "" : "direct",
                              }))
                            }
                          >
                            더 직설적으로 <span className="text-xs">ⓘ</span>
                          </button>
                          <div className="pointer-events-none absolute bottom-full left-0 mb-1 hidden w-56 rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-700 shadow-lg group-hover:block">
                            돌려 말하지 않고 장점을 바로 드러냅니다
                          </div>
                        </div>

                        <div className="group relative">
                          <button
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                              tweak[asset.slide_id] === "premium"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-neutral-300 hover:border-neutral-900"
                            }`}
                            onClick={() =>
                              setTweak((t) => ({
                                ...t,
                                [asset.slide_id]:
                                  t[asset.slide_id] === "premium" ? "" : "premium",
                              }))
                            }
                          >
                            더 고급스럽게 <span className="text-xs">ⓘ</span>
                          </button>
                          <div className="pointer-events-none absolute bottom-full left-0 mb-1 hidden w-56 rounded-lg border border-neutral-200 bg-white p-2 text-xs text-neutral-700 shadow-lg group-hover:block">
                            프리미엄 제품에 어울리는 톤으로 다듬습니다
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleEdit(asset.slide_id)}
                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => submitEdit(asset.slide_id)}
                        disabled={
                          isSaving[asset.slide_id] ||
                          (!draftText[asset.slide_id] &&
                            !tweak[asset.slide_id])
                        }
                        className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isSaving[asset.slide_id]
                          ? "재렌더링 중..."
                          : "이 컷 재렌더링"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 피드백 + 다운로드 섹션 */}
        <div className="mt-10 space-y-6">
          {!feedbackSubmitted ? (
            <>
              {/* 피드백 요청 */}
              <FeedbackBox
                generationId={generationId}
                userId={generation.user_id}
                cutCount={cutCount}
                onSubmitSuccess={() => {
                  setFeedbackSubmitted(true);
                  alert("피드백 감사합니다! 다운로드가 가능합니다.");
                }}
              />

              {/* 다운로드 버튼 (비활성화) */}
              <div className="text-center">
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-neutral-300 py-3 text-sm font-medium text-neutral-500"
                >
                  🔒 다운로드 (피드백 제출 후 가능)
                </button>
                <p className="mt-2 text-xs text-neutral-500">
                  다운로드 전에 15초 피드백을 부탁드려요 (초기 100명 품질 개선용)
                </p>
              </div>
            </>
          ) : (
            <>
              {/* 피드백 완료 안내 */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm font-semibold text-green-900">
                  ✓ 피드백 감사합니다!
                </p>
                <p className="mt-1 text-xs text-green-700">
                  서비스 개선에 큰 도움이 됩니다
                </p>
              </div>

              {/* 다운로드 버튼 (활성화) */}
              <div className="flex gap-4">
                {generation.zip_url ? (
                  <a
                    href={generation.zip_url}
                    download
                    className="flex-1 rounded-lg bg-neutral-900 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    전체 다운로드 (ZIP)
                  </a>
                ) : (
                  <button
                    onClick={() => alert("ZIP 파일 생성 기능 준비 중입니다")}
                    className="flex-1 rounded-lg bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    전체 다운로드 (ZIP)
                  </button>
                )}
                <button
                  onClick={() => router.push("/generate")}
                  className="flex-1 rounded-lg border border-neutral-300 py-3 text-sm font-medium hover:bg-neutral-50"
                >
                  새로 생성하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

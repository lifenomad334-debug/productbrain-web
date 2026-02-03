"use client";

import { useState } from "react";

const QUALITY_TAGS = [
  { id: "great_hook", label: "시작 문장이 꽂힌다", positive: true },
  { id: "clear_structure", label: "구조가 깔끔하다", positive: true },
  { id: "ready_to_upload", label: "바로 쓸 수 있다", positive: true },
  { id: "good_tone", label: "톤이 잘 맞는다", positive: true },
  { id: "too_generic", label: "너무 뻔한 표현이 많다", positive: false },
  { id: "too_long", label: "불필요하게 길다", positive: false },
  { id: "wrong_tone", label: "톤/분위기가 안 맞다", positive: false },
  { id: "missing_info", label: "내가 쓴 정보가 반영 안 됐다", positive: false },
  { id: "not_trustworthy", label: "신뢰감이 부족하다", positive: false },
  { id: "layout_issue", label: "레이아웃/디자인이 아쉽다", positive: false },
];

const USAGE_OPTIONS = [
  { id: "use_asis", label: "✅ 이대로 쓸 것 같다" },
  { id: "use_with_edit", label: "✏️ 약간 수정 후 쓸 것 같다" },
  { id: "not_use", label: "❌ 쓰기 어렵다" },
];

export default function FeedbackBox({ generationId }: { generationId: string }) {
  const [step, setStep] = useState(0); // 0: 초대, 1: 평가, 2: 태그, 3: 사용여부, 4: 코멘트, 5: 완료
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [usageIntent, setUsageIntent] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit() {
    if (rating === null) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          rating,
          tags: selectedTags,
          comment: [
            usageIntent ? `[사용의향: ${usageIntent}]` : "",
            comment.trim(),
          ].filter(Boolean).join(" "),
        }),
      });

      if (res.ok) {
        setStep(5);
      }
    } catch {
      alert("피드백 전송에 실패했습니다.");
    }

    setSubmitting(false);
  }

  // Step 5: 완료
  if (step === 5) {
    return (
      <div className="border rounded-2xl p-8 bg-green-50 border-green-200 text-center">
        <div className="text-3xl mb-3">🎉</div>
        <p className="text-base font-bold text-green-800">소중한 피드백 감사합니다!</p>
        <p className="text-sm text-green-600 mt-2">
          보내주신 의견은 결과물 품질을 높이는 데 직접 반영됩니다.
        </p>
      </div>
    );
  }

  // Step 0: 참여 유도
  if (step === 0) {
    return (
      <div className="border rounded-2xl p-6 bg-gray-50 border-gray-200">
        <div className="text-center space-y-3">
          <p className="text-lg font-bold">30초만 투자해주세요 💬</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            이 결과물에 대한 솔직한 평가가<br />
            <strong>다음 생성 품질을 직접 결정</strong>합니다.
          </p>
          <button
            onClick={() => setStep(1)}
            className="mt-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            피드백 남기기
          </button>
          <p className="text-xs text-gray-400">익명으로 수집되며, 품질 개선에만 사용됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-6 bg-gray-50 border-gray-200 space-y-6">
      {/* 상단 진행률 */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? "bg-black" : "bg-gray-200"
            }`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">{step}/4</span>
      </div>

      {/* Step 1: 점수 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold mb-1">전체적으로 어떠셨나요?</p>
            <p className="text-xs text-gray-500">이 결과물의 완성도를 평가해주세요</p>
          </div>
          <div className="flex gap-2 justify-center">
            {[
              { n: 1, emoji: "😞", label: "별로" },
              { n: 2, emoji: "😐", label: "부족" },
              { n: 3, emoji: "🙂", label: "보통" },
              { n: 4, emoji: "😊", label: "좋음" },
              { n: 5, emoji: "🤩", label: "최고" },
            ].map((item) => (
              <button
                key={item.n}
                onClick={() => { setRating(item.n); setStep(2); }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105 ${
                  rating === item.n
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 태그 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold mb-1">어떤 점이 좋거나 아쉬웠나요?</p>
            <p className="text-xs text-gray-500">해당하는 항목을 모두 선택해주세요 (복수 선택)</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-green-700 mb-2">👍 좋았던 점</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {QUALITY_TAGS.filter(t => t.positive).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-2 rounded-full border transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-green-400"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-red-600 mb-2">👎 아쉬운 점</p>
            <div className="flex flex-wrap gap-2">
              {QUALITY_TAGS.filter(t => !t.positive).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-2 rounded-full border transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white border-gray-200 text-gray-600 hover:border-red-400"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            다음
          </button>
        </div>
      )}

      {/* Step 3: 사용 의향 */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold mb-1">이 결과물을 실제로 사용하실 건가요?</p>
            <p className="text-xs text-gray-500">가장 가까운 항목을 선택해주세요</p>
          </div>

          <div className="space-y-2">
            {USAGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setUsageIntent(opt.id); setStep(4); }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  usageIntent === opt.id
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: 자유 의견 + 제출 */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <p className="text-base font-bold mb-1">추가로 하고 싶은 말이 있다면?</p>
            <p className="text-xs text-gray-500">구체적일수록 결과물이 빠르게 좋아집니다 (선택)</p>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-black focus:border-black outline-none"
            placeholder="예: 후기 부분이 너무 뻔해요. 실제 후기 톤으로 바꿔주면 좋겠어요."
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-black text-white rounded-lg py-3 text-sm font-semibold disabled:opacity-60 hover:bg-gray-800 transition-colors"
          >
            {submitting ? "전송 중..." : "피드백 보내기 🚀"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full text-xs text-gray-400 hover:text-gray-600"
          >
            건너뛰고 바로 제출
          </button>
        </div>
      )}
    </div>
  );
}

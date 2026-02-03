"use client";

import { useState } from "react";

const REASON_TAGS = [
  { id: "great_hook", label: "🎯 시작 문장이 좋음" },
  { id: "clear_structure", label: "📋 구조가 명확함" },
  { id: "ready_to_upload", label: "✅ 바로 쓸 수 있음" },
  { id: "too_generic", label: "😐 너무 일반적임" },
  { id: "too_long", label: "📏 너무 길다" },
  { id: "not_trustworthy", label: "🤔 신뢰감 부족" },
  { id: "wrong_tone", label: "🗣️ 톤이 안 맞음" },
  { id: "missing_info", label: "❓ 정보가 부족함" },
];

export default function FeedbackBox({ generationId }: { generationId: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert("피드백 전송에 실패했습니다.");
    }

    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="border rounded-xl p-6 bg-green-50 border-green-200 text-center">
        <div className="text-2xl mb-2">🙏</div>
        <p className="text-sm font-medium text-green-800">피드백 감사합니다!</p>
        <p className="text-xs text-green-600 mt-1">더 좋은 결과물을 만드는 데 사용됩니다.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-6 bg-gray-50 space-y-5">
      <div>
        <p className="text-sm font-semibold mb-3">이 결과물은 어떠셨나요?</p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                rating === n
                  ? "bg-black text-white scale-110"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-black"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
          <span>별로</span>
          <span>최고</span>
        </div>
      </div>

      {rating !== null && (
        <>
          <div>
            <p className="text-sm font-medium mb-2">해당하는 항목을 선택해주세요</p>
            <div className="flex flex-wrap gap-2">
              {REASON_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selectedTags.includes(tag.id)
                      ? "bg-black text-white border-black"
                      : "bg-white border-gray-300 text-gray-600 hover:border-black"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">추가 의견 (선택)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-black focus:border-black outline-none"
              placeholder="개선했으면 하는 점이나 좋았던 점을 자유롭게 적어주세요."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
          >
            {submitting ? "전송 중..." : "피드백 보내기"}
          </button>
        </>
      )}
    </div>
  );
}

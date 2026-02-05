"use client";

import { useState } from "react";

// CUT_PRESETS - GenerateForm/ResultPage와 동일 (소스 오브 트루스)
type CutRole = {
  id: string;
  label: string;
};

const CUT_PRESETS: Record<4 | 6 | 8, CutRole[]> = {
  4: [
    { id: "hook", label: "첫 문장" },
    { id: "problem", label: "문제 공감" },
    { id: "solution", label: "해결/효과" },
    { id: "cta", label: "구매 유도" },
  ],
  6: [
    { id: "hook", label: "첫 문장" },
    { id: "problem", label: "문제 공감" },
    { id: "benefit", label: "변화/효과" },
    { id: "proof", label: "근거/신뢰" },
    { id: "detail", label: "상세 정보" },
    { id: "cta", label: "구매 유도" },
  ],
  8: [
    { id: "hook", label: "첫 문장" },
    { id: "problem", label: "문제 공감" },
    { id: "benefit_1", label: "핵심 효과 1" },
    { id: "benefit_2", label: "핵심 효과 2" },
    { id: "proof", label: "근거/신뢰" },
    { id: "detail", label: "상세 스펙" },
    { id: "concern", label: "불안 해소" },
    { id: "cta", label: "구매 유도" },
  ],
};

type FeedbackBoxProps = {
  generationId: string;
  userId: string | null;
  cutCount: 4 | 6 | 8;
  onSubmitSuccess: () => void;
};

export default function FeedbackBox({
  generationId,
  userId,
  cutCount,
  onSubmitSuccess,
}: FeedbackBoxProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: 점수
  const [score, setScore] = useState<number | null>(null);

  // Step 2: 약한 컷
  const [weakCuts, setWeakCuts] = useState<string[]>([]);

  // Step 2-1: 약한 이유 (NEW)
  const [weakCutReasons, setWeakCutReasons] = useState<string[]>([]);

  // Step 3: 업로드 의향 + 이유
  const [uploadIntent, setUploadIntent] = useState<string>("");
  const [uploadReason, setUploadReason] = useState<string>("");

  // Step 4: 유료 의향
  const [paidIntent, setPaidIntent] = useState<string>("");

  // Step 5: 보강 희망 사항 (NEW)
  const [improvementAreas, setImprovementAreas] = useState<string[]>([]);
  const [improvementOther, setImprovementOther] = useState<string>("");

  const cutPreset = CUT_PRESETS[cutCount];

  // 약한 컷 토글
  function toggleWeakCut(cutId: string) {
    setWeakCuts((prev) =>
      prev.includes(cutId) ? prev.filter((id) => id !== cutId) : [...prev, cutId]
    );
  }

  // 약한 이유 토글 (NEW)
  function toggleWeakCutReason(reason: string) {
    setWeakCutReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  // 개선 영역 토글 (NEW)
  function toggleImprovementArea(area: string) {
    setImprovementAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  // 다음 단계
  function handleNext() {
    if (step === 1 && score === null) {
      alert("점수를 선택해주세요");
      return;
    }
    if (step === 3 && !uploadIntent) {
      alert("업로드 의향을 선택해주세요");
      return;
    }
    // 조건 없이 다음 단계로 (2 → 2.5, 2.5 → 3 등)
    if (step === 2) {
      setStep(2.5);
    } else if (step === 2.5) {
      setStep(3);
    } else {
      setStep(step + 1);
    }
  }

  // 최종 제출
  async function handleSubmit() {
    if (step !== 5) {
      alert("모든 단계를 완료해주세요");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          user_id: userId,
          score,
          weak_cuts: weakCuts,
          weak_cut_reasons: weakCutReasons,
          upload_intent: uploadIntent,
          upload_reason: uploadReason,
          paid_intent: paidIntent,
          improvement_areas: improvementAreas,
          improvement_other: improvementOther,
        }),
      });

      if (!res.ok) throw new Error("피드백 저장 실패");

      onSubmitSuccess();
    } catch (err: any) {
      alert(err.message || "오류가 발생했습니다");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      {/* 진행 표시 */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          피드백 ({step === 2.5 ? 3 : step > 2.5 ? Math.ceil(step) + 1 : Math.ceil(step)}/6)
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => {
            const currentStepNum = step === 2.5 ? 3 : step > 2.5 ? Math.ceil(step) + 1 : Math.ceil(step);
            return (
              <div
                key={s}
                className={`h-2 w-2 rounded-full ${
                  s <= currentStepNum ? "bg-blue-600" : "bg-neutral-200"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Step 1: 점수 */}
      {step === 1 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            생성된 결과에 얼마나 만족하시나요?
          </p>
          <div className="mb-6 flex gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScore(s)}
                className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl transition-all ${
                  score === s
                    ? "border-blue-600 bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {s <= (score || 0) ? "⭐" : "☆"}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={score === null}
              className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 약한 컷 */}
      {step === 2 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            어떤 컷이 약했나요? (여러 개 선택 가능, 선택 안 해도 됨)
          </p>
          <div className="mb-6 space-y-2">
            {cutPreset.map((cut, idx) => (
              <label
                key={cut.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={weakCuts.includes(cut.id)}
                  onChange={() => toggleWeakCut(cut.id)}
                  className="h-5 w-5 accent-blue-600"
                />
                <span className="text-sm text-neutral-900">
                  {idx + 1}. {cut.label}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 2-1: 약한 이유 (NEW) */}
      {step === 2.5 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            {weakCuts.length > 0 
              ? "어떤 부분이 아쉬웠나요? (여러 개 선택 가능)"
              : "일반적으로 어떤 부분이 개선되면 좋을까요? (여러 개 선택 가능, 선택 안 해도 됨)"
            }
          </p>
          <div className="mb-6 space-y-2">
            {[
              { value: "length", label: "텍스트 길이 (너무 길거나 짧음)" },
              { value: "tone", label: "톤/뉘앙스 (너무 딱딱하거나 가벼움)" },
              { value: "persuasion", label: "설득력 (공감이 안 됨)" },
              { value: "image_quality", label: "이미지 품질" },
              { value: "lack_info", label: "정보 부족" },
              { value: "other", label: "기타" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={weakCutReasons.includes(option.value)}
                  onChange={() => toggleWeakCutReason(option.value)}
                  className="h-5 w-5 accent-blue-600"
                />
                <span className="text-sm text-neutral-900">{option.label}</span>
              </label>
            ))}
          </div>

          {weakCutReasons.includes("other") && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                기타 의견을 알려주세요
              </label>
              <textarea
                value={uploadReason}
                onChange={(e) => setUploadReason(e.target.value)}
                placeholder="예: 폰트가 너무 작아요, 레이아웃이 답답해요"
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
            >
              이전
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 업로드 의향 */}
      {step === 3 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            실제 판매 페이지에 업로드하시겠어요?
          </p>
          <div className="mb-4 space-y-2">
            {[
              { value: "yes", label: "예, 바로 쓸게요" },
              { value: "edit", label: "수정 후 쓸 것 같아요" },
              { value: "no", label: "아니요, 안 쓸 것 같아요" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="radio"
                  name="upload"
                  value={option.value}
                  checked={uploadIntent === option.value}
                  onChange={(e) => setUploadIntent(e.target.value)}
                  className="h-5 w-5 accent-blue-600"
                />
                <span className="text-sm text-neutral-900">{option.label}</span>
              </label>
            ))}
          </div>

          {uploadIntent === "no" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                어떤 점이 부족했나요?
              </label>
              <textarea
                value={uploadReason}
                onChange={(e) => setUploadReason(e.target.value)}
                placeholder="예: 톤이 너무 딱딱해요, 이미지 품질이 아쉬워요"
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
            >
              이전
            </button>
            <button
              onClick={handleNext}
              disabled={!uploadIntent}
              className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 유료 의향 */}
      {step === 4 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            유료로 전환된다면 사용하시겠어요?
          </p>
          <div className="mb-6 space-y-2">
            {[
              { value: "yes", label: "네, 계속 쓸게요" },
              { value: "maybe", label: "가격 보고 결정할게요" },
              { value: "no", label: "아니요, 무료만 쓸게요" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="radio"
                  name="paid"
                  value={option.value}
                  checked={paidIntent === option.value}
                  onChange={(e) => setPaidIntent(e.target.value)}
                  className="h-5 w-5 accent-blue-600"
                />
                <span className="text-sm text-neutral-900">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
            >
              이전
            </button>
            <button
              onClick={() => {
                if (!paidIntent) {
                  alert("유료 의향을 선택해주세요");
                  return;
                }
                setStep(5);
              }}
              className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Step 5: 보강 희망 사항 (NEW) */}
      {step === 5 && (
        <div>
          <p className="mb-4 text-sm font-medium text-neutral-900">
            ProductBrain에서 가장 보강되었으면 하는 것은? (여러 개 선택 가능)
          </p>
          <div className="mb-4 space-y-2">
            {[
              { value: "tone", label: "더 자연스러운 톤 (AI 티 줄이기)" },
              { value: "image_quality", label: "이미지 품질 향상" },
              { value: "cut_variety", label: "컷 구조 다양화 (4/6/8컷 외 옵션)" },
              { value: "edit_feature", label: "수정 기능 (텍스트/이미지 수정)" },
              { value: "template_variety", label: "템플릿 다양화 (디자인 스타일)" },
              { value: "speed", label: "더 빠른 생성 속도" },
              { value: "other", label: "기타" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={improvementAreas.includes(option.value)}
                  onChange={() => toggleImprovementArea(option.value)}
                  className="h-5 w-5 accent-blue-600"
                />
                <span className="text-sm text-neutral-900">{option.label}</span>
              </label>
            ))}
          </div>

          {improvementAreas.includes("other") && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                기타 의견을 알려주세요
              </label>
              <textarea
                value={improvementOther}
                onChange={(e) => setImprovementOther(e.target.value)}
                placeholder="예: 특정 카테고리 전용 템플릿, 더 많은 언어 지원 등"
                className="w-full rounded-lg border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900"
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(4)}
              className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium hover:bg-neutral-50"
            >
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {submitting ? "제출 중..." : "제출 완료"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

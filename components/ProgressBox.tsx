"use client";

import { useEffect, useState } from "react";

type ProgressStep = {
  id: string;
  label: string;
  duration: number; // 예상 소요 시간 (초)
};

const PROGRESS_STEPS: ProgressStep[] = [
  { id: "upload", label: "이미지 업로드 중", duration: 3 },
  { id: "analyze", label: "상품 정보 분석 중", duration: 8 },
  { id: "generate", label: "AI가 설득 문구 생성 중", duration: 12 },
  { id: "validate", label: "품질 검증 중", duration: 5 },
  { id: "render", label: "이미지 렌더링 중", duration: 10 },
  { id: "finalize", label: "최종 처리 중", duration: 2 },
];

const TOTAL_DURATION = PROGRESS_STEPS.reduce((sum, step) => sum + step.duration, 0);

export default function ProgressBox({ stage }: { stage: string }) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // 자동 진행 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // 95%에서 멈춤 (실제 완료는 서버 응답 대기)
        return prev + (100 / TOTAL_DURATION) * 0.5; // 0.5초마다 증가
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 진행률에 따라 현재 단계 업데이트
    let elapsed = 0;
    for (let i = 0; i < PROGRESS_STEPS.length; i++) {
      elapsed += PROGRESS_STEPS[i].duration;
      const stepProgress = (elapsed / TOTAL_DURATION) * 100;
      if (progress < stepProgress) {
        setCurrentStepIndex(i);
        break;
      }
    }
  }, [progress]);

  const currentStep = PROGRESS_STEPS[currentStepIndex];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      {/* 상단 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-blue-900">상세페이지 생성 중...</h3>
        <span className="text-2xl font-bold text-blue-600">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 단계별 리스트 */}
      <div className="space-y-2">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-sm transition-all ${
                isCurrent
                  ? "font-semibold text-blue-900"
                  : isCompleted
                    ? "text-blue-700"
                    : "text-blue-400"
              }`}
            >
              {/* 아이콘 */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                      ? "border-2 border-blue-600 bg-white text-blue-600"
                      : "border-2 border-blue-300 bg-white text-blue-300"
                }`}
              >
                {isCompleted ? (
                  <span>✓</span>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>

              {/* 라벨 */}
              <span className="flex-1">{step.label}</span>

              {/* 애니메이션 (현재 단계만) */}
              {isCurrent && (
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600" />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 rounded-lg bg-white p-3 text-xs text-neutral-600">
        <p className="flex items-start gap-2">
          <span>💡</span>
          <span>
            고품질 결과를 위해 AI가 꼼꼼하게 작업 중입니다. 보통 30-60초 정도
            소요됩니다.
          </span>
        </p>
      </div>
    </div>
  );
}

// components/GlobalStyleToolbar.tsx
"use client";

import { useRef } from "react";
import type { CutId, PendingStyle } from "@/utils/styleOverrides";
import { SCALE_PRESETS, COLOR_PRESETS, getAppliedStyle } from "@/utils/styleOverrides";

type CutTab = { id: string; label: string };

type Props = {
  cuts: CutTab[];
  activeCut: CutId;
  setActiveCut: (id: CutId) => void;
  pending: PendingStyle;
  setPending: (p: PendingStyle) => void;
  editedJson: any;
  onApply: () => void;
  onReset: () => void;
  cooldownRemaining: number;
  isRendering: boolean;
};

export default function GlobalStyleToolbar({
  cuts,
  activeCut,
  setActiveCut,
  pending,
  setPending,
  editedJson,
  onApply,
  onReset,
  cooldownRemaining,
  isRendering,
}: Props) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const isDirty = pending.fontScale !== undefined || pending.textColor !== undefined;
  const applied = getAppliedStyle(editedJson, activeCut);

  const handleTabChange = (id: CutId) => {
    setActiveCut(id);
    setPending({});
  };

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
      {/* 1줄: 컷 탭 (가로 스크롤) */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-sm font-semibold text-neutral-700">✏️ 스타일</span>
        <div
          ref={tabsRef}
          className="flex flex-1 items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            onClick={() => handleTabChange("ALL")}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCut === "ALL"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            전체
          </button>
          {cuts.map((cut) => (
            <button
              key={cut.id}
              type="button"
              onClick={() => handleTabChange(cut.id)}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                activeCut === cut.id
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {cut.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2줄: 크기 + 색상 + 액션 */}
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        {/* 글씨 크기 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-500">크기</span>
          {SCALE_PRESETS.map((s) => {
            const isSelected = pending.fontScale === s.value;
            const isApplied = !isSelected && applied.fontScale === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setPending({ ...pending, fontScale: s.value })}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : isApplied
                      ? "border-blue-300 bg-blue-50/50 text-blue-600"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        {/* 텍스트 색상 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-500">색상</span>
          {COLOR_PRESETS.map((c) => {
            const isSelected = pending.textColor === c.value;
            const isApplied = !isSelected && applied.textColor === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setPending({ ...pending, textColor: c.value })}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-200 scale-110"
                    : isApplied
                      ? "border-blue-300 ring-1 ring-blue-100"
                      : "border-neutral-300 hover:border-neutral-500 hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {isSelected && (
                  <span className="flex h-full w-full items-center justify-center">
                    <svg
                      className={`h-3 w-3 ${
                        c.value === "#FFFFFF" || c.value === "#F59E0B" ? "text-neutral-800" : "text-white"
                      }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-neutral-200" />

        {/* 액션 */}
        <div className="flex items-center gap-2">
          {(applied.fontScale || applied.textColor) && (
            <div className="flex items-center gap-1">
              {applied.fontScale && (
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                  ×{applied.fontScale}
                </span>
              )}
              {applied.textColor && (
                <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-neutral-300" style={{ background: applied.textColor }} />
              )}
            </div>
          )}
          {isDirty && <span className="text-[10px] font-semibold text-amber-600">● 변경</span>}
          <button type="button" onClick={onReset} className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100">기본값</button>
          <button
            type="button"
            onClick={onApply}
            disabled={!isDirty || isRendering || cooldownRemaining > 0}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              !isDirty || isRendering || cooldownRemaining > 0
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRendering ? "렌더 중..." : cooldownRemaining > 0 ? `${cooldownRemaining}초` : activeCut === "ALL" ? "전체 적용" : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}

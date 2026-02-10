// components/GlobalStyleToolbar.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  GroupConfig,
  StyleGroupKey,
  StyleProps,
} from "@/utils/styleOverrides";
import { groupConfigs } from "@/utils/styleOverrides";

type Props = {
  editedJson: any;
  onApply: (group: StyleGroupKey, patch: StyleProps) => void;
  onApplyAndRender: () => Promise<void>;
  cooldownRemaining: number;
  isRendering: boolean;
};

export default function GlobalStyleToolbar({
  editedJson,
  onApply,
  onApplyAndRender,
  cooldownRemaining,
  isRendering,
}: Props) {
  const [activeGroup, setActiveGroup] = useState<StyleGroupKey>("hero");
  const [pending, setPending] = useState<StyleProps>({});

  const isDirty = useMemo(
    () => !!(pending.fontSize || pending.color),
    [pending]
  );

  const cfg = groupConfigs[activeGroup];

  // 현재 그룹에 적용된 오버라이드 표시용
  const appliedStyle = useMemo(() => {
    const ov = editedJson?.style_overrides || {};
    // 그룹 내 첫 번째 키의 값을 대표로 표시
    const sampleKey = Object.keys(ov).find((k) =>
      cfg.keyPrefixes.some((p) => k.startsWith(p))
    );
    return sampleKey ? ov[sampleKey] : {};
  }, [editedJson, cfg]);

  const handleApply = async () => {
    if (!isDirty) return;
    onApply(activeGroup, pending);
    setPending({});
    await onApplyAndRender();
  };

  const handleReset = () => {
    // 빈 문자열로 보내서 해당 그룹의 overrides 제거
    onApply(activeGroup, { fontSize: "", color: "" });
    setPending({});
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* 1줄: 그룹 탭 + 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-sm font-semibold text-neutral-700">
            ✏️ 스타일
          </span>
          {(["hero", "section", "body"] as StyleGroupKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setActiveGroup(k);
                setPending({});
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeGroup === k
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {groupConfigs[k].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* 적용된 스타일 표시 */}
          {appliedStyle.fontSize && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {appliedStyle.fontSize}
            </span>
          )}
          {appliedStyle.color && (
            <span
              className="inline-block h-4 w-4 rounded-full ring-1 ring-blue-400"
              style={{ background: appliedStyle.color }}
            />
          )}

          {isDirty && (
            <span className="text-xs font-medium text-amber-600">● 변경됨</span>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
          >
            기본값
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!isDirty || isRendering || cooldownRemaining > 0}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              !isDirty || isRendering || cooldownRemaining > 0
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRendering
              ? "렌더 중..."
              : cooldownRemaining > 0
                ? `${cooldownRemaining}초 후`
                : "적용"}
          </button>
        </div>
      </div>

      {/* 2줄: 폰트 크기 + 색상 */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* 폰트 크기 */}
        <div className="rounded-xl bg-neutral-50 p-3">
          <div className="mb-2 text-xs font-semibold text-neutral-500">
            폰트 크기
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cfg.fontSizePresets.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPending((p) => ({ ...p, fontSize: size }))}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  pending.fontSize === size
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                {size.replace("px", "")}
              </button>
            ))}
          </div>
        </div>

        {/* 색상 */}
        <div className="rounded-xl bg-neutral-50 p-3">
          <div className="mb-2 text-xs font-semibold text-neutral-500">
            텍스트 색상
          </div>
          <div className="flex flex-wrap gap-2">
            {cfg.colorPresets.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setPending((p) => ({ ...p, color: c.value }))}
                className={`group relative h-7 w-7 rounded-full border-2 transition-all ${
                  pending.color === c.value
                    ? "border-blue-500 ring-2 ring-blue-200 scale-110"
                    : "border-neutral-300 hover:border-neutral-500 hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {/* 선택 체크 표시 */}
                {pending.color === c.value && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className={`h-3.5 w-3.5 ${
                        c.value === "#FFFFFF" || c.value === "#F59E0B"
                          ? "text-neutral-800"
                          : "text-white"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

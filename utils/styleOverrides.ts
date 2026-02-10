// utils/styleOverrides.ts
// ============================================================
// 스타일 오버라이드 v2: global/cuts + fontScale
// ============================================================

export type PendingStyle = {
  fontScale?: number;   // 0.9, 1.0, 1.1, 1.2
  textColor?: string;   // hex color
};

export type StyleOverridesV2 = {
  global?: PendingStyle;
  cuts?: Record<string, PendingStyle>;
};

export type CutId = "ALL" | string;

// ── 컷 라벨 매핑 (셀러 친화) ──
export function getCutLabel(slideId: string): string {
  const MAP: Record<string, string> = {
    hero: "메인",
    "problem-benefits": "문제/장점",
    "selection-reasons": "선택이유",
    specs: "스펙",
    faq: "FAQ",
    cta: "구매유도",
  };
  if (MAP[slideId]) return MAP[slideId];
  if (slideId.startsWith("details-")) {
    const num = slideId.split("-")[1];
    return `상세${num}`;
  }
  return slideId;
}

// ── style_overrides 업데이트 ──
export function updateStyleOverridesV2(
  prevJson: any,
  activeCut: CutId,
  pending: PendingStyle
): any {
  const prev: StyleOverridesV2 = prevJson.style_overrides || {};
  const next: StyleOverridesV2 = {
    global: { ...(prev.global || {}) },
    cuts: { ...(prev.cuts || {}) },
  };

  if (activeCut === "ALL") {
    if (pending.fontScale !== undefined) {
      if (pending.fontScale === 1.0) delete next.global!.fontScale;
      else next.global!.fontScale = pending.fontScale;
    }
    if (pending.textColor !== undefined) {
      if (pending.textColor === "") delete next.global!.textColor;
      else next.global!.textColor = pending.textColor;
    }
  } else {
    const cutStyle = { ...(next.cuts![activeCut] || {}) };
    if (pending.fontScale !== undefined) {
      if (pending.fontScale === 1.0) delete cutStyle.fontScale;
      else cutStyle.fontScale = pending.fontScale;
    }
    if (pending.textColor !== undefined) {
      if (pending.textColor === "") delete cutStyle.textColor;
      else cutStyle.textColor = pending.textColor;
    }
    if (Object.keys(cutStyle).length === 0) delete next.cuts![activeCut];
    else next.cuts![activeCut] = cutStyle;
  }

  // 빈 객체 정리
  if (next.global && Object.keys(next.global).length === 0) delete next.global;
  if (next.cuts && Object.keys(next.cuts).length === 0) delete next.cuts;

  const nextJson = { ...prevJson };
  if (!next.global && !next.cuts) {
    delete nextJson.style_overrides;
  } else {
    nextJson.style_overrides = next;
  }
  return nextJson;
}

// ── 리셋 ──
export function resetStyleOverrides(prevJson: any, activeCut: CutId): any {
  const prev: StyleOverridesV2 = prevJson.style_overrides || {};
  const next: StyleOverridesV2 = {
    global: prev.global ? { ...prev.global } : undefined,
    cuts: prev.cuts ? { ...prev.cuts } : undefined,
  };

  if (activeCut === "ALL") {
    delete next.global;
  } else {
    if (next.cuts) {
      delete next.cuts[activeCut];
      if (Object.keys(next.cuts).length === 0) delete next.cuts;
    }
  }

  const nextJson = { ...prevJson };
  if (!next.global && !next.cuts) {
    delete nextJson.style_overrides;
  } else {
    nextJson.style_overrides = next;
  }
  return nextJson;
}

// ── 현재 적용된 스타일 읽기 ──
export function getAppliedStyle(json: any, activeCut: CutId): PendingStyle {
  const ov: StyleOverridesV2 = json?.style_overrides || {};
  if (activeCut === "ALL") return ov.global || {};
  return ov.cuts?.[activeCut] || {};
}

// ── 프리셋 ──
export const COLOR_PRESETS = [
  { label: "블랙", value: "#111111" },
  { label: "화이트", value: "#FFFFFF" },
  { label: "네이비", value: "#0B1F3A" },
  { label: "레드", value: "#C1121F" },
  { label: "블루", value: "#1D6EF2" },
  { label: "청록", value: "#2A9D8F" },
  { label: "앰버", value: "#F59E0B" },
];

export const SCALE_PRESETS = [
  { label: "작게", value: 0.9 },
  { label: "보통", value: 1.0 },
  { label: "크게", value: 1.1 },
  { label: "더크게", value: 1.2 },
];

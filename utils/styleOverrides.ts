// utils/styleOverrides.ts
// ============================================================
// 글로벌 스타일 툴바를 위한 유틸리티
// Phase 1: fontSize + color
// ============================================================

export type StyleProps = { fontSize?: string; color?: string };
export type StyleOverrides = Record<string, StyleProps>;
export type StyleGroupKey = "hero" | "section" | "body";

export type GroupConfig = {
  label: string;
  keyPrefixes: string[];
  fontSizePresets: string[];
  colorPresets: { label: string; value: string }[];
};

// ── 그룹 설정 ──
const COLOR_PRESETS = [
  { label: "블랙", value: "#111111" },
  { label: "화이트", value: "#FFFFFF" },
  { label: "네이비", value: "#0B1F3A" },
  { label: "레드", value: "#C1121F" },
  { label: "블루", value: "#1D6EF2" },
  { label: "청록", value: "#2A9D8F" },
  { label: "앰버", value: "#F59E0B" },
];

export const groupConfigs: Record<StyleGroupKey, GroupConfig> = {
  hero: {
    label: "히어로 제목",
    keyPrefixes: ["hero.product_title", "hero.hook_line"],
    fontSizePresets: ["28px", "34px", "40px", "48px", "56px", "64px"],
    colorPresets: COLOR_PRESETS,
  },
  section: {
    label: "섹션 제목",
    keyPrefixes: [
      "benefits.section_title",
      "problem.headline",
      "selection_reasons.headline",
      "specs.section_title",
      "faq.section_title",
      "cta.headline",
      "details.blocks.",
    ],
    fontSizePresets: ["18px", "22px", "26px", "30px", "36px"],
    colorPresets: COLOR_PRESETS,
  },
  body: {
    label: "본문",
    keyPrefixes: [
      "hero.sub_hook",
      "benefits.items.",
      "problem.pain_points.",
      "problem.bridge",
      "details.blocks.",
      "selection_reasons.items.",
      "faq.items.",
      "cta.sub_text",
    ],
    fontSizePresets: ["12px", "14px", "16px", "18px", "22px"],
    colorPresets: COLOR_PRESETS,
  },
};

// ── JSON traverse → 유효한 fieldKey 목록 생성 ──
type AnyObj = Record<string, any>;

export function buildFieldKeyIndex(json: AnyObj): string[] {
  const out: string[] = [];
  const get = (path: string): any =>
    path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), json);

  // hero
  if (typeof get("hero.product_title") === "string") out.push("hero.product_title");
  if (typeof get("hero.hook_line") === "string") out.push("hero.hook_line");
  if (typeof get("hero.sub_hook") === "string") out.push("hero.sub_hook");

  // benefits
  if (typeof get("benefits.section_title") === "string") out.push("benefits.section_title");
  const bi = get("benefits.items");
  if (Array.isArray(bi)) {
    bi.forEach((it: any, i: number) => {
      if (typeof it?.title === "string") out.push(`benefits.items.${i}.title`);
      if (typeof it?.description === "string") out.push(`benefits.items.${i}.description`);
      if (typeof it?.highlight_value === "string") out.push(`benefits.items.${i}.highlight_value`);
    });
  }

  // problem
  if (typeof get("problem.headline") === "string") out.push("problem.headline");
  if (typeof get("problem.bridge") === "string") out.push("problem.bridge");
  const pp = get("problem.pain_points");
  if (Array.isArray(pp)) {
    pp.forEach((it: any, i: number) => {
      if (typeof it?.text === "string") out.push(`problem.pain_points.${i}.text`);
    });
  }

  // details
  const blocks = get("details.blocks");
  if (Array.isArray(blocks)) {
    blocks.forEach((b: any, i: number) => {
      if (typeof b?.headline === "string") out.push(`details.blocks.${i}.headline`);
      if (typeof b?.body === "string") out.push(`details.blocks.${i}.body`);
    });
  }

  // selection_reasons
  if (typeof get("selection_reasons.headline") === "string") out.push("selection_reasons.headline");
  const sr = get("selection_reasons.items");
  if (Array.isArray(sr)) {
    sr.forEach((it: any, i: number) => {
      if (typeof it?.title === "string") out.push(`selection_reasons.items.${i}.title`);
      if (typeof it?.text === "string") out.push(`selection_reasons.items.${i}.text`);
    });
  }

  // specs
  if (typeof get("specs.section_title") === "string") out.push("specs.section_title");

  // faq
  if (typeof get("faq.section_title") === "string") out.push("faq.section_title");
  const fq = get("faq.items");
  if (Array.isArray(fq)) {
    fq.forEach((it: any, i: number) => {
      if (typeof it?.question === "string") out.push(`faq.items.${i}.question`);
      if (typeof it?.answer === "string") out.push(`faq.items.${i}.answer`);
    });
  }

  // cta
  if (typeof get("cta.headline") === "string") out.push("cta.headline");
  if (typeof get("cta.sub_text") === "string") out.push("cta.sub_text");
  if (typeof get("cta.bonus") === "string") out.push("cta.bonus");
  if (typeof get("cta.urgency") === "string") out.push("cta.urgency");

  return out;
}

// ── 그룹에 해당하는 키 필터 (section/body 겹침 해결) ──
function isGroupMatch(fieldKey: string, group: StyleGroupKey, cfg: GroupConfig): boolean {
  const prefixMatch = cfg.keyPrefixes.some((p) => fieldKey.startsWith(p));
  if (!prefixMatch) return false;

  // details.blocks.* 는 section/body 둘 다 prefix에 들어감 → 추가 필터
  if (fieldKey.startsWith("details.blocks.")) {
    if (group === "section") return fieldKey.endsWith(".headline");
    if (group === "body") return fieldKey.endsWith(".body");
  }

  // hero 그룹은 이미 좁게 잡혀서 추가 필터 불필요
  if (group === "hero") return true;

  // section: headline/section_title 계열만
  if (group === "section") {
    return (
      fieldKey.endsWith(".headline") ||
      fieldKey.endsWith(".section_title") ||
      fieldKey === "cta.headline"
    );
  }

  // body: 나머지 전부
  return true;
}

// ── 핵심: 그룹 일괄 스타일 적용 ──
export function applyGroupStyleOverrides(
  prevJson: AnyObj,
  group: StyleGroupKey,
  patch: StyleProps,
  configs: Record<StyleGroupKey, GroupConfig> = groupConfigs
): AnyObj {
  const cfg = configs[group];
  const allKeys = buildFieldKeyIndex(prevJson);
  const groupKeys = allKeys.filter((k) => isGroupMatch(k, group, cfg));

  const prevOverrides: StyleOverrides = { ...(prevJson.style_overrides || {}) };

  for (const key of groupKeys) {
    const prev = prevOverrides[key] || {};
    const next: StyleProps = { ...prev };

    // fontSize 적용/제거
    if (patch.fontSize !== undefined) {
      if (patch.fontSize.trim() === "") {
        delete next.fontSize;
      } else {
        next.fontSize = patch.fontSize.trim();
      }
    }

    // color 적용/제거
    if (patch.color !== undefined) {
      if (patch.color.trim() === "") {
        delete next.color;
      } else {
        next.color = patch.color.trim();
      }
    }

    // 빈 오버라이드 정리
    if (Object.keys(next).length === 0) {
      delete prevOverrides[key];
    } else {
      prevOverrides[key] = next;
    }
  }

  const nextJson = { ...prevJson };
  if (Object.keys(prevOverrides).length === 0) {
    delete nextJson.style_overrides;
  } else {
    nextJson.style_overrides = prevOverrides;
  }

  return nextJson;
}

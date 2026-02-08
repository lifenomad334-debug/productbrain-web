"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import FeedbackBox from "@/components/FeedbackBox";

// ============================================================
// slide_id → JSON 필드 매핑 정의
// ============================================================
type EditableField = {
  key: string;        // JSON 경로 (dot notation)
  label: string;      // 표시 라벨
  type: "text" | "textarea"; // input 유형
};

const SLIDE_FIELDS: Record<string, EditableField[]> = {
  hero: [
    { key: "hero.hook_line", label: "메인 카피", type: "textarea" },
    { key: "hero.sub_hook", label: "서브 카피", type: "textarea" },
    { key: "hero.badge", label: "배지", type: "text" },
    { key: "hero.product_title", label: "상품명", type: "text" },
  ],
  "problem-benefits": [
    { key: "problem.headline", label: "문제 제목", type: "text" },
    { key: "problem.pain_points.0.text", label: "문제점 1", type: "textarea" },
    { key: "problem.pain_points.1.text", label: "문제점 2", type: "textarea" },
    { key: "problem.pain_points.2.text", label: "문제점 3", type: "textarea" },
    { key: "problem.pain_points.3.text", label: "문제점 4", type: "textarea" },
    { key: "problem.bridge", label: "브릿지 문장", type: "textarea" },
    { key: "benefits.section_title", label: "혜택 제목", type: "text" },
    { key: "benefits.items.0.title", label: "혜택 1 제목", type: "text" },
    { key: "benefits.items.0.description", label: "혜택 1 설명", type: "textarea" },
    { key: "benefits.items.0.highlight_value", label: "혜택 1 강조값", type: "text" },
    { key: "benefits.items.1.title", label: "혜택 2 제목", type: "text" },
    { key: "benefits.items.1.description", label: "혜택 2 설명", type: "textarea" },
    { key: "benefits.items.1.highlight_value", label: "혜택 2 강조값", type: "text" },
    { key: "benefits.items.2.title", label: "혜택 3 제목", type: "text" },
    { key: "benefits.items.2.description", label: "혜택 3 설명", type: "textarea" },
    { key: "benefits.items.2.highlight_value", label: "혜택 3 강조값", type: "text" },
    { key: "benefits.items.3.title", label: "혜택 4 제목", type: "text" },
    { key: "benefits.items.3.description", label: "혜택 4 설명", type: "textarea" },
    { key: "benefits.items.3.highlight_value", label: "혜택 4 강조값", type: "text" },
  ],
  details: [
    { key: "details.blocks.0.headline", label: "상세 1 제목", type: "text" },
    { key: "details.blocks.0.body", label: "상세 1 본문", type: "textarea" },
    { key: "details.blocks.1.headline", label: "상세 2 제목", type: "text" },
    { key: "details.blocks.1.body", label: "상세 2 본문", type: "textarea" },
    { key: "details.blocks.2.headline", label: "상세 3 제목", type: "text" },
    { key: "details.blocks.2.body", label: "상세 3 본문", type: "textarea" },
  ],
  "reasons-specs": [
    { key: "selection_reasons.headline", label: "선택 이유 제목", type: "text" },
    { key: "selection_reasons.items.0.title", label: "이유 1 제목", type: "text" },
    { key: "selection_reasons.items.0.text", label: "이유 1 설명", type: "textarea" },
    { key: "selection_reasons.items.1.title", label: "이유 2 제목", type: "text" },
    { key: "selection_reasons.items.1.text", label: "이유 2 설명", type: "textarea" },
    { key: "selection_reasons.items.2.title", label: "이유 3 제목", type: "text" },
    { key: "selection_reasons.items.2.text", label: "이유 3 설명", type: "textarea" },
    { key: "specs.section_title", label: "사양 제목", type: "text" },
    { key: "specs.rows.0.value", label: "사양 1 값", type: "text" },
    { key: "specs.rows.1.value", label: "사양 2 값", type: "text" },
    { key: "specs.rows.2.value", label: "사양 3 값", type: "text" },
    { key: "specs.rows.3.value", label: "사양 4 값", type: "text" },
    { key: "specs.rows.4.value", label: "사양 5 값", type: "text" },
    { key: "specs.rows.5.value", label: "사양 6 값", type: "text" },
    { key: "specs.rows.6.value", label: "사양 7 값", type: "text" },
  ],
  faq: [
    { key: "faq.section_title", label: "FAQ 제목", type: "text" },
    { key: "faq.items.0.question", label: "질문 1", type: "text" },
    { key: "faq.items.0.answer", label: "답변 1", type: "textarea" },
    { key: "faq.items.1.question", label: "질문 2", type: "text" },
    { key: "faq.items.1.answer", label: "답변 2", type: "textarea" },
    { key: "faq.items.2.question", label: "질문 3", type: "text" },
    { key: "faq.items.2.answer", label: "답변 3", type: "textarea" },
    { key: "faq.items.3.question", label: "질문 4", type: "text" },
    { key: "faq.items.3.answer", label: "답변 4", type: "textarea" },
  ],
  cta: [
    { key: "cta.headline", label: "CTA 제목", type: "text" },
    { key: "cta.sub_text", label: "CTA 서브", type: "textarea" },
    { key: "cta.urgency", label: "긴급성 문구", type: "text" },
    { key: "cta.bonus", label: "보너스 혜택", type: "text" },
  ],
};

// JSON 경로로 값 가져오기
function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return "";
    current = current[key];
  }
  return typeof current === "string" ? current : "";
}

// JSON 경로로 값 설정하기 (immutable)
function setNestedValue(obj: any, path: string, value: string): any {
  const keys = path.split(".");
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value };
  }

  const [first, ...rest] = keys;
  const isArrayIndex = /^\d+$/.test(rest[0]);

  if (isArrayIndex && Array.isArray(obj[first])) {
    const arr = [...obj[first]];
    const idx = parseInt(rest[0]);
    if (rest.length === 1) {
      arr[idx] = value;
    } else {
      arr[idx] = setNestedValue(arr[idx], rest.slice(1).join("."), value);
    }
    return { ...obj, [first]: arr };
  }

  return {
    ...obj,
    [first]: setNestedValue(obj[first] || {}, rest.join("."), value),
  };
}

// 슬라이드 라벨
const SLIDE_LABELS: Record<string, { label: string; emoji: string; desc: string }> = {
  hero: { label: "히어로", emoji: "🎯", desc: "고객의 시선을 잡는 첫 화면" },
  "problem-benefits": { label: "문제 + 혜택", emoji: "💡", desc: "고객 공감 + 해결책 제시" },
  details: { label: "상세 설명", emoji: "📋", desc: "제품의 핵심 장점 3가지" },
  "reasons-specs": { label: "선택 이유 + 사양", emoji: "📊", desc: "구매 근거 + 스펙 비교" },
  faq: { label: "자주 묻는 질문", emoji: "❓", desc: "마지막 의문 해소" },
  cta: { label: "구매 유도", emoji: "🛒", desc: "지금 행동하게 만드는 마무리" },
};

// ============================================================
// Types
// ============================================================
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

// ============================================================
// Main Component
// ============================================================
export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const generationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [assets, setAssets] = useState<GenerationAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // 편집 상태
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editedJson, setEditedJson] = useState<any>(null); // 수정 중인 JSON
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const [activeTone, setActiveTone] = useState<Record<string, string>>({}); // 변경된 필드 추적

  // 이미지 교체
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [replacingSlideId, setReplacingSlideId] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    async function fetchGeneration() {
      try {
        const { data, error: fetchError } = await supabaseBrowser
          .from("generations")
          .select("*")
          .eq("id", generationId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("생성 결과를 찾을 수 없습니다");

        setGeneration(data);
        setEditedJson(data.generated_json);
        setFeedbackSubmitted(data.feedback_submitted || false);

        const { data: assetsData, error: assetsError } = await supabaseBrowser
          .from("generation_assets")
          .select("slide_id, image_url, width, height")
          .eq("generation_id", generationId)
          .order("created_at", { ascending: true });

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

  // 편집 모드 토글
  function toggleEdit(slideId: string) {
    if (editingSlideId === slideId) {
      // 닫기 — 변경사항 있으면 확인
      if (editedFields.size > 0) {
        if (!confirm("수정한 내용이 있습니다. 저장하지 않고 닫으시겠어요?")) return;
        // 원래 JSON으로 되돌리기
        setEditedJson(generation?.generated_json);
        setEditedFields(new Set());
      }
      setEditingSlideId(null);
    } else {
      setEditingSlideId(slideId);
    }
  }

  // 필드 값 변경
  function handleFieldChange(fieldKey: string, value: string) {
    setEditedJson((prev: any) => setNestedValue(prev, fieldKey, value));
    setEditedFields((prev) => new Set(prev).add(fieldKey));
  }

  // 재렌더링 제출
  async function submitEdit(slideId: string) {
    if (!generation || !editedJson) return;

    setIsSaving((s) => ({ ...s, [slideId]: true }));
    try {
      const res = await fetch("/api/edit-cut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          slide_id: slideId,
          full_json_update: editedJson,
          tweak: activeTone[slideId] || null,
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        if (res.status === 429) {
          throw new Error(json.error);
        }
        throw new Error(json.error || "수정에 실패했습니다");
      }

      // UI 업데이트
      setAssets((prev) =>
        prev.map((a) =>
          a.slide_id === slideId ? { ...a, image_url: json.image_url } : a
        )
      );
      setGeneration((prev) =>
        prev ? { ...prev, generated_json: editedJson } : prev
      );
      setEditingSlideId(null);
      setEditedFields(new Set());
      setActiveTone((prev) => ({ ...prev, [slideId]: "" }));

      // 성공 토스트 (alert 대신)
    } catch (err: any) {
      alert(err.message || "수정 중 오류가 발생했습니다");
    } finally {
      setIsSaving((s) => ({ ...s, [slideId]: false }));
    }
  }

  // 이미지 교체 핸들러
  function handleImageReplace(slideId: string) {
    setReplacingSlideId(slideId);
    imageInputRef.current?.click();
  }

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !replacingSlideId || !generation) return;

    setIsSaving((s) => ({ ...s, [replacingSlideId]: true }));

    try {
      const formData = new FormData();
      formData.append("generation_id", generationId);
      formData.append("slide_id", replacingSlideId);
      formData.append("image", file);

      const res = await fetch("/api/replace-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "이미지 교체 실패");

      // UI 업데이트
      setAssets((prev) =>
        prev.map((a) =>
          a.slide_id === replacingSlideId
            ? { ...a, image_url: json.image_url }
            : a
        )
      );
    } catch (err: any) {
      alert(err.message || "이미지 교체 중 오류가 발생했습니다");
    } finally {
      setIsSaving((s) => ({ ...s, [replacingSlideId!]: false }));
      setReplacingSlideId(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  // ============================================================
  // Render
  // ============================================================
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

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        {/* 숨겨진 이미지 input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageSelected}
        />

        {/* 상단 안내 배너 */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">✏️</span>
            <h2 className="text-lg font-bold text-blue-900">
              텍스트를 직접 수정하세요
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-blue-800">
            각 컷의 <strong>"편집"</strong> 버튼을 눌러 문장을 바로 수정할 수 있습니다.
            수정 후 <strong>"재렌더링"</strong>을 누르면 새 이미지가 생성됩니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-green-700">
              <span>✔</span>
              <span>문장 직접 수정</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-700">
              <span>✔</span>
              <span>톤 조절 (짧게/직설적/고급)</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-700">
              <span>✔</span>
              <span>이미지 교체</span>
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
                {generation.platform} · {assets.length}컷
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
              <div className="text-sm font-medium text-blue-900">
                ✨ 베타: 무제한 수정
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 컷 카드 목록 */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {assets.map((asset, idx) => {
            const slideInfo = SLIDE_LABELS[asset.slide_id] || {
              label: `컷 ${idx + 1}`,
              emoji: "📄",
              desc: "",
            };
            const fields = SLIDE_FIELDS[asset.slide_id] || [];
            const isEditing = editingSlideId === asset.slide_id;
            const saving = isSaving[asset.slide_id];

            return (
              <div
                key={asset.slide_id}
                className={`rounded-2xl border bg-white transition-shadow ${
                  isEditing
                    ? "border-blue-300 shadow-lg shadow-blue-100"
                    : "border-neutral-200"
                }`}
              >
                {/* 컷 헤더 */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-base font-bold text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{slideInfo.emoji}</span>
                        <span className="text-base font-semibold text-neutral-900">
                          {slideInfo.label}
                        </span>
                      </div>
                      {slideInfo.desc && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {slideInfo.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 이미지 교체 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleImageReplace(asset.slide_id)}
                      disabled={saving}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      🖼️ 이미지 교체
                    </button>

                    {/* 편집 토글 */}
                    <button
                      type="button"
                      onClick={() => toggleEdit(asset.slide_id)}
                      disabled={saving}
                      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                        isEditing
                          ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                          : "bg-neutral-900 text-white hover:bg-neutral-800"
                      }`}
                    >
                      {isEditing ? "닫기" : "✏️ 편집"}
                    </button>
                  </div>
                </div>

                {/* 이미지 + 편집 패널 (가로 레이아웃) */}
                <div className={`${isEditing ? "flex flex-col lg:flex-row" : ""}`}>
                  {/* 이미지 영역 */}
                  <div className={`relative ${isEditing ? "lg:w-1/2 lg:sticky lg:top-4 lg:self-start" : ""}`}>
                    <img
                      src={asset.image_url}
                      alt={`${slideInfo.label} - ${idx + 1}번째 컷`}
                      className="w-full select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    {/* 워터마크 */}
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

                    {/* 로딩 오버레이 */}
                    {saving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <div className="text-center">
                          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 mx-auto" />
                          <p className="text-sm font-medium text-neutral-700">
                            재렌더링 중...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ============================================================ */}
                  {/* 인라인 편집 패널 (오른쪽) */}
                  {/* ============================================================ */}
                  {isEditing && editedJson && (
                    <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-blue-200 bg-gradient-to-b from-blue-50/50 to-white px-5 py-4 lg:max-h-[80vh] lg:overflow-y-auto">
                      {/* 편집 영역 헤더 */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-sm">✏️</span>
                        <span className="text-sm font-semibold text-neutral-800">텍스트 수정</span>
                        {editedFields.size > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {editedFields.size}개 수정됨
                          </span>
                        )}
                      </div>

                      {/* 편집 필드 */}
                      <div className="mb-4 space-y-2.5">
                        {fields.map((field) => {
                          const currentValue = getNestedValue(
                            editedJson,
                            field.key
                          );
                          if (currentValue === "" && !getNestedValue(generation?.generated_json, field.key)) {
                            return null;
                          }
                          const isChanged = editedFields.has(field.key);

                          return (
                            <div key={field.key}>
                              <label className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                <span>{field.label}</span>
                                {isChanged && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                )}
                              </label>
                              {field.type === "textarea" ? (
                                <textarea
                                  className={`w-full rounded-lg border p-2 text-sm leading-relaxed outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
                                    isChanged
                                      ? "border-blue-300 bg-blue-50/40"
                                      : "border-neutral-200 bg-white"
                                  }`}
                                  value={currentValue}
                                  onChange={(e) =>
                                    handleFieldChange(field.key, e.target.value)
                                  }
                                  rows={2}
                                />
                              ) : (
                                <input
                                  type="text"
                                  className={`w-full rounded-lg border p-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-200 ${
                                    isChanged
                                      ? "border-blue-300 bg-blue-50/40"
                                      : "border-neutral-200 bg-white"
                                  }`}
                                  value={currentValue}
                                  onChange={(e) =>
                                    handleFieldChange(field.key, e.target.value)
                                  }
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 톤 조절 (향후 업데이트) */}
                      <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-neutral-400">톤 조절:</span>
                        {[
                          { id: "shorter", label: "더 짧게" },
                          { id: "direct", label: "더 직설적으로" },
                          { id: "premium", label: "더 고급스럽게" },
                        ].map((tone) => (
                          <button
                            key={tone.id}
                            type="button"
                            disabled
                            className="rounded-full border border-neutral-100 px-2.5 py-1 text-xs text-neutral-300 cursor-not-allowed"
                            title="AI 톤 조절 기능 준비 중"
                          >
                            {tone.label}
                          </button>
                        ))}
                        <span className="text-[10px] text-neutral-400">준비 중</span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2 border-t border-neutral-100 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditedJson(generation?.generated_json);
                            setEditedFields(new Set());
                          }}
                          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50"
                        >
                          초기화
                        </button>
                        <button
                          type="button"
                          onClick={() => submitEdit(asset.slide_id)}
                          disabled={saving || editedFields.size === 0}
                          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {saving
                            ? "재렌더링 중..."
                            : `재렌더링 (${editedFields.size}개 수정)`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 피드백 + 다운로드 섹션 */}
        <div className="mt-10 space-y-6">
          {!feedbackSubmitted ? (
            <>
              <FeedbackBox
                generationId={generationId}
                userId={generation.user_id}
                cutCount={assets.length as 4 | 6 | 8}
                onSubmitSuccess={() => {
                  setFeedbackSubmitted(true);
                  alert("피드백 감사합니다! 다운로드가 가능합니다.");
                }}
              />
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
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-sm font-semibold text-green-900">
                  ✓ 피드백 감사합니다!
                </p>
                <p className="mt-1 text-xs text-green-700">
                  서비스 개선에 큰 도움이 됩니다
                </p>
              </div>
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
                    onClick={() =>
                      alert("ZIP 파일 생성 기능 준비 중입니다")
                    }
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

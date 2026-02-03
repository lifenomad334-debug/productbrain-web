"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (data?.session) setIsLoggedIn(true);
    }
    check();
  }, []);

  function handleCTA() {
    router.push(isLoggedIn ? "/generate" : "/login");
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50 opacity-80" />
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wide bg-orange-100 text-orange-700 rounded-full">
            쿠팡 · 네이버 · Shopify
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            외주 맡기기 전에<br />
            <span className="text-orange-600">한 번만</span> 써보세요
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
            디자인이 아니라,<br className="sm:hidden" />
            <strong>팔리는 순서</strong>를 자동으로 만듭니다.
          </p>

          <button
            onClick={handleCTA}
            className="mt-10 inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-800 transition-all hover:scale-105 active:scale-100 shadow-lg shadow-gray-900/20"
          >
            상세페이지 생성하기
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>

          <p className="mt-4 text-xs text-gray-400">가입 후 바로 사용 · 비밀번호 없음</p>
        </div>
      </section>

      {/* ─── 공감 섹션 ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            상세페이지, 이런 고민 있으셨죠?
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { emoji: "😤", text: "예쁜데 왜 안 팔리는지 모르겠다" },
              { emoji: "💸", text: "외주 맡기기엔 비용이 부담된다" },
              { emoji: "🤯", text: "AI로 만들었는데 감만 더 헷갈린다" },
              { emoji: "❓", text: "무엇을 먼저 말해야 할지 모르겠다" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-10">
            문제는 디자인이 아니라, <strong className="text-gray-800">설득 구조</strong>입니다.
          </p>
        </div>
      </section>

      {/* ─── Before / After ─── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          구조가 바뀌면, 전달력이 달라집니다
        </h2>
        <p className="text-center text-sm text-gray-500 mb-12">같은 제품, 다른 구성</p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-gray-200 p-6 bg-gray-50">
            <div className="text-xs font-bold text-gray-400 tracking-widest mb-4">BEFORE</div>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>정보 나열식 — 뭐가 중요한지 모름</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>메시지 분산 — 핵심이 묻힘</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>구매 버튼까지 도달 안 함</span>
              </li>
            </ul>
            <div className="mt-6 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">일반적인 상세페이지</span>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-orange-300 p-6 bg-orange-50">
            <div className="text-xs font-bold text-orange-600 tracking-widest mb-4">AFTER — PRODUCTBRAIN</div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>한 줄로 꽂히는 시작</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>문제 → 해결 → 확신 → 행동 순서</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span>바로 업로드 가능한 통이미지</span>
              </li>
            </ul>
            <div className="mt-6 h-32 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
              <span className="text-orange-500 text-xs font-medium">설득 구조가 적용된 상세페이지</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6컷 설득 구조 ─── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            팔리는 상세페이지에는<br />순서가 있습니다
          </h2>
          <p className="text-center text-sm text-gray-400 mb-14">
            이 순서를 고민하지 않아도 됩니다. ProductBrain이 자동으로 구성합니다.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { num: "01", title: "Hero", desc: "스크롤을 멈추게 하는 한 문장" },
              { num: "02", title: "Problem", desc: '"이거 내 얘긴데?" 공감 유도' },
              { num: "03", title: "Benefit", desc: "왜 이 제품이어야 하는지" },
              { num: "04", title: "Proof", desc: "불안을 줄이는 구체적 근거" },
              { num: "05", title: "Detail", desc: "필요한 정보만 깔끔하게 정리" },
              { num: "06", title: "CTA", desc: "지금 행동하게 만드는 질문" },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 p-5 rounded-xl bg-gray-800/50 border border-gray-700/50"
              >
                <span className="text-2xl font-black text-orange-500 tabular-nums">{step.num}</span>
                <div>
                  <div className="font-bold text-sm">{step.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 차별점 ─── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          이미지를 만드는 도구는 많습니다
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          <strong>설득 구조</strong>를 만들어주는 도구는 드뭅니다
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="text-xs font-bold text-gray-400 tracking-widest mb-3">이미지 AI 툴</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              &ldquo;무엇을 만들지&rdquo;는<br />
              <strong className="text-gray-800">셀러가 직접 판단</strong>해야 합니다.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-300">
            <div className="text-xs font-bold text-orange-600 tracking-widest mb-3">PRODUCTBRAIN</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              &ldquo;무엇을 먼저 말할지&rdquo;를<br />
              <strong className="text-gray-900">엔진이 자동 결정</strong>합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            외주 맡기기 전에<br />
            <span className="text-orange-400">1번만</span> 테스트해보세요
          </h2>

          <button
            onClick={handleCTA}
            className="mt-10 inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-orange-400 transition-all hover:scale-105 active:scale-100 shadow-lg shadow-orange-500/30"
          >
            상세페이지 생성하기
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>

          <p className="mt-4 text-xs text-gray-500">이메일 하나로 시작 · 30초 안에 생성</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; 2026 ProductBrain</span>
          <span>설득 구조 자동 완성 엔진</span>
        </div>
      </footer>
    </div>
  );
}

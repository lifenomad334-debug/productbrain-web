"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function check() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (data?.session) setIsLoggedIn(true);
    }
    check();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleCTA() {
    router.push(isLoggedIn ? "/generate" : "/login");
  }

  const vis = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-900">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-[#fafaf8] to-orange-50/30" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-orange-100/80 px-4 py-2 text-xs font-semibold text-orange-700">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            초기 테스터 모집 중
          </div>
          <div className="mb-4 text-xs text-gray-400">
            쿠팡 · 스마트스토어 · 11번가 · 자사몰 지원
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl">
            상세페이지,
            <br />
            <span className="text-orange-600">설득 구조</span>부터
            <br />
            만들어야 합니다
          </h1>

          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-500">
            예쁜 이미지가 아니라, <strong className="text-gray-800">읽히는 순서</strong>가 매출을 바꿉니다.
          </p>

          <button
            onClick={handleCTA}
            className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-gray-900/15 transition-all hover:scale-[1.03] hover:bg-gray-800 hover:shadow-xl active:scale-100"
          >
            무료로 만들어보기
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <p className="mt-4 text-xs text-gray-400">이메일 하나로 바로 시작 · 30초 안에 생성</p>
        </div>
      </section>

      {/* ═══ BEFORE / AFTER 실카피 ═══ */}
      <section className="border-y border-gray-100 bg-gray-50/80 py-20">
        <div
          id="ba"
          data-animate
          className={`mx-auto max-w-4xl px-6 transition-all duration-700 ${vis("ba") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-orange-600">
            Before vs After
          </p>
          <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            같은 제품, 다른 문장
          </h2>
          <p className="mb-12 text-center text-sm text-gray-500">
            구조가 바뀌면 전달력이 달라집니다
          </p>

          {/* 전자/가전 세트 */}
          <div className="mb-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                Before — 일반 AI 도구
              </div>
              <div className="mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">노트북</div>
              <div className="space-y-3 text-sm leading-relaxed text-gray-400">
                <p><span className="mr-2 text-red-300">✕</span>&quot;강력한 성능과 세련된 디자인&quot;</p>
                <p><span className="mr-2 text-red-300">✕</span>&quot;누구나 만족할 수 있는 제품&quot;</p>
                <p><span className="mr-2 text-red-300">✕</span>&quot;지금 바로 구매하세요&quot;</p>
              </div>
              <p className="mt-4 text-xs text-gray-300">→ 뭐가 좋은지 모르겠음</p>
            </div>

            <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 shadow-sm shadow-orange-100">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-600">
                After — ProductBrain
              </div>
              <div className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">노트북</div>
              <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                <p><span className="mr-2 text-orange-500">✓</span><strong>&quot;앱 전환할 때 멈칫거림이 거의 없는 노트북&quot;</strong></p>
                <p><span className="mr-2 text-orange-500">✓</span>&quot;탭 몇 개만 열어도 팬 소음이 커졌다면&quot;</p>
                <p><span className="mr-2 text-orange-500">✓</span>&quot;매일 쓰는 노트북을 바꿀 때가 됐다면&quot;</p>
              </div>
              <p className="mt-4 text-xs text-orange-600/60">→ 사용 장면이 바로 떠오름</p>
            </div>
          </div>

          {/* 식품 세트 */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                Before — 일반 AI 도구
              </div>
              <div className="mb-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">건강식품</div>
              <div className="space-y-3 text-sm leading-relaxed text-gray-400">
                <p><span className="mr-2 text-red-300">✕</span>&quot;건강한 하루를 위한 최고의 선택&quot;</p>
                <p><span className="mr-2 text-red-300">✕</span>&quot;엄선된 원료로 만든 프리미엄 제품&quot;</p>
                <p><span className="mr-2 text-red-300">✕</span>&quot;지금 특별 할인 중&quot;</p>
              </div>
              <p className="mt-4 text-xs text-gray-300">→ 어디서나 볼 수 있는 문장</p>
            </div>

            <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 shadow-sm shadow-orange-100">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-orange-600">
                After — ProductBrain
              </div>
              <div className="mb-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">건강식품</div>
              <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                <p><span className="mr-2 text-orange-500">✓</span><strong>&quot;바쁜 아침, 3분이면 차리는 든든한 한 끼&quot;</strong></p>
                <p><span className="mr-2 text-orange-500">✓</span>&quot;건강한 식단을 챙기고 싶은데 시간이 없다면&quot;</p>
                <p><span className="mr-2 text-orange-500">✓</span>&quot;맛과 건강 둘 다 포기하기 싫었다면&quot;</p>
              </div>
              <p className="mt-4 text-xs text-orange-600/60">→ 내 상황에 딱 맞는 느낌</p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            * 예시는 ProductBrain 설득 구조 엔진이 생성한 문장 기준입니다
            <br />
            * 쿠팡, 네이버 스마트스토어, 11번가, 자사몰 등 어디든 바로 업로드 가능합니다
          </p>
        </div>
      </section>

      {/* ═══ 기존 도구 비교 ═══ */}
      <section className="py-20">
        <div
          id="compare"
          data-animate
          className={`mx-auto max-w-3xl px-6 transition-all duration-700 ${vis("compare") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-orange-600">
            The Difference
          </p>
          <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            이미지를 만드는 도구는 많습니다
          </h2>
          <p className="mb-12 text-center text-lg text-gray-500">
            <strong className="text-gray-800">설득 구조</strong>를 만들어주는 도구는 드뭅니다
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
              <div className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">이미지 AI 도구</div>
              <div className="space-y-4 text-sm text-gray-500">
                <p><span className="mr-2 text-gray-300">✕</span>이미지는 예쁘게 나옴</p>
                <p><span className="mr-2 text-gray-300">✕</span>문장은 셀러가 직접 써야 함</p>
                <p><span className="mr-2 text-gray-300">✕</span>어떤 순서로 넣을지도 셀러 몫</p>
                <p><span className="mr-2 text-gray-300">✕</span>결국 &apos;감&apos;으로 만드는 건 똑같음</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-orange-300 bg-white p-7 shadow-sm shadow-orange-100/50">
              <div className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-600">ProductBrain</div>
              <div className="space-y-4 text-sm font-medium text-gray-700">
                <p><span className="mr-2 text-orange-500">✓</span>설득 구조를 자동으로 잡아줌</p>
                <p><span className="mr-2 text-orange-500">✓</span>컷마다 역할이 명확하게 정의됨</p>
                <p><span className="mr-2 text-orange-500">✓</span>문장도 구조에 맞게 생성됨</p>
                <p><span className="mr-2 text-orange-500">✓</span>&apos;왜 이 순서인지&apos;까지 설명해줌</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6컷 설득 구조 ═══ */}
      <section className="bg-gray-900 text-white">
        <div
          id="structure"
          data-animate
          className={`mx-auto max-w-3xl px-6 py-20 transition-all duration-700 ${vis("structure") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-orange-500">
            How it works
          </p>
          <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            팔리는 상세페이지에는
            <br />순서가 있습니다
          </h2>
          <p className="mb-14 text-center text-sm text-gray-400">
            이 순서를 고민하지 않아도 됩니다. ProductBrain이 자동으로 구성합니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { num: "01", title: "첫 문장", desc: "스크롤을 멈추게 하는 한 문장" },
              { num: "02", title: "문제 공감", desc: "\"이거 내 얘기네?\" 고개를 끄덕이게" },
              { num: "03", title: "변화/효과", desc: "이 제품 쓰면 뭐가 달라지는지" },
              { num: "04", title: "근거/신뢰", desc: "믿어도 되는 구체적 이유" },
              { num: "05", title: "상세 정보", desc: "구매 전 마지막으로 확인할 것들" },
              { num: "06", title: "구매 유도", desc: "지금 결정하게 만드는 마지막 한 마디" },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 rounded-xl border border-gray-700/40 bg-gray-800/40 p-5 backdrop-blur"
              >
                <span className="text-2xl font-black tabular-nums text-orange-500">{step.num}</span>
                <div>
                  <div className="text-sm font-bold">{step.title}</div>
                  <div className="mt-1 text-xs text-gray-400">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 테스터 베네핏 + 현재 단계 ═══ */}
      <section className="py-20">
        <div
          id="benefits"
          data-animate
          className={`mx-auto max-w-4xl px-6 transition-all duration-700 ${vis("benefits") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-orange-600">
            Early Tester
          </p>
          <h2 className="mb-4 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            핵심은 이미 동작합니다
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-sm leading-relaxed text-gray-500">
            설득 구조 생성, 컷별 수정, 이미지 렌더링까지 모두 사용할 수 있습니다.
            <br />
            지금 함께해주시는 분들께는 서비스 완성 후에도 혜택을 드립니다.
          </p>

          {/* 베네핏 카드 */}
          <div className="mb-16 grid gap-5 sm:grid-cols-3">
            {[
              {
                emoji: "🎁",
                title: "베타 기간 완전 무료",
                desc: "생성 · 수정 · 다운로드 모두 무제한 사용",
              },
              {
                emoji: "🏷️",
                title: "정식 출시 후 50% 할인",
                desc: "초기 테스터에게 정식 가격 영구 50% 할인 적용",
              },
              {
                emoji: "💬",
                title: "피드백 우선 반영",
                desc: "테스터분의 의견이 가장 먼저 개발에 반영됩니다",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100"
              >
                <div className="mb-4 text-3xl">{item.emoji}</div>
                <div className="mb-2 text-base font-bold">{item.title}</div>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 현재 단계 타임라인 */}
          <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h3 className="mb-6 text-center text-sm font-bold text-gray-800">개발 현황</h3>
            <div className="space-y-5">
              {[
                { done: true, label: "6컷 설득 구조 엔진", sub: "카테고리별 맞춤 문장 생성" },
                { done: true, label: "컷별 수정 기능", sub: "톤 조절 · 문장 다듬기 무제한" },
                { done: true, label: "이미지 자동 렌더링", sub: "바로 업로드 가능한 통이미지" },
                { done: false, label: "디자인 퀄리티 고도화", sub: "테스터 피드백 기반 개선 예정" },
                { done: false, label: "템플릿 · 폰트 · 컬러 확장", sub: "다양한 브랜드 톤 지원" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${
                      item.done
                        ? "bg-orange-500"
                        : "border-2 border-gray-300 bg-transparent"
                    }`}
                  />
                  <div>
                    <div className={`text-sm font-semibold ${item.done ? "text-gray-800" : "text-gray-400"}`}>
                      {item.done ? "✅" : "⏳"} {item.label}
                    </div>
                    <div className={`text-xs ${item.done ? "text-gray-500" : "text-gray-300"}`}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY WE STARTED ═══ */}
      <section className="border-y border-gray-100 bg-gray-50/80 py-20">
        <div
          id="story"
          data-animate
          className={`mx-auto max-w-2xl px-6 transition-all duration-700 ${vis("story") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-orange-600">
            Why we started
          </p>
          <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            왜 만들었느냐면
          </h2>

          <div className="relative rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50/80 to-amber-50/40 p-8 sm:p-10">
            <span className="absolute left-6 top-4 text-5xl font-extrabold leading-none text-orange-200">&ldquo;</span>
            <p className="relative z-10 text-base leading-[1.85] text-gray-600">
              상세페이지 외주를 맡기면 50만 원.
              <br />
              AI 도구로 직접 만들면 이미지는 나오는데, 전환이 안 됩니다.
              <br /><br />
              이유는 하나였습니다.
              <br />
              <strong className="text-gray-900">&ldquo;무엇을 먼저 말하고, 어떤 순서로 설득할지&rdquo;</strong>를
              잡아주는 도구가 없었습니다.
              <br /><br />
              그래서 만들기 시작했습니다.
              <br />
              디자인이 아니라, <strong className="text-orange-700">설득의 순서</strong>를 자동으로 구성하는 도구를.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-gray-900 text-white">
        <div
          id="final-cta"
          data-animate
          className={`mx-auto max-w-xl px-6 py-24 text-center transition-all duration-700 ${vis("final-cta") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-orange-500">
            Join Beta
          </p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            같이 만들어갈
            <br />
            <span className="text-orange-500">초기 멤버</span>를 찾습니다
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-gray-400">
            여러분의 피드백 하나하나가
            <br />이 서비스를 완성시킵니다.
          </p>

          <button
            onClick={handleCTA}
            className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:scale-[1.03] hover:shadow-xl active:scale-100"
          >
            베타 테스터로 시작하기
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <p className="mt-4 text-xs text-gray-500">이메일 하나로 바로 시작 · 가입 후 즉시 사용</p>

          <div className="mx-auto mt-12 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm backdrop-blur">
            <div>
              <div className="text-xl font-extrabold text-white">무료</div>
              <div className="mt-1 text-xs text-gray-500">베타 기간</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl font-extrabold text-white">30초</div>
              <div className="mt-1 text-xs text-gray-500">생성 소요</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl font-extrabold text-white">50%</div>
              <div className="mt-1 text-xs text-gray-500">정식 출시 할인</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 text-xs text-gray-400">
          <span>&copy; 2026 ProductBrain</span>
          <span>설득 구조 자동 완성 엔진</span>
        </div>
      </footer>
    </div>
  );
}

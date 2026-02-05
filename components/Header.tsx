"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  async function fetchCredits(userId: string) {
    const { data } = await supabaseBrowser
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();
    if (data) setCredits(data.credits);
  }

  useEffect(() => {
    async function check() {
      const { data } = await supabaseBrowser.auth.getSession();
      const u = data?.session?.user ?? null;
      setUser(u);
      if (u) await fetchCredits(u.id);
      setChecking(false);
    }
    check();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchCredits(u.id);
      else setCredits(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 페이지 이동 시 크레딧 새로고침
  useEffect(() => {
    if (user) fetchCredits(user.id);
  }, [pathname]);

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    setUser(null);
    setCredits(null);
    router.push("/");
  }

  const isLanding = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur transition-colors ${
        isLanding
          ? "border-transparent bg-white/70"
          : "border-neutral-200 bg-white/90"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white text-xs font-bold tracking-tighter group-hover:bg-neutral-700 transition-colors">
            PB
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">ProductBrain</div>
            <div className="text-[11px] text-neutral-400 font-medium">
              설득 구조 엔진
            </div>
          </div>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          {user && (
            <Link
              href="/generate"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/generate"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              생성하기
            </Link>
          )}

          {checking ? (
            <div className="h-9 w-16" />
          ) : user ? (
            <div className="flex items-center gap-2 ml-1">
              {/* 크레딧 표시 */}
              {credits !== null && (
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    credits > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span>{credits > 0 ? "⚡" : "⛔"}</span>
                  <span>크레딧 {credits}</span>
                </div>
              )}
              <span className="text-xs text-neutral-400 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/generate"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
              >
                시작하기
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

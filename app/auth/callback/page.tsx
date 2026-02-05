"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("로그인 처리 중...");

  useEffect(() => {
    async function handleAuth() {
      try {
        // 1) URL 해시에서 토큰 추출 시도
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          // hash를 파싱해서 세션 설정
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabaseBrowser.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              setStatus("로그인 성공! 이동 중...");
              router.push("/generate");
              return;
            }
          }
        }

        // 2) URL 파라미터에 code가 있는 경우 (PKCE flow)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
          if (!error) {
            setStatus("로그인 성공! 이동 중...");
            router.push("/generate");
            return;
          }
        }

        // 3) 이미 세션이 있는지 확인
        const { data } = await supabaseBrowser.auth.getSession();
        if (data?.session) {
          setStatus("로그인 성공! 이동 중...");
          router.push("/generate");
          return;
        }

        // 4) onAuthStateChange로 대기
        const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
          (event, session) => {
            if (event === "SIGNED_IN" && session) {
              setStatus("로그인 성공! 이동 중...");
              router.push("/generate");
            }
          }
        );

        // 8초 후에도 안 되면 로그인 페이지로
        setTimeout(() => {
          listener.subscription.unsubscribe();
          setStatus("로그인 시간 초과. 다시 시도해주세요.");
          router.push("/login");
        }, 8000);
      } catch (e) {
        setStatus("오류가 발생했습니다. 다시 시도해주세요.");
        setTimeout(() => router.push("/login"), 2000);
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="text-2xl animate-spin">⏳</div>
        <p className="text-sm text-gray-600">{status}</p>
        <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
      </div>
    </main>
  );
}

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
        // Supabase가 URL hash에 세션 정보를 넣어줌
        // supabaseBrowser가 자동으로 감지해서 세션 설정
        const { data, error } = await supabaseBrowser.auth.getSession();

        if (error) {
          setStatus("로그인 실패: " + error.message);
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        if (data?.session) {
          setStatus("로그인 성공! 이동 중...");
          router.push("/generate");
          return;
        }

        // 세션이 아직 없으면 onAuthStateChange로 대기
        const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
          (event, session) => {
            if (event === "SIGNED_IN" && session) {
              setStatus("로그인 성공! 이동 중...");
              router.push("/generate");
            }
          }
        );

        // 5초 후에도 안 되면 로그인 페이지로
        setTimeout(() => {
          listener.subscription.unsubscribe();
          setStatus("로그인 시간 초과. 다시 시도해주세요.");
          router.push("/login");
        }, 5000);
      } catch (e) {
        setStatus("오류가 발생했습니다.");
        setTimeout(() => router.push("/login"), 2000);
      }
    }

    handleAuth();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="text-2xl">🔄</div>
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </main>
  );
}

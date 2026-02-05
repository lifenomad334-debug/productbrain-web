"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import GenerateForm from "@/components/GenerateForm";

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data?.session?.user) {
        router.push("/login");
        return;
      }

      const uid = data.session.user.id;
      setUserId(uid);

      // 크레딧 조회
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("credits")
        .eq("id", uid)
        .single();

      setCredits(profile?.credits ?? 0);
      setChecking(false);
    }
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-sm text-neutral-400">로딩 중...</div>
      </div>
    );
  }

  // 크레딧 소진 안내
  if (credits !== null && credits <= 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-5xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          무료 크레딧을 모두 사용했습니다
        </h1>
        <p className="text-neutral-500 mb-2">
          초기 테스터분들께 제공된 무료 생성 크레딧이 소진되었습니다.
        </p>
        <p className="text-neutral-500 mb-8">
          유료 플랜을 준비 중입니다. 곧 더 많은 기능과 함께 돌아오겠습니다.
        </p>
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-5 text-sm text-neutral-600">
          <p className="font-semibold mb-1">💡 피드백을 남겨주세요</p>
          <p>생성 결과 페이지에서 피드백을 남겨주시면, 서비스 개선에 큰 도움이 됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">상세페이지 생성</h1>
          {credits !== null && (
            <span className="text-sm text-neutral-400">
              남은 크레딧: <span className="font-semibold text-neutral-700">{credits}</span>
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 mt-2">
          상품명 + 플랫폼 + 추가정보만 입력하면 설득 구조가 적용된 상세페이지를 자동 생성합니다.
        </p>
      </div>
      <GenerateForm userId={userId!} />
    </div>
  );
}

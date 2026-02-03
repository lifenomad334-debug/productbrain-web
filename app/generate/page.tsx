"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import GenerateForm from "@/components/GenerateForm";
import LogoutButton from "@/components/LogoutButton";

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        setChecking(false);
      } else {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">ProductBrain 생성</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{user?.email}</span>
          <LogoutButton />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        제품명 + 플랫폼 + 추가정보만 넣으면 상세페이지 이미지를 자동 생성합니다.
      </p>
      <div className="mt-6">
        <GenerateForm />
      </div>
    </main>
  );
}

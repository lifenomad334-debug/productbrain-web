"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const { error: authError } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setMagicSent(true);
    }
  }

  if (magicSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-bold">이메일을 확인하세요</h1>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{email}</span>으로 로그인 링크를 보냈습니다.
          </p>
          <p className="text-xs text-gray-400">
            메일이 안 보이면 스팸함을 확인해주세요.
          </p>
          <button
            onClick={() => setMagicSent(false)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            다시 보내기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ProductBrain</h1>
          <p className="text-sm text-gray-600 mt-2">
            이메일 하나로 바로 시작
          </p>
        </div>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">이메일</span>
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
          >
            {loading ? "전송 중..." : "로그인 링크 받기 →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          비밀번호 없이, 이메일 링크로 안전하게 로그인됩니다.
        </p>
      </div>
    </main>
  );
}

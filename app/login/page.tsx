"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Mode = "login" | "signup" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { error: signUpError } = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // 가입 후 바로 로그인 시도
        const { error: loginError } = await supabaseBrowser.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (loginError) {
          setError("가입 완료! 이메일 인증 후 로그인해주세요.");
        } else {
          router.push("/generate");
        }
      }
    } else {
      const { error: loginError } = await supabaseBrowser.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      setLoading(false);

      if (loginError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        router.push("/generate");
      }
    }
  }

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
          <button
            onClick={() => { setMagicSent(false); setMode("login"); }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            돌아가기
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
            {mode === "signup" ? "회원가입" : "로그인"}
          </p>
        </div>

        {mode !== "magic" ? (
          <form onSubmit={handlePasswordAuth} className="space-y-4">
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

            <label className="block">
              <span className="text-sm font-medium">비밀번호</span>
              <input
                type="password"
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6자 이상" : "비밀번호 입력"}
                minLength={6}
                required
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
            >
              {loading ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
            </button>
          </form>
        ) : (
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
              {loading ? "전송 중..." : "로그인 링크 받기"}
            </button>
          </form>
        )}

        <div className="space-y-2 text-center text-sm">
          {mode === "login" && (
            <>
              <p>
                계정이 없으신가요?{" "}
                <button onClick={() => { setMode("signup"); setError(""); }} className="text-blue-600 hover:text-blue-800 underline">
                  회원가입
                </button>
              </p>
              <p>
                <button onClick={() => { setMode("magic"); setError(""); }} className="text-gray-500 hover:text-gray-700 underline">
                  비밀번호 없이 이메일 링크로 로그인
                </button>
              </p>
            </>
          )}
          {mode === "signup" && (
            <p>
              이미 계정이 있으신가요?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-blue-600 hover:text-blue-800 underline">
                로그인
              </button>
            </p>
          )}
          {mode === "magic" && (
            <p>
              <button onClick={() => { setMode("login"); setError(""); }} className="text-blue-600 hover:text-blue-800 underline">
                비밀번호로 로그인
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

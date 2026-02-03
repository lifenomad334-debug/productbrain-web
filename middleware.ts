import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // /generate 경로만 보호
  if (!req.nextUrl.pathname.startsWith("/generate")) {
    return NextResponse.next();
  }

  // Supabase 세션 쿠키 확인 (sb-로 시작하는 쿠키가 있으면 로그인 상태)
  const allCookies = req.cookies.getAll();
  const hasSession = allCookies.some(
    (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
  );

  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate/:path*"],
};

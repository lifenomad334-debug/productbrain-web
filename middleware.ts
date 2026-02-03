import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  // /generate 경로만 보호
  if (!req.nextUrl.pathname.startsWith("/generate")) {
    return NextResponse.next();
  }

  // 쿠키에서 Supabase 세션 토큰 확인
  const allCookies = req.cookies.getAll();
  const authCookie = allCookies.find(
    (c) => c.name.includes("auth-token") || c.name.includes("sb-") && c.name.includes("-auth-token")
  );

  if (!authCookie) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/generate/:path*"],
};

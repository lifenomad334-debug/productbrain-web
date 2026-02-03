import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // 인증 체크는 클라이언트에서 처리
  return NextResponse.next();
}

export const config = {
  matcher: [],
};

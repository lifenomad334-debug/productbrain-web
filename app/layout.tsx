import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "ProductBrain — 설득 구조로 만드는 상세페이지",
    template: "%s — ProductBrain",
  },
  description:
    "카테고리별 설득 프리셋과 검증 엔진으로, AI 상세페이지 카피를 '팔리는 결과물'로 바꿉니다. 전자·식품·뷰티 프리셋 완성.",
  applicationName: "ProductBrain",
  metadataBase: new URL("https://productbrain-web-lyart.vercel.app"),
  openGraph: {
    title: "ProductBrain — 설득 구조로 만드는 상세페이지",
    description:
      "전자·식품·뷰티까지 검증된 프리셋과 검증 엔진으로, AI 카피를 '근거 있는 결과물'로 바꿉니다.",
    url: "/",
    siteName: "ProductBrain",
    locale: "ko_KR",
    type: "website",
    // images: [{ url: "/og.png", width: 1200, height: 630, alt: "ProductBrain" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProductBrain — 설득 구조로 만드는 상세페이지",
    description:
      "카테고리별 설득 프리셋 + validator + retry로 상세페이지 카피를 생성합니다.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
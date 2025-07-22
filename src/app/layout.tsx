import type { Metadata } from "next";
import { Inter, Comfortaa, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AppRouter } from "@/components/layout/AppRouter";
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

// 🎵 音楽的フォント設定
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TypeMate - あなたのタイプを誰より理解するAIパートナー",
  description: "🎵 音楽のように美しい、64タイプ特化の独自アーキタイプ診断とAIパートナーサービス。あなたらしい可能性を一緒に発見しましょう。",
  keywords: ["アーキタイプ", "64Type", "診断", "AI", "個性", "音楽的", "タイプ", "パーソナリティ"],
  authors: [{ name: "しげちゃん（BAR・ドラマー）", url: "https://typemate.ai" }],
  openGraph: {
    title: "TypeMate - あなたのタイプを誰より理解するAIパートナー",
    description: "🎵 音楽のように美しい、64タイプ特化の独自アーキタイプ診断とAIパートナーサービス",
    type: "website",
    locale: "ja_JP",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${comfortaa.variable} ${notoSansJP.variable} antialiased`}
      >
        <NextAuthProvider>
          <AuthProvider>
            <AppRouter>
              {children}
            </AppRouter>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 🚀 フォント数削減（パフォーマンス最適化）
import "./globals.css";
import { AppRouter } from "@/components/layout/AppRouter";
import { AuthProvider } from '@/components/providers/AuthProvider';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';

// 🚀 最適化フォント設定（単一フォント使用でパフォーマンス向上）
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true, // 最重要フォントのプリロード
  fallback: ['system-ui', 'arial'], // 確実なフォールバック
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
    siteName: "TypeMate",
  },
  // 🚀 パフォーマンス最適化メタデータ
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
  // 🚀 パフォーマンス設定
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable}>
      <head>
        {/* 🚀 DNS Prefetch（パフォーマンス向上） */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.supabase.co" />
        <link rel="dns-prefetch" href="//api.anthropic.com" />
        
        {/* 🎵 リソース Preload（重要なリソースの先読み） */}
        <link 
          rel="preload" 
          href="/fonts/inter-var.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        
        {/* 🚀 Critical CSS（将来実装用） */}
        {/* <style dangerouslySetInnerHTML={{ __html: criticalCss }} /> */}
      </head>
      <body className="antialiased">
        {/* 🎵 パフォーマンス監視プロバイダー */}
        <PerformanceProvider>
          <AuthProvider>
            <AppRouter>
              {children}
            </AppRouter>
          </AuthProvider>
        </PerformanceProvider>
        
        {/* 🚀 Service Worker登録（将来のPWA対応） */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js');
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
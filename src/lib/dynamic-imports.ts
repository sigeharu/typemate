// 🎵 TypeMate Dynamic Component Registry
// パフォーマンス最適化のためのDynamic Imports管理
// Context7推奨: 効果的な動的インポート戦略

import dynamic from 'next/dynamic';
import React from 'react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

// 🚀 Context7推奨: 外部ライブラリの動的読み込み
export const loadExternalLibrary = async (libraryName: string) => {
  switch (libraryName) {
    case 'fuse':
      // Context7例: const Fuse = (await import('fuse.js')).default
      // return (await import('fuse.js')).default; // コメントアウト - 未インストール
      throw new Error('fuse.js is not installed');
    case 'confetti':
      return (await import('canvas-confetti')).default;
    case 'crypto':
      return await import('crypto-js');
    default:
      throw new Error(`Unknown library: ${libraryName}`);
  }
};

// 🔮 占星術関連（重いコンポーネント）
export const HarmonicSetupWizard = dynamic(
  () => import('@/components/harmonic/HarmonicSetupWizard'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "ハーモニックAI準備中...", variant: "auth" }),
    ssr: false // クライアントサイドのみで実行
  }
);

export const CompatibilityAnalysisWidget = dynamic(
  () => import('@/components/harmonic/CompatibilityAnalysisWidget'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "相性分析中...", variant: "chat" }),
    ssr: false
  }
);

export const MonthlyGuidanceWidget = dynamic(
  () => import('@/components/harmonic/MonthlyGuidanceWidget'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "月間ガイダンス読み込み中...", variant: "chat" }),
    ssr: false
  }
);

// 💬 チャット関連（条件付きで重い）
export const ChatHistory = dynamic(
  () => import('@/components/chat/ChatHistory'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "チャット履歴読み込み中...", variant: "chat" }),
    ssr: false
  }
);

export const MemoryAlbum = dynamic(
  () => import('@/components/relationship/MemoryAlbum'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "思い出アルバム読み込み中...", variant: "chat" }),
    ssr: false
  }
);

// 🛡️ プライバシー・設定関連
export const SecurityDetailsModal = dynamic(
  () => import('@/components/privacy/SecurityDetailsModal'),
  { 
    loading: () => React.createElement('div', { className: 'animate-pulse bg-gray-200 h-96 rounded-lg' }),
    ssr: false
  }
);

// 📊 診断・分析関連
export const TypeDetailDisplay = dynamic(
  () => import('@/components/TypeDetailDisplay'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "診断結果準備中...", variant: "diagnosis" }),
    ssr: true // SEO重要なので SSR有効
  }
);

export const DiagnosticResult = dynamic(
  () => import('@/components/diagnosis/DiagnosticResult'),
  { 
    loading: () => React.createElement(LoadingScreen, { title: "結果生成中...", variant: "diagnosis" }),
    ssr: true
  }
);

// 🎨 アニメーション関連（条件付き読み込み）
export const MusicalMotion = dynamic(
  () => import('@/components/animations/MusicalMotion').then(mod => ({ default: mod.MusicalMotion })),
  { 
    loading: () => React.createElement('div', { className: 'animate-pulse' }),
    ssr: false
  }
);

// 📱 認証関連
export const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal'),
  { 
    loading: () => React.createElement('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center' }, React.createElement(LoadingScreen, { title: '認証準備中...', variant: 'auth' })),
    ssr: false
  }
);

// 💡 使用例とベストプラクティス
/*
使用方法:
import { HarmonicSetupWizard } from '@/lib/dynamic-imports';

// 条件付き読み込み例:
const DynamicComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false, // クライアントサイドのみ
  }
);

// 複数エクスポートの場合:
const SpecificExport = dynamic(
  () => import('./MultiExport').then(mod => ({ default: mod.SpecificComponent })),
  { loading: () => <Loading /> }
);
*/
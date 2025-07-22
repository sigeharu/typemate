// 🎵 TypeMate PageLayout Component
// 全ページで使用する統一レイアウト

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from './PageHeader';
import { BackgroundPattern } from './BackgroundPattern';
import { LoadingScreen } from './LoadingScreen';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  /** ページのタイトル */
  title?: string;
  /** ページの説明 */
  description?: string;
  /** ヘッダーを表示するか */
  showHeader?: boolean;
  /** 背景パターンを表示するか */
  showBackground?: boolean;
  /** ローディング状態 */
  loading?: boolean;
  /** カスタムヘッダーコンポーネント */
  customHeader?: ReactNode;
  /** 背景グラデーションのバリエーション */
  backgroundVariant?: 'default' | 'chat' | 'diagnosis' | 'profile';
  /** コンテナの最大幅 */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | 'full';
  /** 追加のCSSクラス */
  className?: string;
  /** 戻るボタンを表示するか */
  showBackButton?: boolean;
  /** 戻るボタンの遷移先 */
  backTo?: string;
  /** 認証関連ボタンを表示するか */
  showAuth?: boolean;
  /** 設定ボタンを表示するか */
  showSettings?: boolean;
  /** 認証状態変更時のコールバック */
  onAuthStateChange?: () => void;
  /** ページ固有のメタデータ */
  meta?: {
    canonical?: string;
    robots?: string;
  };
}

const backgroundVariants = {
  default: 'bg-gradient-to-br from-blue-50 via-slate-50 to-white',
  chat: 'bg-white',
  diagnosis: 'bg-gradient-to-br from-slate-50 via-blue-50 to-white',
  profile: 'bg-gradient-to-br from-blue-50 via-purple-50 to-white'
};

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full'
};

export const PageLayout = ({
  children,
  title,
  description,
  showHeader = true,
  showBackground = true,
  loading = false,
  customHeader,
  backgroundVariant = 'default',
  maxWidth = '4xl',
  className,
  showBackButton = false,
  backTo,
  showAuth = true,
  showSettings = true,
  onAuthStateChange,
  meta
}: PageLayoutProps) => {
  // ローディング状態の場合
  if (loading) {
    return <LoadingScreen title={title} description={description} />;
  }

  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      backgroundVariants[backgroundVariant],
      className
    )}>
      {/* SEO Meta Tags */}
      {meta && (
        <>
          {meta.canonical && <link rel="canonical" href={meta.canonical} />}
          {meta.robots && <meta name="robots" content={meta.robots} />}
        </>
      )}

      {/* Header */}
      {showHeader && (customHeader || (
        <PageHeader 
          title={title}
          description={description}
          variant={backgroundVariant}
          showBackButton={showBackButton}
          backTo={backTo}
          showAuth={showAuth}
          showSettings={showSettings}
          onAuthStateChange={onAuthStateChange}
        />
      ))}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          'flex-1 flex flex-col items-center justify-start py-8 px-4',
          maxWidthClasses[maxWidth],
          'w-full'
        )}
      >
        {children}
      </motion.main>

      {/* Background Pattern */}
      {showBackground && <BackgroundPattern variant={backgroundVariant} />}
    </div>
  );
};

// 特定ページ用のレイアウトコンポーネント
export const ChatPageLayout = ({ children, ...props }: Omit<PageLayoutProps, 'backgroundVariant' | 'maxWidth'>) => (
  <PageLayout 
    {...props}
    backgroundVariant="chat" 
    maxWidth="full"
    showBackground={false}
  >
    {children}
  </PageLayout>
);

export const DiagnosisPageLayout = ({ children, ...props }: Omit<PageLayoutProps, 'backgroundVariant'>) => (
  <PageLayout 
    {...props}
    backgroundVariant="diagnosis"
  >
    {children}
  </PageLayout>
);

export const ProfilePageLayout = ({ children, ...props }: Omit<PageLayoutProps, 'backgroundVariant'>) => (
  <PageLayout 
    {...props}
    backgroundVariant="profile"
  >
    {children}
  </PageLayout>
);
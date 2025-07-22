// 🎵 TypeMate PageHeader Component
// 統一されたページヘッダー

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, LogIn, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** ページタイトル */
  title?: string;
  /** ページ説明 */
  description?: string;
  /** 戻るボタンを表示するか */
  showBackButton?: boolean;
  /** 戻るボタンの遷移先（デフォルトは前のページ） */
  backTo?: string;
  /** 認証関連ボタンを表示するか */
  showAuth?: boolean;
  /** 設定ボタンを表示するか */
  showSettings?: boolean;
  /** カスタムアクションボタン */
  customActions?: ReactNode;
  /** ヘッダーのバリエーション */
  variant?: 'default' | 'chat' | 'diagnosis' | 'profile';
  /** 追加のCSSクラス */
  className?: string;
  /** 認証状態変更時のコールバック */
  onAuthStateChange?: () => void;
}

const headerVariants = {
  default: 'bg-white/80 backdrop-blur-sm border-b border-slate-200',
  chat: 'bg-white border-b border-gray-200',
  diagnosis: 'bg-white/90 backdrop-blur-md border-b border-blue-200',
  profile: 'bg-white/90 backdrop-blur-md border-b border-purple-200'
};

export const PageHeader = ({
  title,
  description,
  showBackButton = false,
  backTo,
  showAuth = true,
  showSettings = true,
  customActions,
  variant = 'default',
  className,
  onAuthStateChange
}: PageHeaderProps) => {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleBack = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onAuthStateChange?.();
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky top-0 z-50 px-4 py-4',
        headerVariants[variant],
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          
          {(title || description) && (
            <div className="hidden sm:block">
              {title && (
                <h1 className="text-lg font-semibold text-slate-900">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-slate-600">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Center Section - Title for mobile */}
        {title && (
          <div className="sm:hidden">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h1>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {customActions}

          {/* Auth Section */}
          {showAuth && !loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* User Info - Hidden on mobile */}
                  <span className="hidden md:block text-sm text-slate-600 truncate max-w-32">
                    {user.user_metadata?.display_name || user.email}
                  </span>
                  
                  {/* Settings Button */}
                  {showSettings && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleProfile}
                      title="プロファイル"
                    >
                      <User size={16} className="md:mr-1" />
                      <span className="hidden md:inline">プロファイル</span>
                    </Button>
                  )}
                  
                  {/* Sign Out Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="hidden sm:flex"
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  {/* Sign In Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push('/auth/signin')}
                  >
                    <LogIn size={16} className="mr-1" />
                    <span className="hidden sm:inline">ログイン</span>
                  </Button>
                  
                  {/* Sign Up Button */}
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/auth/signup')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <span className="hidden sm:inline">無料登録</span>
                    <span className="sm:hidden">登録</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu for signed-in users */}
      {user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="sm:hidden mt-4 pt-4 border-t border-slate-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 truncate">
              {user.user_metadata?.display_name || user.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
            >
              ログアウト
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
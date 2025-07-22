// 🎵 TypeMate LoadingScreen Component
// 統一されたローディング画面

'use client';

import { motion } from 'framer-motion';
import { Sparkles, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  /** ローディングメッセージのタイトル */
  title?: string;
  /** ローディングメッセージの説明 */
  description?: string;
  /** ローディングのバリエーション */
  variant?: 'default' | 'chat' | 'diagnosis' | 'auth';
  /** フルスクリーンローディングか */
  fullScreen?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

const loadingVariants = {
  default: {
    background: 'bg-gradient-to-br from-blue-50 via-slate-50 to-white',
    icon: Sparkles,
    color: 'text-blue-500',
    message: 'TypeMateを準備中...'
  },
  chat: {
    background: 'bg-white',
    icon: Music,
    color: 'text-slate-600',
    message: 'あなた専用のAIパートナーを準備中...'
  },
  diagnosis: {
    background: 'bg-gradient-to-br from-slate-50 via-blue-50 to-white',
    icon: Sparkles,
    color: 'text-blue-600',
    message: '64Type診断を準備中...'
  },
  auth: {
    background: 'bg-gradient-to-br from-blue-50 via-purple-50 to-white',
    icon: Sparkles,
    color: 'text-purple-500',
    message: '認証中...'
  }
};

export const LoadingScreen = ({
  title,
  description,
  variant = 'default',
  fullScreen = true,
  className
}: LoadingScreenProps) => {
  const config = loadingVariants[variant];
  const IconComponent = config.icon;

  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Loading Icon with Animation */}
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className={cn(
            "w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white",
            "shadow-lg"
          )}
        >
          <IconComponent size={32} />
        </motion.div>
        
        {/* Pulse Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          className="absolute inset-0 w-16 h-16 rounded-full bg-blue-200"
        />
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className={cn(
          "text-xl font-semibold",
          config.color
        )}>
          {title || config.message}
        </h2>
        
        {description && (
          <p className="text-slate-600 text-sm max-w-md">
            {description}
          </p>
        )}
      </motion.div>

      {/* Loading Dots Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex gap-1 mt-6"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className={cn(
              "w-2 h-2 rounded-full",
              config.color.replace('text-', 'bg-')
            )}
          />
        ))}
      </motion.div>

      {/* Musical Note Animation for TypeMate Branding */}
      <motion.div
        animate={{ 
          rotate: [0, 10, 0, -10, 0],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut"
        }}
        className="absolute top-8 right-8 text-4xl opacity-20"
      >
        🎵
      </motion.div>
      
      <motion.div
        animate={{ 
          rotate: [0, -8, 0, 8, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-12 left-8 text-3xl opacity-20"
      >
        🎶
      </motion.div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        config.background,
        className
      )}
    >
      {content}
    </motion.div>
  );
};

// 特定用途のローディングコンポーネント
export const ChatLoadingScreen = (props: Omit<LoadingScreenProps, 'variant'>) => (
  <LoadingScreen {...props} variant="chat" />
);

export const DiagnosisLoadingScreen = (props: Omit<LoadingScreenProps, 'variant'>) => (
  <LoadingScreen {...props} variant="diagnosis" />
);

export const AuthLoadingScreen = (props: Omit<LoadingScreenProps, 'variant'>) => (
  <LoadingScreen {...props} variant="auth" />
);
// 🎵 TypeMate Musical Motion Components
// しげちゃんの音楽的美的センス統合アニメーション

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { MusicalStyle } from '@/types/mbti';
import { ReactNode } from 'react';

// 🎼 音楽的アニメーション設定
export const musicMotionVariants = {
  // 天野達也風 - テクニカルで正確
  technical: {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(2px)' },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      filter: 'blur(2px)'
    },
    hover: {
      scale: 1.02
    }
  },

  // tuki.風 - 繊細で心に響く
  gentle: {
    initial: { opacity: 0, y: 20, filter: 'blur(1px)' },
    animate: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      filter: 'blur(1px)'
    },
    hover: {
      y: -2
    }
  },

  // Ash island風 - エネルギッシュで力強い
  energetic: {
    initial: { 
      opacity: 0, 
      x: -50, 
      scale: 0.8,
      rotate: -2
    },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      rotate: 0
    },
    exit: { 
      opacity: 0, 
      x: 50, 
      scale: 0.8,
      rotate: 2
    },
    hover: {
      scale: 1.05,
      rotate: 1
    }
  },

  // YOASOBI風 - 親しみやすく心地よい
  friendly: {
    initial: { 
      opacity: 0, 
      rotate: -5,
      scale: 0.9
    },
    animate: { 
      opacity: 1, 
      rotate: 0,
      scale: 1
    },
    exit: { 
      opacity: 0, 
      rotate: 5,
      scale: 0.9
    },
    hover: {
      rotate: 2,
      scale: 1.03
    }
  }
};

// 🎵 メインモーションコンポーネント
interface MusicalMotionProps extends HTMLMotionProps<"div"> {
  musicStyle?: MusicalStyle;
  children: ReactNode;
  enableHover?: boolean;
  enableStagger?: boolean;
}

export const MusicalMotion = ({ 
  musicStyle = 'friendly', 
  children, 
  enableHover = true,
  enableStagger = false,
  ...props 
}: MusicalMotionProps) => {
  const variants = musicMotionVariants[musicStyle];
  
  const getTransition = () => {
    const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => [x1, y1, x2, y2] as const;
    
    switch (musicStyle) {
      case 'technical':
        return { duration: 0.3, ease: cubicBezier(0.4, 0, 0.2, 1) };
      case 'gentle':
        return { duration: 0.5, ease: cubicBezier(0.4, 0, 0.6, 1) };
      case 'energetic':
        return { duration: 0.4, ease: cubicBezier(0.68, -0.55, 0.265, 1.55) };
      case 'friendly':
        return { duration: 0.6, ease: cubicBezier(0.4, 0, 0.2, 1) };
      default:
        return { duration: 0.5, ease: cubicBezier(0.4, 0, 0.6, 1) };
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={enableHover ? "hover" : undefined}
      variants={variants}
      transition={getTransition()}
      {...props}
    >
      {enableStagger ? (
        <motion.div variants={variants}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
};

// 🌟 ENFP専用アニメーション
export const ENFPSparkle = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { delay, duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] as const }
    }}
    whileHover={{
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 }
    }}
  >
    {children}
  </motion.div>
);

// 🎼 ページ遷移アニメーション
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
    animate={{ 
      opacity: 1, 
      x: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }
    }}
    exit={{ 
      opacity: 0, 
      x: -20, 
      filter: 'blur(5px)',
      transition: { duration: 0.4 }
    }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// 🎯 プログレスバー（音楽的）
interface MusicalProgressProps {
  progress: number;
  musicStyle?: MusicalStyle;
  className?: string;
}

export const MusicalProgress = ({ 
  progress, 
  musicStyle = 'friendly', 
  className = '' 
}: MusicalProgressProps) => {
  const progressColor = {
    technical: 'bg-primary-600',
    gentle: 'bg-enfp-harmony',
    energetic: 'bg-enfp-energy',
    friendly: 'bg-primary-300'
  };

  return (
    <div className={`w-full bg-crisp-platinum rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${progressColor[musicStyle]} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ 
          duration: 0.8, 
          ease: musicStyle === 'technical' ? [0.4, 0, 0.2, 1] as const : [0.4, 0, 0.6, 1] as const
        }}
      />
      {/* 音楽的キラキラエフェクト */}
      {progress > 0 && (
        <motion.div
          className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full opacity-60"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1] as const
          }}
          style={{ right: `${100 - progress}%` }}
        />
      )}
    </div>
  );
};

// 🎭 カード展開アニメーション
export const MusicalCard = ({ 
  children, 
  musicStyle = 'gentle',
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  musicStyle?: MusicalStyle;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={`card-crisp ${className}`}
    variants={musicMotionVariants[musicStyle]}
    initial="initial"
    animate="animate"
    whileHover="hover"
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

// 🌈 色彩変化アニメーション
export const ColorMorph = ({ 
  children,
  colors = ['#f97316', '#10b981', '#8b5cf6'],
  duration = 3
}: {
  children: ReactNode;
  colors?: string[];
  duration?: number;
}) => (
  <motion.div
    animate={{
      color: colors,
      transition: {
        duration,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    }}
  >
    {children}
  </motion.div>
);

// 🎵 浮遊アニメーション（tuki.風）
export const GentleFloat = ({ 
  children,
  amplitude = 5,
  duration = 2
}: {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
}) => (
  <motion.div
    animate={{
      y: [-amplitude, amplitude, -amplitude],
      transition: {
        duration,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    }}
  >
    {children}
  </motion.div>
);

// ✨ パルスアニメーション（Ash island風）
export const EnergeticPulse = ({ 
  children,
  scale = 1.05,
  duration = 1
}: {
  children: ReactNode;
  scale?: number;
  duration?: number;
}) => (
  <motion.div
    animate={{
      scale: [1, scale, 1],
      transition: {
        duration,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    }}
  >
    {children}
  </motion.div>
);

// 🎊 成功アニメーション
export const SuccessAnimation = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ 
      scale: [0.8, 1.1, 1], 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] as const }
    }}
    whileHover={{
      scale: 1.05,
      transition: { duration: 0.2 }
    }}
  >
    <motion.div
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(249, 115, 22, 0)',
          '0 0 0 20px rgba(249, 115, 22, 0.1)',
          '0 0 0 40px rgba(249, 115, 22, 0)'
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-full"
    >
      {children}
    </motion.div>
  </motion.div>
);

// 🎯 注目アニメーション
export const AttentionGrabber = ({ children }: { children: ReactNode }) => (
  <motion.div
    animate={{
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1]
      }
    }}
  >
    {children}
  </motion.div>
);
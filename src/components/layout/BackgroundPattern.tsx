// 🎵 TypeMate BackgroundPattern Component
// 統一された背景装飾パターン

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BackgroundPatternProps {
  /** 背景パターンのバリエーション */
  variant?: 'default' | 'chat' | 'diagnosis' | 'profile';
  /** アニメーションの強度 */
  intensity?: 'low' | 'medium' | 'high';
  /** 装飾要素の数 */
  elementCount?: 'minimal' | 'normal' | 'rich';
  /** 追加のCSSクラス */
  className?: string;
}

const patternConfigs = {
  default: {
    shapes: {
      count: 6,
      colors: 'from-blue-200/15 via-slate-200/10 to-purple-200/15',
      size: { min: 100, max: 300 }
    },
    decorations: [
      { emoji: '🎵', color: 'text-blue-300/20', count: 3 },
      { emoji: '💖', color: 'text-purple-300/15', count: 2 }
    ]
  },
  chat: {
    shapes: {
      count: 3,
      colors: 'from-slate-100/20 to-blue-100/20',
      size: { min: 60, max: 150 }
    },
    decorations: [
      { emoji: '🎵', color: 'text-slate-200/40', count: 1 }
    ]
  },
  diagnosis: {
    shapes: {
      count: 5,
      colors: 'from-blue-200/20 via-indigo-200/15 to-slate-200/20',
      size: { min: 80, max: 250 }
    },
    decorations: [
      { emoji: '✨', color: 'text-blue-300/25', count: 2 },
      { emoji: '🎯', color: 'text-indigo-300/20', count: 1 }
    ]
  },
  profile: {
    shapes: {
      count: 4,
      colors: 'from-purple-200/20 via-blue-200/15 to-pink-200/20',
      size: { min: 90, max: 200 }
    },
    decorations: [
      { emoji: '🎭', color: 'text-purple-300/25', count: 2 },
      { emoji: '💫', color: 'text-pink-300/20', count: 1 }
    ]
  }
};

const intensityMultipliers = {
  low: { movement: 0.5, duration: 1.5, opacity: 0.5 },
  medium: { movement: 1, duration: 1, opacity: 1 },
  high: { movement: 1.5, duration: 0.7, opacity: 1.2 }
};

const elementCountMultipliers = {
  minimal: 0.5,
  normal: 1,
  rich: 1.5
};

export const BackgroundPattern = ({
  variant = 'default',
  intensity = 'medium',
  elementCount = 'normal',
  className
}: BackgroundPatternProps) => {
  const config = patternConfigs[variant];
  const intensityConfig = intensityMultipliers[intensity];
  const countMultiplier = elementCountMultipliers[elementCount];

  const shapeCount = Math.round(config.shapes.count * countMultiplier);

  return (
    <div className={cn(
      "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
      className
    )}>
      {/* Floating Shapes */}
      {[...Array(shapeCount)].map((_, i) => {
        const size = Math.random() * (config.shapes.size.max - config.shapes.size.min) + config.shapes.size.min;
        const duration = (Math.random() * 15 + 20) * intensityConfig.duration;
        const movementRange = 80 * intensityConfig.movement;
        
        return (
          <motion.div
            key={`shape-${i}`}
            className={cn(
              "absolute rounded-full bg-gradient-to-r",
              config.shapes.colors
            )}
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 * intensityConfig.opacity
            }}
            animate={{
              x: [0, Math.random() * movementRange - movementRange/2],
              y: [0, Math.random() * movementRange - movementRange/2],
              rotate: [0, 360],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        );
      })}

      {/* Decorative Emojis */}
      {config.decorations.map((decoration, decorationIndex) => {
        const decorationCount = Math.round(decoration.count * countMultiplier);
        
        return [...Array(decorationCount)].map((_, i) => {
          const duration = (Math.random() * 10 + 15) * intensityConfig.duration;
          const rotationRange = 20 * intensityConfig.movement;
          
          return (
            <motion.div
              key={`decoration-${decorationIndex}-${i}`}
              className={cn(
                "absolute text-6xl select-none",
                decoration.color
              )}
              style={{
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                opacity: 0.4 * intensityConfig.opacity
              }}
              animate={{
                rotate: [0, rotationRange, 0, -rotationRange, 0],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            >
              {decoration.emoji}
            </motion.div>
          );
        });
      })}

      {/* Subtle Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5" />
      
      {/* Corner Accent */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-blue-200/10 to-transparent rounded-full"
      />
      
      <motion.div
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.08, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-purple-200/10 to-transparent rounded-full"
      />
    </div>
  );
};

// 特定用途の背景パターンコンポーネント
export const ChatBackgroundPattern = (props: Omit<BackgroundPatternProps, 'variant'>) => (
  <BackgroundPattern {...props} variant="chat" intensity="low" elementCount="minimal" />
);

export const DiagnosisBackgroundPattern = (props: Omit<BackgroundPatternProps, 'variant'>) => (
  <BackgroundPattern {...props} variant="diagnosis" intensity="medium" elementCount="normal" />
);

export const ProfileBackgroundPattern = (props: Omit<BackgroundPatternProps, 'variant'>) => (
  <BackgroundPattern {...props} variant="profile" intensity="medium" elementCount="rich" />
);
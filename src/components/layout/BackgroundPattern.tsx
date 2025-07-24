// 🎵 TypeMate BackgroundPattern Component
// 統一された背景装飾パターン

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [randomValues, setRandomValues] = useState<{ shapes: Array<{ size: number; x: number; y: number; duration: number; movementX: number; movementY: number; delay: number; }>; decorations: Array<{ x: number; y: number; duration: number; delay: number; }>[]; }>({ shapes: [], decorations: [] });

  const config = patternConfigs[variant];
  const intensityConfig = intensityMultipliers[intensity];
  const countMultiplier = elementCountMultipliers[elementCount];
  const shapeCount = Math.round(config.shapes.count * countMultiplier);

  useEffect(() => {
    setMounted(true);
    
    // Generate all random values once on client side
    const shapes = Array.from({ length: shapeCount }, () => {
      const size = Math.random() * (config.shapes.size.max - config.shapes.size.min) + config.shapes.size.min;
      const duration = (Math.random() * 15 + 20) * intensityConfig.duration;
      const movementRange = 80 * intensityConfig.movement;
      
      return {
        size,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration,
        movementX: Math.random() * movementRange - movementRange/2,
        movementY: Math.random() * movementRange - movementRange/2,
        delay: Math.random() * 10
      };
    });
    
    const decorations = config.decorations.map(decoration => {
      const decorationCount = Math.round(decoration.count * countMultiplier);
      return Array.from({ length: decorationCount }, () => ({
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5,
        duration: (Math.random() * 10 + 15) * intensityConfig.duration,
        delay: Math.random() * 5
      }));
    });
    
    setRandomValues({ shapes, decorations });
  }, [variant, intensity, elementCount, shapeCount, config.shapes.size.max, config.shapes.size.min, intensityConfig.duration, intensityConfig.movement, config.decorations, countMultiplier]);

  if (!mounted) {
    return (
      <div className={cn(
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
        className
      )} />
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 -z-10 overflow-hidden pointer-events-none",
      className
    )}>
      {/* Floating Shapes */}
      {randomValues.shapes.map((shape, i) => (
        <motion.div
          key={`shape-${i}`}
          className={cn(
            "absolute rounded-full bg-gradient-to-r",
            config.shapes.colors
          )}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            opacity: 0.3 * intensityConfig.opacity
          }}
          animate={{
            x: [0, shape.movementX],
            y: [0, shape.movementY],
            rotate: [0, 360],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear",
            delay: shape.delay
          }}
        />
      ))}

      {/* Decorative Emojis */}
      {config.decorations.map((decoration, decorationIndex) => {
        const rotationRange = 20 * intensityConfig.movement;
        
        return randomValues.decorations[decorationIndex]?.map((decorationData, i) => (
          <motion.div
            key={`decoration-${decorationIndex}-${i}`}
            className={cn(
              "absolute text-6xl select-none",
              decoration.color
            )}
            style={{
              left: `${decorationData.x}%`,
              top: `${decorationData.y}%`,
              opacity: 0.4 * intensityConfig.opacity
            }}
            animate={{
              rotate: [0, rotationRange, 0, -rotationRange, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: decorationData.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: decorationData.delay
            }}
          >
            {decoration.emoji}
          </motion.div>
        )) || [];
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
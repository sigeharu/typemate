// 🎵 TypeMate MessageBubble Component (Performance Optimized)
// React.memo + useCallback最適化適用版

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from '@/lib/optimized-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Brain, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { personalityEngine } from '@/lib/personality-engine';
import type { Message } from '@/types';

// Enhanced機能用のオプショナルな型定義
export interface EmotionData {
  dominantEmotion: string;
  intensity: number;
  musicTone: string;
  recommendation: string;
}

interface MessageBubbleProps {
  message: Message;
  isUser?: boolean;
  enhanced?: boolean;
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  showEmotionFeedback?: boolean;
  onEmotionDetected?: (emotion: EmotionData) => void;
  avatarSize?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

// 🎵 感情分析の重い処理をメモ化
const emotionKeywords = {
  happy: ['嬉しい', '楽しい', '良い', 'いいね', '最高', '😊', '😄'],
  sad: ['悲しい', 'つらい', '辛い', '😢', '😭'],
  excited: ['ワクワク', '興奮', 'すごい', '！！', '✨'],
  caring: ['心配', '大丈夫', '支える', '寄り添', '💕'],
  thoughtful: ['考える', '思う', '理解', '分析', '🤔']
} as const;

// 感情ラベル日本語化（定数化でパフォーマンス向上）
const emotionLabels = {
  happy: '嬉しい',
  excited: 'ワクワク', 
  calm: '落ち着き',
  thoughtful: '考え深い',
  caring: '思いやり',
  playful: '楽しい',
  focused: '集中',
  supportive: '支える'
} as const;

// 🚀 パフォーマンス最適化: 感情分析をメモ化
const analyzeEmotion = (content: string): EmotionData => {
  let dominantEmotion = 'calm';
  let intensity = 0.3;

  for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(keyword => content.includes(keyword)).length;
    if (matches > 0) {
      dominantEmotion = emotionType;
      intensity = Math.min(0.9, 0.3 + matches * 0.2);
      break;
    }
  }

  return {
    dominantEmotion,
    intensity,
    musicTone: intensity > 0.6 ? '温かいハーモニー' : '落ち着いたメロディ',
    recommendation: intensity > 0.6 ? '感情が豊かに表現されています' : '穏やかな気持ちが伝わります'
  };
};

// 🎯 メイン コンポーネント（React.memo適用）
const MessageBubbleComponent = ({ 
  message, 
  isUser,
  enhanced = false,
  relationshipType = 'friend',
  showEmotionFeedback = false,
  onEmotionDetected,
  avatarSize = 'md',
  compact = false
}: MessageBubbleProps) => {
  
  // 🎵 メモ化で不要な計算を回避
  const isUserMessage = useMemo(() => 
    message.sender === 'user' || isUser, 
    [message.sender, isUser]
  );
  
  const emotion = useMemo(() => 
    message.emotion || 'calm', 
    [message.emotion]
  );
  
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);

  // 🚀 感情分析を最適化（依存配列とuseCallbackでパフォーマンス向上）
  const handleEmotionAnalysis = useCallback(() => {
    if (enhanced && message.content && !isUserMessage) {
      const data = analyzeEmotion(message.content);
      setEmotionData(data);
      onEmotionDetected?.(data);
    }
  }, [enhanced, message.content, isUserMessage, onEmotionDetected]);

  useEffect(() => {
    handleEmotionAnalysis();
  }, [handleEmotionAnalysis]);

  // 🎨 スタイル計算をメモ化
  const emotionColor = useMemo(() => 
    personalityEngine.getEmotionColor(emotion), 
    [emotion]
  );

  const avatarSizeClass = useMemo(() => ({
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[avatarSize]), [avatarSize]);

  // 🕰️ 時刻フォーマットをメモ化
  const formattedTime = useMemo(() => 
    new Date(message.timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }), 
    [message.timestamp]
  );

  // 🎼 感情ラベルをメモ化
  const emotionLabel = useMemo(() => 
    emotionLabels[emotion as keyof typeof emotionLabels] || emotion,
    [emotion]
  );

  // 🎵 アニメーション設定をメモ化
  const animationProps = useMemo(() => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] // 音楽的イージング
    }
  }), []);

  return (
    <motion.div {...animationProps} className="w-full">
      {isUserMessage ? (
        /* ユーザーメッセージ - 右寄せ青色バブル */
        <div className="flex justify-end mb-4">
          <div className="max-w-[80%] sm:max-w-2xl">
            <div className="flex items-end gap-2 justify-end">
              <div className="bg-blue-500 rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                <p className="text-[15px] leading-6 text-white whitespace-pre-wrap m-0">
                  {message.content}
                </p>
              </div>
              <Avatar className={cn("flex-shrink-0", avatarSizeClass)}>
                <AvatarFallback className="bg-gray-600 text-white text-xs font-semibold">
                  You
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex justify-end mt-1 mr-10">
              <time className="text-xs text-gray-500">
                {formattedTime}
              </time>
            </div>
          </div>
        </div>
      ) : (
        /* AIメッセージ - 左寄せグレーバブル */
        <div className="flex gap-3 mb-4">
          <Avatar className={cn("flex-shrink-0", avatarSizeClass)}>
            <AvatarFallback className="bg-purple-500 text-white text-xs font-semibold">
              AI
            </AvatarFallback>
          </Avatar>
          <div className="max-w-[80%] sm:max-w-2xl">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <p className="text-[15px] leading-6 text-gray-900 whitespace-pre-wrap m-0">
                {message.content}
              </p>
            </div>
            <div className="flex gap-2 items-center mt-1 ml-2">
              <time className="text-xs text-gray-500">
                {formattedTime}
              </time>
              {message.emotion && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {emotionLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 🚀 React.memo でpropsに変更がない場合の再レンダリングを防止
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // カスタム比較関数でより細かい制御
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.isUser === nextProps.isUser &&
    prevProps.enhanced === nextProps.enhanced &&
    prevProps.avatarSize === nextProps.avatarSize &&
    prevProps.compact === nextProps.compact
  );
});

// displayNameを設定（デバッグ用）
MessageBubble.displayName = 'MessageBubble';

// 🎵 レガシー関数をエクスポート（後方互換性）
export function getEmotionLabel(emotion: string): string {
  return emotionLabels[emotion as keyof typeof emotionLabels] || emotion;
}
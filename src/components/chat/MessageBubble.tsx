// 🎵 TypeMate MessageBubble Component (Modern Design)
// Context7インスパイアの洗練されたメッセージUI

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  /** Enhanced機能を有効にするか */
  enhanced?: boolean;
  /** 関係性タイプ（Enhanced機能用） */
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  /** 感情フィードバックを表示するか */
  showEmotionFeedback?: boolean;
  /** 感情検出時のコールバック */
  onEmotionDetected?: (emotion: EmotionData) => void;
  /** アバターサイズ */
  avatarSize?: 'sm' | 'md' | 'lg';
  /** コンパクトモード */
  compact?: boolean;
}

export const MessageBubble = ({ 
  message, 
  isUser,
  enhanced = false,
  relationshipType = 'friend',
  showEmotionFeedback = false,
  onEmotionDetected,
  avatarSize = 'md',
  compact = false
}: MessageBubbleProps) => {
  const isUserMessage = message.sender === 'user' || isUser;
  const emotion = message.emotion || 'calm';
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);

  // Enhanced機能：感情分析
  useEffect(() => {
    if (enhanced && message.content && !isUserMessage) {
      // シンプルな感情分析
      const emotions = {
        happy: ['嬉しい', '楽しい', '良い', 'いいね', '最高', '😊', '😄'],
        sad: ['悲しい', 'つらい', '辛い', '😢', '😭'],
        excited: ['ワクワク', '興奮', 'すごい', '！！', '✨'],
        caring: ['心配', '大丈夫', '支える', '寄り添', '💕'],
        thoughtful: ['考える', '思う', '理解', '分析', '🤔']
      };

      let dominantEmotion = 'calm';
      let intensity = 0.3;

      for (const [emotionType, keywords] of Object.entries(emotions)) {
        const matches = keywords.filter(keyword => message.content.includes(keyword)).length;
        if (matches > 0) {
          dominantEmotion = emotionType;
          intensity = Math.min(0.9, 0.3 + matches * 0.2);
          break;
        }
      }

      const data: EmotionData = {
        dominantEmotion,
        intensity,
        musicTone: intensity > 0.6 ? '温かいハーモニー' : '落ち着いたメロディ',
        recommendation: intensity > 0.6 ? '感情が豊かに表現されています' : '穏やかな気持ちが伝わります'
      };

      setEmotionData(data);
      onEmotionDetected?.(data);
    }
  }, [enhanced, message.content, isUserMessage, onEmotionDetected]);

  const emotionColor = personalityEngine.getEmotionColor(emotion);

  // アバターサイズの設定
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] // 音楽的イージング
      }}
      className="w-full"
    >
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
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-600 text-white text-xs font-semibold">
                  You
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex justify-end mt-1 mr-10">
              <time className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            </div>
          </div>
        </div>
      ) : (
        /* AIメッセージ - 左寄せグレーバブル */
        <div className="flex gap-3 mb-4">
          <Avatar className="w-8 h-8 flex-shrink-0">
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
                {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
              {message.emotion && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {getEmotionLabel(emotion)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// 感情ラベル日本語化
function getEmotionLabel(emotion: string): string {
  const labels = {
    happy: '嬉しい',
    excited: 'ワクワク', 
    calm: '落ち着き',
    thoughtful: '考え深い',
    caring: '思いやり',
    playful: '楽しい',
    focused: '集中',
    supportive: '支える'
  };
  return labels[emotion as keyof typeof labels] || emotion;
}
// 🎵 TypeMate MessageBubble Component Enhanced
// Context Engineering適用版 - 音楽的美しさ・感情分析・関係性進化統合

'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { personalityEngine } from '@/lib/personality-engine';
import { EmotionAnalyzer, type EmotionData } from '@/lib/emotion-analyzer';
import { useEffect, useState } from 'react';
import type { Message } from '@/types';

// 音楽的アニメーションCSS読み込み
import '@/styles/music-animations.css';

interface MessageBubbleProps {
  message: Message;
  isUser?: boolean;
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  showEmotionFeedback?: boolean;
  onEmotionDetected?: (emotion: EmotionData) => void;
}

export const MessageBubble = ({ 
  message, 
  isUser,
  relationshipType = 'friend',
  showEmotionFeedback = true,
  onEmotionDetected
}: MessageBubbleProps) => {
  const isUserMessage = message.sender === 'user' || isUser;
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);
  const [animationClass, setAnimationClass] = useState('message-appear');

  // 🎵 感情分析実行
  useEffect(() => {
    if (message.content && !isUserMessage) {
      // ユーザーメッセージの感情を分析してAI応答に反映
      const emotion = EmotionAnalyzer.analyzeMessage(message.content);
      setEmotionData(emotion);
      onEmotionDetected?.(emotion);
      
      // 音楽的アニメーションクラス決定
      setAnimationClass(`message-appear message-${emotion.dominantEmotion}`);
    } else {
      setAnimationClass('message-appear');
    }
  }, [message.content, isUserMessage, onEmotionDetected]);

  // 🎭 関係性タイプによる表示調整
  const getRelationshipStyle = () => {
    const styles = {
      romantic: {
        bgGradient: 'from-pink-50 to-rose-50',
        borderColor: 'border-pink-200',
        accentColor: 'text-pink-600'
      },
      friend: {
        bgGradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        accentColor: 'text-blue-600'
      },
      counselor: {
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        accentColor: 'text-green-600'
      },
      mentor: {
        bgGradient: 'from-purple-50 to-violet-50',
        borderColor: 'border-purple-200',
        accentColor: 'text-purple-600'
      },
      companion: {
        bgGradient: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-200',
        accentColor: 'text-orange-600'
      }
    };
    
    return styles[relationshipType] || styles.friend;
  };

  const relationshipStyle = getRelationshipStyle();

  // 🎵 音楽的トーン決定
  const getMusicTone = () => {
    if (!emotionData) return 'calm';
    return emotionData.musicTone || 'calm';
  };

  // 🌈 感情に基づくアバター表現
  const getEmotionAvatar = () => {
    if (!emotionData) return 'AI';
    
    const emotionEmojis = {
      happiness: '😊',
      excitement: '✨',
      affection: '💕',
      gratitude: '🙏',
      sadness: '🤗',
      confusion: '🤔',
      curiosity: '👀',
      frustration: '💪'
    };
    
    return emotionEmojis[emotionData.dominantEmotion] || 'AI';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94], // 音楽的なイージング
        delay: isUserMessage ? 0 : 0.1
      }}
      className={cn(
        "flex gap-3 mb-4",
        isUserMessage ? "justify-end" : "justify-start",
        animationClass
      )}
    >
      {/* AI Avatar (left side) */}
      {!isUserMessage && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Avatar className="w-10 h-10 flex-shrink-0">
            <div className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-lg",
              relationshipStyle.bgGradient,
              relationshipStyle.borderColor,
              "border-2"
            )}>
              <span className="text-xl">{getEmotionAvatar()}</span>
            </div>
          </Avatar>
        </motion.div>
      )}
      
      {/* Message Content */}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl relative transition-all duration-300",
          isUserMessage
            ? "bg-gradient-to-r from-slate-600 to-blue-600 text-white shadow-lg"
            : cn(
                "bg-gradient-to-br text-slate-800 shadow-sm border",
                relationshipStyle.bgGradient,
                relationshipStyle.borderColor
              )
        )}
      >
        {/* 🎵 メッセージ内容 */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm leading-relaxed"
        >
          {message.content}
        </motion.p>
        
        {/* 🌟 感情フィードバック表示（AI メッセージのみ） */}
        {!isUserMessage && emotionData && showEmotionFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-white/50 backdrop-blur-sm"
          >
            {/* 感情強度インジケーター */}
            <div className="flex items-center gap-1">
              <div className="text-xs text-slate-600 font-medium">
                {getEmotionLabel(emotionData.dominantEmotion)}
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                      i < emotionData.intensity * 5
                        ? "bg-current opacity-100"
                        : "bg-current opacity-20"
                    )}
                    style={{ 
                      color: `var(--emotion-${emotionData.dominantEmotion})`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* 🎵 音楽的トーン表示 */}
            <div className="text-xs text-slate-500">
              <span className="opacity-50">♪</span> {getMusicTone()}
            </div>
          </motion.div>
        )}
        
        {/* 💫 おすすめレスポンス（高感情強度時） */}
        {!isUserMessage && emotionData && emotionData.intensity > 0.7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="mt-3 p-2 rounded-lg bg-gradient-to-r from-white/30 to-white/60 backdrop-blur-sm"
          >
            <div className="text-xs text-slate-600 font-medium mb-1">
              💡 おすすめレスポンス
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {emotionData.recommendation}
            </div>
          </motion.div>
        )}
        
        {/* ⏰ タイムスタンプ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className={cn(
            "text-xs mt-2",
            isUserMessage ? "text-blue-100" : "text-slate-500"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </motion.div>
      </div>
      
      {/* User Avatar (right side) */}
      {isUserMessage && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Avatar className="w-10 h-10 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-slate-500 flex items-center justify-center text-white font-semibold text-sm">
              You
            </div>
          </Avatar>
        </motion.div>
      )}
    </motion.div>
  );
};

// 🎵 感情ラベル日本語化（拡張版）
function getEmotionLabel(emotion: string): string {
  const labels = {
    happiness: '幸せ',
    sadness: '悲しみ',
    excitement: 'ワクワク',
    confusion: '困惑',
    affection: '愛情',
    frustration: 'イライラ',
    curiosity: '好奇心',
    gratitude: '感謝',
    calm: '落ち着き',
    thoughtful: '思慮深い',
    caring: '思いやり',
    playful: '楽しい',
    focused: '集中',
    supportive: '支援的'
  };
  return labels[emotion as keyof typeof labels] || emotion;
}

// 🎼 音楽的トーンラベル
function getMusicToneLabel(tone: string): string {
  const toneLabels = {
    upbeat: 'アップビート',
    gentle: '優しい',
    energetic: 'エネルギッシュ',
    calm: '穏やか',
    supportive: 'サポート'
  };
  return toneLabels[tone as keyof typeof toneLabels] || tone;
}

// 🎯 使用例コンポーネント
export const MessageBubbleExample = () => {
  const exampleMessage: Message = {
    id: '1',
    content: '今日はとても嬉しいことがあったんです！ありがとうございます♪',
    sender: 'user',
    timestamp: new Date(),
    emotion: 'happiness'
  };

  const handleEmotionDetected = (emotion: EmotionData) => {
    console.log('🎵 感情検出:', emotion);
  };

  return (
    <div className="p-4">
      <MessageBubble
        message={exampleMessage}
        relationshipType="romantic"
        showEmotionFeedback={true}
        onEmotionDetected={handleEmotionDetected}
      />
    </div>
  );
};

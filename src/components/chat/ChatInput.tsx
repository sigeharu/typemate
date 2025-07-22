// 🎵 TypeMate ChatInput Component (Unified)
// シンプル版とEnhanced版を統合した拡張可能なチャット入力

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Enhanced機能用のオプショナルな型定義
export interface EmotionData {
  dominantEmotion: string;
  intensity: number;
  musicTone: string;
  recommendation: string;
}

interface ChatInputProps {
  /** メッセージ送信時のコールバック（Enhanced版では感情データも含む） */
  onSendMessage: (message: string, emotionData?: EmotionData) => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 無効状態 */
  disabled?: boolean;
  /** 追加のCSSクラス */
  className?: string;
  /** Enhanced機能を有効にするか */
  enhanced?: boolean;
  /** 関係性タイプ（Enhanced機能用） */
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  /** 感情プレビューを表示するか */
  showEmotionPreview?: boolean;
  /** 音声入力ボタンを表示するか */
  showVoiceInput?: boolean;
  /** 関係性特別ボタンを表示するか */
  showRelationshipButton?: boolean;
}

export const ChatInput = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力してください...",
  disabled = false,
  className,
  enhanced = false,
  relationshipType = 'friend',
  showEmotionPreview = false,
  showVoiceInput = false,
  showRelationshipButton = false
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [emotionPreview, setEmotionPreview] = useState<EmotionData | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // タイピングインジケーター管理
  useEffect(() => {
    if (enhanced && message.length > 0) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [enhanced, message]);

  // 簡易感情分析（Enhanced機能用）
  useEffect(() => {
    if (enhanced && showEmotionPreview && message.trim()) {
      // シンプルな感情分析ロジック
      const emotions = {
        happy: ['嬉しい', '楽しい', '良い', 'いいね', '最高', '😊', '😄'],
        sad: ['悲しい', 'つらい', '辛い', '😢', '😭'],
        excited: ['ワクワク', '興奮', 'すごい', '！！', '✨'],
        frustrated: ['困った', 'イライラ', 'むかつく', '😤'],
        grateful: ['ありがとう', '感謝', 'おかげ', '助かる'],
      };

      let dominantEmotion = 'neutral';
      let intensity = 0.3;

      for (const [emotion, keywords] of Object.entries(emotions)) {
        const matches = keywords.filter(keyword => message.includes(keyword)).length;
        if (matches > 0) {
          dominantEmotion = emotion;
          intensity = Math.min(0.9, 0.3 + matches * 0.2);
          break;
        }
      }

      setEmotionPreview({
        dominantEmotion,
        intensity,
        musicTone: intensity > 0.6 ? '明るいメロディ' : '穏やかなトーン',
        recommendation: intensity > 0.6 ? '素晴らしい表現ですね！' : '気持ちが伝わってきます'
      });
    } else {
      setEmotionPreview(null);
    }
  }, [enhanced, showEmotionPreview, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), enhanced ? emotionPreview || undefined : undefined);
      setMessage('');
      
      // 送信成功アニメーション
      if (enhanced && textareaRef.current) {
        textareaRef.current.style.animation = 'quick-success 0.3s ease-out';
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.animation = '';
          }
        }, 300);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 関係性タイプによるスタイリング
  const getRelationshipStyle = () => {
    if (!enhanced) return { accent: 'text-blue-600', button: 'from-blue-500 to-blue-600' };
    
    const styles = {
      romantic: { accent: 'text-pink-600', button: 'from-pink-500 to-rose-500' },
      friend: { accent: 'text-blue-600', button: 'from-blue-500 to-cyan-500' },
      counselor: { accent: 'text-green-600', button: 'from-green-500 to-emerald-500' },
      mentor: { accent: 'text-purple-600', button: 'from-purple-500 to-violet-500' },
      companion: { accent: 'text-orange-600', button: 'from-orange-500 to-amber-500' }
    };
    return styles[relationshipType];
  };

  const relationshipStyle = getRelationshipStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: enhanced ? 0.5 : 0.3,
        ease: enhanced ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
      }}
      className={className}
    >
      <Card className={cn(
        "border-gray-200 shadow-sm transition-all duration-200",
        isFocused && "ring-2 ring-blue-500/50 border-blue-300 shadow-lg",
        enhanced && isTyping && "animate-pulse"
      )}>
        <CardContent className={cn(
          "p-4"
        )}>
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[20px] max-h-32 resize-none border-none bg-transparent",
              "focus:ring-0 focus:outline-none placeholder:text-gray-400",
              "text-sm leading-relaxed p-0 transition-all duration-300"
            )}
            rows={1}
          />
          
          {/* Typing Indicator (Enhanced) */}
          {enhanced && isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-1 right-1 flex gap-1"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 bg-gray-400 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Voice Input Button (Optional) */}
        {showVoiceInput && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("transition-colors", relationshipStyle.accent)}
              disabled={disabled}
            >
              <Mic size={18} />
            </Button>
          </motion.div>
        )}

        {/* Relationship Button (Enhanced) */}
        {enhanced && showRelationshipButton && relationshipType === 'romantic' && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-pink-400 hover:text-pink-600 transition-colors"
              disabled={disabled}
            >
              <Heart size={18} />
            </Button>
          </motion.div>
        )}

        {/* Send Button */}
        <motion.div
          whileHover={{ scale: enhanced ? 1.05 : 1.02 }}
          whileTap={{ scale: enhanced ? 0.95 : 0.98 }}
        >
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            variant={enhanced ? "default" : "ghost"}
            size="sm"
            className={cn(
              "transition-all duration-200",
              enhanced 
                ? cn(
                    "bg-gradient-to-r text-white border-0 rounded-xl px-4 py-2",
                    "shadow-md hover:shadow-lg disabled:opacity-50",
                    `bg-gradient-to-r ${relationshipStyle.button}`
                  )
                : cn(
                    "p-2 rounded-md",
                    message.trim() && !disabled
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-gray-400 cursor-not-allowed"
                  )
            )}
          >
            <Send size={enhanced ? 18 : 16} />
          </Button>
        </motion.div>
          </form>
        </CardContent>

      {/* Emotion Preview (Enhanced) */}
      <AnimatePresence>
        {enhanced && emotionPreview && showEmotionPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-4 pt-0"
          >
            <Card className="bg-gray-50/80 border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className={relationshipStyle.accent} />
                    <Badge variant="secondary" className="text-sm">
                      {getEmotionLabel(emotionPreview.dominantEmotion)}
                    </Badge>
                    
                    {/* Intensity Indicator */}
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-200",
                            i < emotionPreview.intensity * 3
                              ? `bg-current opacity-100 ${relationshipStyle.accent}`
                              : "bg-gray-300 opacity-30"
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    ♪ {emotionPreview.musicTone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
    </motion.div>
  );
};

// 感情ラベル日本語化
function getEmotionLabel(emotion: string): string {
  const labels = {
    happy: '嬉しい',
    sad: '悲しい',
    excited: 'ワクワク',
    frustrated: 'イライラ',
    grateful: '感謝',
    neutral: '穏やか'
  };
  return labels[emotion as keyof typeof labels] || emotion;
}
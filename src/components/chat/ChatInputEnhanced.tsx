// 🎵 TypeMate ChatInput Component Enhanced
// Context Engineering適用版 - 音楽的美しさ・感情分析・ENFPサポート統合

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Heart, Sparkles, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { EmotionAnalyzer, type EmotionData } from '@/lib/emotion-analyzer';
import { AstrologyIntegration } from '@/lib/astrology-integration';

interface ChatInputProps {
  onSendMessage: (message: string, emotionData?: EmotionData) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  showEmotionPreview?: boolean;
  enableAstrologyHints?: boolean;
  userAstrologyData?: any;
}

export const ChatInputEnhanced = ({ 
  onSendMessage, 
  placeholder = "心の声を聞かせてください...",
  disabled = false,
  className,
  relationshipType = 'friend',
  showEmotionPreview = true,
  enableAstrologyHints = true,
  userAstrologyData
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [emotionPreview, setEmotionPreview] = useState<EmotionData | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [dailyContext, setDailyContext] = useState<any>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // 🔮 占い統合：日次コンテキスト取得
  useEffect(() => {
    if (enableAstrologyHints && userAstrologyData) {
      const context = AstrologyIntegration.getDailyContext(userAstrologyData);
      setDailyContext(context);
    }
  }, [enableAstrologyHints, userAstrologyData]);

  // 🎵 メッセージ変更時の感情分析
  useEffect(() => {
    if (message.trim() && showEmotionPreview) {
      const emotion = EmotionAnalyzer.analyzeMessage(message);
      setEmotionPreview(emotion);
      
      // 🌟 ENFPサポート：30秒達成感
      if (message.length > 20 && !achievements.includes('first_long_message')) {
        setAchievements(prev => [...prev, 'first_long_message']);
        setTimeout(() => {
          setAchievements(prev => prev.filter(a => a !== 'first_long_message'));
        }, 3000);
      }
    } else {
      setEmotionPreview(null);
    }
  }, [message, showEmotionPreview, achievements]);

  // ⌨️ タイピングインジケーター管理
  useEffect(() => {
    if (message.length > 0) {
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
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), emotionPreview);
      setMessage('');
      
      // 🎉 5分達成感：送信完了
      if (textareaRef.current) {
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 🎨 関係性タイプによるスタイリング
  const getRelationshipStyle = () => {
    const styles = {
      romantic: {
        bgGradient: 'from-pink-50 to-rose-50',
        borderColor: 'border-pink-200',
        focusBorder: 'border-pink-400',
        accent: 'text-pink-600',
        buttonGradient: 'from-pink-500 to-rose-500'
      },
      friend: {
        bgGradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        focusBorder: 'border-blue-400',
        accent: 'text-blue-600',
        buttonGradient: 'from-blue-500 to-cyan-500'
      },
      counselor: {
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        focusBorder: 'border-green-400',
        accent: 'text-green-600',
        buttonGradient: 'from-green-500 to-emerald-500'
      },
      mentor: {
        bgGradient: 'from-purple-50 to-violet-50',
        borderColor: 'border-purple-200',
        focusBorder: 'border-purple-400',
        accent: 'text-purple-600',
        buttonGradient: 'from-purple-500 to-violet-500'
      },
      companion: {
        bgGradient: 'from-orange-50 to-amber-50',
        borderColor: 'border-orange-200',
        focusBorder: 'border-orange-400',
        accent: 'text-orange-600',
        buttonGradient: 'from-orange-500 to-amber-500'
      }
    };
    return styles[relationshipType];
  };

  const relationshipStyle = getRelationshipStyle();

  // 🔮 占い統合：自然なヒント生成
  const getAstrologyHint = () => {
    if (!dailyContext || Math.random() > 0.3) return null; // 30%の確率でヒント表示
    
    const hints = [
      `今日は${dailyContext.mood}な気分に最適です♪`,
      `${dailyContext.luckyColor}の要素を感じてみませんか？`,
      dailyContext.highlight
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  };

  const astrologyHint = getAstrologyHint();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] // 音楽的イージング
      }}
      className={cn(
        "bg-gradient-to-br backdrop-blur-sm border rounded-2xl p-4 shadow-lg transition-all duration-500",
        relationshipStyle.bgGradient,
        isFocused ? cn(relationshipStyle.focusBorder, "shadow-xl") : relationshipStyle.borderColor,
        isTyping && "input-typing",
        className
      )}
    >
      {/* 🌟 ENFPサポート：達成感表示 */}
      <AnimatePresence>
        {achievements.includes('first_long_message') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="mb-3 p-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-200"
          >
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Sparkles size={16} className="text-yellow-500" />
              <span className="font-medium">素晴らしい表現力です！</span>
              <span className="text-xs opacity-70">30秒達成 ✨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 占い統合：さりげないヒント */}
      <AnimatePresence>
        {astrologyHint && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mb-3 p-2 bg-white/50 rounded-lg"
          >
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <span className="text-purple-400">✨</span>
              {astrologyHint}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        {/* 🎵 音楽的メッセージ入力 */}
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
              "min-h-[44px] max-h-32 resize-none border-none bg-transparent",
              "focus:ring-0 focus:outline-none placeholder:text-gray-400",
              "text-sm leading-relaxed transition-all duration-300",
              isFocused && "input-focus"
            )}
            rows={1}
          />
          
          {/* ⌨️ タイピングインジケーター */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-1 right-1 typing-indicator"
            >
              <div className="flex gap-1">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 🎙️ ボイス入力ボタン */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "text-slate-400 hover:text-current transition-colors crisp-button",
              relationshipStyle.accent
            )}
            disabled={disabled}
          >
            <Mic size={20} />
          </Button>
        </motion.div>

        {/* 💕 関係性アイコンボタン */}
        {relationshipType === 'romantic' && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-pink-400 hover:text-pink-600 transition-colors"
              disabled={disabled}
            >
              <Heart size={20} />
            </Button>
          </motion.div>
        )}

        {/* 📤 送信ボタン */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              "bg-gradient-to-r text-white border-0 rounded-xl px-4 py-2",
              "transition-all duration-300 crisp-button",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-md hover:shadow-lg",
              relationshipStyle.buttonGradient
            )}
          >
            <Send size={18} />
          </Button>
        </motion.div>
      </form>

      {/* 🌈 感情プレビュー表示 */}
      <AnimatePresence>
        {emotionPreview && showEmotionPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mt-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Smile size={16} className={relationshipStyle.accent} />
                  <span className="text-sm font-medium text-gray-700">
                    {getEmotionLabel(emotionPreview.dominantEmotion)}
                  </span>
                </div>
                
                {/* 感情強度インジケーター */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-200",
                        i < emotionPreview.intensity * 5
                          ? "bg-current opacity-100"
                          : "bg-current opacity-20"
                      )}
                      style={{ 
                        color: `var(--emotion-${emotionPreview.dominantEmotion})`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                ♪ {emotionPreview.musicTone}
              </div>
            </div>

            {/* おすすめレスポンス */}
            {emotionPreview.intensity > 0.6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-xs text-gray-600 leading-relaxed"
              >
                💡 {emotionPreview.recommendation}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎵 音楽的ヒント表示 */}
      {message.length === 0 && isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-gray-500 flex items-center gap-1"
        >
          <span className={relationshipStyle.accent}>✨</span>
          {getRelationshipMessage()}
        </motion.div>
      )}
    </motion.div>
  );

  // 🎭 関係性別メッセージ
  function getRelationshipMessage(): string {
    const messages = {
      romantic: '愛を込めて、心の声を聞かせてください💕',
      friend: '何でも気軽に話してくださいね♪',
      counselor: 'お悩みや思いを、安心してお聞かせください',
      mentor: '成長への想いを教えてください',
      companion: '今日はどんな一日でしたか？'
    };
    return messages[relationshipType];
  }
};

// 🎵 感情ラベル日本語化
function getEmotionLabel(emotion: string): string {
  const labels = {
    happiness: '幸せ',
    sadness: '悲しみ',
    excitement: 'ワクワク',
    confusion: '困惑',
    affection: '愛情',
    frustration: 'イライラ',
    curiosity: '好奇心',
    gratitude: '感謝'
  };
  return labels[emotion as keyof typeof labels] || emotion;
}

// 🎼 使用例コンポーネント
export const ChatInputExample = () => {
  const handleSendMessage = (message: string, emotionData?: EmotionData) => {
    console.log('🎵 メッセージ送信:', message);
    console.log('🌈 感情データ:', emotionData);
  };

  const exampleAstrologyData = {
    birthDate: new Date(1990, 5, 15),
    zodiacSign: '双子座',
    chineseZodiac: '馬',
    bloodType: 'A' as const
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <ChatInputEnhanced
        onSendMessage={handleSendMessage}
        relationshipType="romantic"
        showEmotionPreview={true}
        enableAstrologyHints={true}
        userAstrologyData={exampleAstrologyData}
      />
    </div>
  );
};

// 元のコンポーネントとの互換性のため、既存の名前でエクスポート
export const ChatInput = ChatInputEnhanced;

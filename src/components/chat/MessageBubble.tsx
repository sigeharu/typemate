// 🎵 TypeMate MessageBubble Component
// MBTI特化AIパートナーチャットサービス用メッセージバブル

'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { personalityEngine } from '@/lib/personality-engine';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isUser?: boolean;
}

export const MessageBubble = ({ message, isUser }: MessageBubbleProps) => {
  const isUserMessage = message.sender === 'user' || isUser;
  const emotion = message.emotion || 'calm';
  const emotionColor = personalityEngine.getEmotionColor(emotion);
  const emotionAnimation = personalityEngine.getEmotionAnimation(emotion);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 w-full",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar (left side) */}
      {!isUserMessage && (
        <Avatar className={cn("w-8 h-8 flex-shrink-0 mt-1", emotionAnimation)}>
          <div className={cn(
            "w-full h-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm",
            emotionColor
          )}>
            AI
          </div>
        </Avatar>
      )}
      
      {/* Message Content */}
      <div
        className={cn(
          "max-w-[75%] min-w-[100px]",
          isUserMessage ? "flex flex-col items-end" : "flex flex-col items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-lg relative",
            isUserMessage
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* Emotion indicator for AI messages */}
          {!isUserMessage && message.emotion && (
            <div className="flex items-center gap-1 mt-2">
              <div className={cn(
                "w-2 h-2 rounded-full bg-gradient-to-r",
                emotionColor
              )} />
              <span className="text-xs text-gray-500 capitalize">
                {getEmotionLabel(emotion)}
              </span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div
          className={cn(
            "text-xs mt-1 px-1",
            isUserMessage ? "text-gray-500 text-right" : "text-gray-500 text-left"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      {/* User Avatar (right side) */}
      {isUserMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            You
          </div>
        </Avatar>
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
// 🎵 TypeMate ChatInput Component
// MBTI特化AIパートナーチャットサービス用チャット入力

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力してください...",
  disabled = false,
  className 
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-white border border-slate-200 rounded-2xl p-4 shadow-lg",
        isFocused && "border-blue-300 shadow-xl",
        className
      )}
    >
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        {/* Message Input */}
        <div className="flex-1">
          <Textarea
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
              "text-sm leading-relaxed"
            )}
            rows={1}
          />
        </div>

        {/* Voice Input Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-blue-500 transition-colors"
          disabled={disabled}
        >
          <Mic size={20} />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700",
            "text-white border-0 rounded-xl px-4 py-2 transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-md hover:shadow-lg"
          )}
        >
          <Send size={18} />
        </Button>
      </form>

      {/* ENFP Achievement Progress Hint */}
      {message.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 text-xs text-gray-500 flex items-center gap-1"
        >
          <span className="text-blue-500">✨</span>
          気軽にメッセージを送ってみてください！
        </motion.div>
      )}
    </motion.div>
  );
};
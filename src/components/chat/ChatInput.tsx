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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
        "bg-white border border-gray-300 rounded-lg shadow-sm",
        isFocused && "ring-2 ring-blue-500 border-blue-500",
        className
      )}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
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
              "min-h-[20px] max-h-32 resize-none border-none bg-transparent",
              "focus:ring-0 focus:outline-none placeholder:text-gray-400",
              "text-sm leading-relaxed p-0"
            )}
            rows={1}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          variant="ghost"
          size="sm"
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            message.trim() && !disabled
              ? "text-blue-600 hover:bg-blue-50"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </Button>
      </form>
    </motion.div>
  );
};
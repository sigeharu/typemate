// 🎵 TypeMate Claude風完全コピー入力欄
// Claudeと全く同じレイアウト・サイズ・余白

'use client';

import { useState, useRef } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputClaudeProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInputClaude = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力してください...",
  disabled = false,
  className
}: ChatInputClaudeProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // テキストエリアの高さをリセット
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Claude風自動高さ調整
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className={cn("w-full max-w-none", className)}>
      <form onSubmit={handleSubmit}>
        {/* Claude風シンプル入力エリア - 音楽的タッチ */}
        <div className="relative bg-white border border-gray-300 rounded-lg sm:rounded-xl shadow-sm hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 sm:focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300 ease-out mx-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0",
              "text-base sm:text-[15px] leading-6 text-gray-900",
              "placeholder:text-gray-500",
              "px-3 sm:px-4 py-3 pr-12 sm:pr-14",
              "min-h-[48px] sm:min-h-[52px] max-h-[150px] sm:max-h-[200px] overflow-y-auto",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            style={{ 
              height: 'auto',
              fontFamily: 'system-ui, -apple-system, sans-serif' 
            }}
          />
          
          {/* Claude風送信ボタン */}
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || disabled}
            className={cn(
              "absolute right-2 sm:right-3 bottom-3",
              "h-7 w-7 sm:h-8 sm:w-8 p-0",
              "bg-blue-500 hover:bg-blue-600",
              "text-white border-0",
              "rounded-lg shadow-sm",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <Send size={16} />
          </Button>
        </div>
        
        {/* ヒント表示 */}
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500 hidden sm:inline">
            Enterで送信、Shift+Enterで改行
          </span>
        </div>
      </form>
    </div>
  );
};

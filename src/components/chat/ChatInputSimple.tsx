// 🎵 TypeMate Claude風シンプル入力欄
// Claudeライクな美しくシンプルなチャット入力

'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputSimpleProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const ChatInputSimple = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力してください...",
  disabled = false,
  className
}: ChatInputSimpleProps) => {
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

  // 自動高さ調整（Claude風）
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // テキストエリアの高さを内容に合わせて調整
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className={cn(
      "relative flex items-end gap-3 p-4",
      !className?.includes("border-0") && "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300",
      className
    )}>
      <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
        {/* メッセージ入力エリア - Claude風 */}
        <div className="flex-1 min-h-[24px]">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0",
              "text-gray-900 placeholder:text-gray-500",
              "focus:ring-0 focus:outline-none",
              "text-[15px] leading-6", // Claude風のフォントサイズ・行間
              "overflow-hidden" // スクロールバー非表示
            )}
            rows={1}
            style={{ height: '24px' }} // 初期高さ
          />
        </div>

        {/* 送信ボタン - Claude風 */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="sm"
          className={cn(
            "p-2 w-8 h-8 rounded-lg transition-all duration-200",
            message.trim() && !disabled
              ? "bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100"
          )}
        >
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
};

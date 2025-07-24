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
    <>
      {/* 📱 スマホ版入力エリア */}
      <div className="mobile-input-container md:hidden">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="mobile-input-field"
          style={{ 
            height: 'auto',
            fontFamily: 'system-ui, -apple-system, sans-serif' 
          }}
        />
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className="mobile-send-button"
        >
          <Send size={16} />
        </Button>
      </div>
      
      {/* 💻 PC版入力エリア */}
      <div className={cn("hidden md:block", className)}>
        <form onSubmit={handleSubmit} className="desktop-input-container">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="desktop-input-field"
            style={{ 
              height: 'auto',
              fontFamily: 'system-ui, -apple-system, sans-serif' 
            }}
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="desktop-send-button"
          >
            <Send size={18} className="mr-2" />
            送信
          </Button>
        </form>
        
        {/* PC版ヒント表示 */}
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500">
            Enterで送信、Shift+Enterで改行
          </span>
        </div>
      </div>
    </>
  );
};

// 🎵 TypeMate Claude風完全コピー入力欄
// Claudeと全く同じレイアウト・サイズ・余白

'use client';

import { useState, useRef } from 'react';
import { Send, History, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// 🎵 Phase 1: 基本気分データ定義
const BASIC_MOODS = [
  { emoji: '😊', name: '楽しい', color: 'text-yellow-500' },
  { emoji: '😢', name: '悲しい', color: 'text-blue-500' },
  { emoji: '😠', name: '怒り', color: 'text-red-500' },
  { emoji: '😌', name: '穏やか', color: 'text-green-500' },
  { emoji: '💭', name: '考え中', color: 'text-purple-500' }
];

interface ChatInputClaudeProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // 🎵 モバイル版追加ボタン用
  onShowHistory?: () => void;
  onShowMemories?: () => void;
  onShowProfile?: () => void;
  // 🎵 Phase 1: 気分連動AI機能
  currentMood?: string;
  onMoodChange?: (mood: string) => void;
}

export const ChatInputClaude = ({ 
  onSendMessage, 
  placeholder = "メッセージを入力してください...",
  disabled = false,
  className,
  onShowHistory,
  onShowMemories,
  onShowProfile,
  currentMood,
  onMoodChange
}: ChatInputClaudeProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 🎵 Phase 1: 気分選択パネル表示state（モバイル・PC別管理）
  const [showMoodSelectorMobile, setShowMoodSelectorMobile] = useState(false);
  const [showMoodSelectorDesktop, setShowMoodSelectorDesktop] = useState(false);
  // 🎵 UX改善: ホバープレビュー表示state
  const [showHoverPreviewMobile, setShowHoverPreviewMobile] = useState(false);
  const [showHoverPreviewDesktop, setShowHoverPreviewDesktop] = useState(false);

  // 🎵 UX改善: 現在の気分名を取得
  const getCurrentMoodName = () => {
    const mood = BASIC_MOODS.find(m => m.emoji === currentMood);
    return mood ? mood.name : '楽しい';
  };

  // 🎵 モバイルデバイス判定
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
           ('ontouchstart' in window);
  };

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
    if (e.key === 'Enter') {
      const isMobile = isMobileDevice();
      
      if (isMobile) {
        // モバイル: Enterで改行（送信は送信ボタンのみ）
        return; // デフォルトの改行動作を許可
      } else {
        // PC: 現在の動作維持（Shift+Enterで改行、Enterで送信）
        if (!e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          handleSubmit(e);
        }
      }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 🎵 Phase 1: 気分ボタン（モバイル版 - 左側に移動） */}
            {onMoodChange && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowMoodSelectorMobile(!showMoodSelectorMobile)}
                  onMouseEnter={() => setShowHoverPreviewMobile(true)}
                  onMouseLeave={() => setShowHoverPreviewMobile(false)}
                  className="h-9 w-9 p-0 hover:bg-orange-100 active:scale-95 transition-all duration-150 hover:scale-105 mood-button-subtle ml-3"
                  title={`現在の気分: ${currentMood || '😊'} - クリックして気分を変更`}
                >
                  <span className="text-lg">{currentMood || '😊'}</span>
                </Button>
                
                {/* 🎵 UX改善: ホバープレビュー（モバイル版） */}
                {showHoverPreviewMobile && !showMoodSelectorMobile && (
                  <div className="absolute bottom-full mb-1 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                    他の気分: {BASIC_MOODS.filter(mood => mood.emoji !== currentMood).map(mood => mood.emoji).join(' ')}
                  </div>
                )}
                
                {/* 🎵 Phase 1: 気分選択パネル（モバイル版） */}
                {showMoodSelectorMobile && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-50">
                    {BASIC_MOODS.map((mood) => (
                      <Button
                        key={mood.emoji}
                        variant="ghost"
                        onClick={() => {
                          onMoodChange(mood.emoji);
                          setShowMoodSelectorMobile(false);
                        }}
                        className="h-8 w-8 p-0 hover:bg-gray-100 hover:scale-110 transition-all duration-150"
                        title={mood.name}
                      >
                        <span className="text-base">{mood.emoji}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onShowHistory && (
              <Button 
                variant="outline"
                onClick={onShowHistory}
                className="h-10 w-10 p-0 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all duration-150 border-slate-200 hover:border-slate-300"
                title="チャット履歴"
              >
                <History size={18} />
              </Button>
            )}
            {onShowMemories && (
              <Button 
                variant="outline"
                onClick={onShowMemories}
                className="h-10 w-10 p-0 bg-pink-50 hover:bg-pink-100 active:scale-95 transition-all duration-150 border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700"
                title="思い出"
              >
                <Heart size={18} />
              </Button>
            )}
            {onShowProfile && (
              <Button 
                variant="outline"
                onClick={onShowProfile}
                className="h-10 w-10 p-0 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all duration-150 border-slate-200 hover:border-slate-300"
                title="設定"
              >
                <Settings size={18} />
              </Button>
            )}
            
            {/* 🎵 送信ボタン（モバイル版 - 右端に移動） */}
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              className="h-9 w-9 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 🎵 PC版気分ボタン（左側に移動） */}
              {onMoodChange && (
                <div className="relative flex flex-col items-center">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setShowMoodSelectorDesktop(!showMoodSelectorDesktop)}
                    onMouseEnter={() => setShowHoverPreviewDesktop(true)}
                    onMouseLeave={() => setShowHoverPreviewDesktop(false)}
                    className="h-10 w-10 p-0 hover:bg-orange-100 active:scale-95 transition-all duration-150 hover:scale-105 mood-button-subtle"
                    title={`現在の気分: ${currentMood || '😊'} - クリックして気分を変更`}
                  >
                    <span className="text-xl">{currentMood || '😊'}</span>
                  </Button>
                  
                  {/* 🎵 UX改善: PC版気分名表示 */}
                  <span className="text-xs text-gray-500 mt-1 hidden md:block">
                    {getCurrentMoodName()}
                  </span>
                  
                  {/* 🎵 UX改善: ホバープレビュー（PC版） */}
                  {showHoverPreviewDesktop && !showMoodSelectorDesktop && (
                    <div className="absolute bottom-full mb-1 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                      他の気分: {BASIC_MOODS.filter(mood => mood.emoji !== currentMood).map(mood => mood.emoji).join(' ')}
                    </div>
                  )}
                  
                  {/* 🎵 PC版気分選択パネル（上向き展開） */}
                  {showMoodSelectorDesktop && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-[9999]">
                      {BASIC_MOODS.map((mood) => (
                        <Button
                          key={mood.emoji}
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            onMoodChange(mood.emoji);
                            setShowMoodSelectorDesktop(false);
                          }}
                          className="h-10 w-10 p-0 hover:bg-gray-100 hover:scale-110 transition-all duration-150"
                          title={mood.name}
                        >
                          <span className="text-lg">{mood.emoji}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* PC版右側エリア - 送信ボタン */}
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
              >
                <Send size={18} className="mr-2" />
                送信
              </Button>
            </div>
          </div>
        </form>
        
        {/* デバイス別ヒント表示 */}
        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-500">
            {isMobileDevice() 
              ? "改行は改行ボタンで、送信は送信ボタンで" 
              : "Enterで送信、Shift+Enterで改行"
            }
          </span>
        </div>
      </div>
    </>
  );
};

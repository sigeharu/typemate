// 🎵 TypeMate Chat Page
// MBTI特化AIパートナーチャットサービス - メインチャット画面

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, History, Settings } from 'lucide-react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { useChat } from '@/hooks/useChat';
import { storage } from '@/lib/storage';
import { personalityEngine } from '@/lib/personality-engine';
import { cn } from '@/lib/utils';
import type { Type64, BaseArchetype } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<Type64 | null>(null);
  const [aiPersonality, setAiPersonality] = useState<BaseArchetype | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load diagnosis result from localStorage
  useEffect(() => {
    const savedType = storage.getUserType();
    if (!savedType) {
      router.push('/diagnosis');
      return;
    }

    setUserType(savedType);
    
    // AIパートナーの性格を決定（ユーザープロファイルから取得または相性の良いタイプから選択）
    const userProfile = storage.getUserProfile();
    if (userProfile?.selectedAiPersonality) {
      setAiPersonality(userProfile.selectedAiPersonality);
    } else {
      const [baseType] = savedType.split('-') as [BaseArchetype, string];
      const userArchetype = ARCHETYPE_DATA[baseType];
      const compatibleType = userArchetype.compatibility[0]; // 最も相性の良いタイプ
      setAiPersonality(compatibleType);
    }
  }, [router]);

  // チャットフックの使用
  const { 
    messages, 
    isTyping, 
    isLoading, 
    currentSessionId,
    currentEmotion,
    sendMessage,
    startNewSession 
  } = useChat({
    userType: userType!,
    aiPersonality: aiPersonality!,
    autoSave: true,
    sessionId: selectedSessionId
  });

  const aiArchetypeData = aiPersonality ? ARCHETYPE_DATA[aiPersonality] : null;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBackToDiagnosis = () => {
    router.push('/diagnosis');
  };

  const handleShowProfile = () => {
    router.push('/profile');
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowHistory(false);
  };

  const handleNewSession = () => {
    setSelectedSessionId(undefined);
    startNewSession();
    setShowHistory(false);
  };

  // Loading state
  if (!userType || !aiPersonality || !aiArchetypeData || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-pulse">
            AI
          </div>
          <p className="text-slate-600">あなた専用のAIパートナーを準備中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-slate-100 p-4 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToDiagnosis}>
              <ArrowLeft size={20} />
            </Button>
            {aiArchetypeData && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-semibold",
                  personalityEngine.getEmotionColor(currentEmotion),
                  personalityEngine.getEmotionAnimation(currentEmotion)
                )}>
                  AI
                </div>
                <div>
                  <h1 className="font-semibold text-gray-800">
                    {aiArchetypeData.name} ({aiArchetypeData.nameEn})
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      {aiArchetypeData.group}
                    </Badge>
                    <span className="text-xs text-gray-500">オンライン</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShowHistory}>
              <History size={20} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShowProfile}>
              <Settings size={20} />
            </Button>
            <Heart className="text-blue-400" size={20} />
            <Sparkles className="text-amber-400" size={20} />
          </div>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <main className="max-w-4xl mx-auto p-2 md:p-4 pb-24 md:pb-32">
        <div className="space-y-1">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3 mb-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                AI
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent p-2 md:p-4 pt-4 md:pt-8">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={sendMessage}
            disabled={isTyping}
            placeholder="メッセージを入力してください... 💕"
          />
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-slate-200/20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        currentSessionId={currentSessionId}
      />
    </div>
  );
}
// 🎵 TypeMate Chat Page
// MBTI特化AIパートナーチャットサービス - メインチャット画面

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, History, Settings } from 'lucide-react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInputClaude } from '@/components/chat/ChatInputClaude';
import { ChatInputSimple } from '@/components/chat/ChatInputSimple';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { RelationshipLevelBar } from '@/components/relationship/RelationshipLevelBar';
import { LevelUpModal } from '@/components/relationship/LevelUpModal';
import { SpecialMoments } from '@/components/relationship/SpecialMoments';
import { PersonalInfoModal } from '@/components/typemate/PersonalInfoModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { useChat } from '@/hooks/useChat';
import { storage } from '@/lib/storage';
import { personalityEngine } from '@/lib/personality-engine';
import { cn } from '@/lib/utils';
import { isDevelopmentMode, isTestModeActive, getCurrentTestProfile, resetTestMode } from '@/lib/dev-mode';
import type { Type64, BaseArchetype, RelationshipLevel } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<Type64 | null>(null);
  const [aiPersonality, setAiPersonality] = useState<BaseArchetype | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState<RelationshipLevel | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [testProfile, setTestProfile] = useState<ReturnType<typeof getCurrentTestProfile>>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load diagnosis result from localStorage
  useEffect(() => {
    const savedType = storage.getUserType();
    if (!savedType) {
      router.push('/diagnosis');
      return;
    }

    setUserType(savedType);
    
    // 開発者モードの場合、テストプロファイルをチェック
    if (isDevelopmentMode() && isTestModeActive()) {
      const currentTestProfile = getCurrentTestProfile();
      setTestProfile(currentTestProfile);
      
      if (currentTestProfile) {
        setAiPersonality(currentTestProfile.aiPersonality);
        console.log(`🎯 テストモード: ${currentTestProfile.name}`);
      }
    } else {
      // 通常モード: AIパートナーの性格を決定
      const userProfile = storage.getUserProfile();
      if (userProfile?.selectedAiPersonality) {
        setAiPersonality(userProfile.selectedAiPersonality);
      } else {
        const [baseType] = savedType.split('-') as [BaseArchetype, string];
        const userArchetype = ARCHETYPE_DATA[baseType];
        const compatibleType = userArchetype.compatibility[0]; // 最も相性の良いタイプ
        setAiPersonality(compatibleType);
      }
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
    startNewSession,
    relationship,
    memory,
    // Option B関連
    showPersonalInfoModal,
    setShowPersonalInfoModal,
    handlePersonalInfoSubmit,
    chatCount,
    personalInfo
  } = useChat({
    userType: userType!,
    aiPersonality: aiPersonality!,
    autoSave: true,
    sessionId: selectedSessionId
  });

  const aiArchetypeData = aiPersonality ? ARCHETYPE_DATA[aiPersonality] : null;

  // Auto-scroll to bottom when new messages arrive - ChatGPTスタイル
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  };

  useEffect(() => {
    // 新しいメッセージが追加された時のみスクロール
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
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

  const handleResetTestMode = () => {
    resetTestMode();
    router.push('/diagnosis');
  };

  // メッセージ送信時のレベルアップ検知
  const handleSendMessage = async (content: string) => {
    // 送信前の関係性レベルを記録
    const currentLevel = relationship?.currentLevel.level || 1;
    
    // メッセージ送信
    await sendMessage(content);
    
    // レベルアップをチェック（少し遅延を入れて確実に検知）
    setTimeout(() => {
      if (relationship && relationship.currentLevel.level > currentLevel) {
        setNewLevel(relationship.currentLevel);
        setShowLevelUpModal(true);
      }
    }, 1000);
  };

  // Loading state
  if (!userType || !aiPersonality || !aiArchetypeData || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-25 to-white flex items-center justify-center">
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
    <>
      <div className="h-screen bg-white flex justify-center">
        {/* プロ品質3分割レイアウト - 固定ヘッダー・スクロール・固定入力欄 */}
        <div className="w-full max-w-4xl flex flex-col h-screen">
      
        {/* 開発者モード - テスト表示 */}
        {testProfile && isDevelopmentMode() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-600 text-white px-4 py-2 text-center z-20 flex-shrink-0"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="font-semibold">🔧 開発テストモード</span>
                <span>{testProfile.name}</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                  {testProfile.userType} ⟷ {testProfile.aiPersonality}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTestMode}
                className="text-amber-100 hover:text-white hover:bg-amber-700 text-xs h-6 px-2"
              >
                通常モードに戻る
              </Button>
            </div>
          </motion.div>
        )}

        {/* 固定ヘッダー - sticky top-0 */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToDiagnosis} className="p-2">
                <ArrowLeft size={16} />
              </Button>
              {aiArchetypeData && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-semibold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-semibold text-stone-800 text-lg">
                      {aiArchetypeData.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-stone-500">
                        {aiArchetypeData.nameEn}
                      </span>
                      {personalInfo.name && (
                        <span className="text-emerald-600 font-medium">
                          • {personalInfo.name}さんとの{chatCount}回目の会話
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" onClick={handleShowHistory} className="touch-button">
                <History size={16} />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowMemories(!showMemories)}
                className="touch-button"
              >
                <Heart size={16} />
              </Button>
              <Button variant="ghost" onClick={handleShowProfile} className="touch-button">
                <Settings size={16} />
              </Button>
            </div>
          </div>
          
          {/* Relationship Level Bar - ヘッダー内に統合 */}
          {relationship && relationship.currentLevel.level > 1 && (
            <div className="px-6 py-2 border-t border-gray-100">
              <Card className="bg-stone-100/50 border-stone-200">
                <CardContent className="p-2">
                  <div className="text-sm text-stone-600 text-center">
                    関係性レベル {relationship.currentLevel.level}/6: {relationship.currentLevel.name}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 思い出表示エリア - ヘッダー内に統合 */}
          {showMemories && memory && (
            <div className="px-6 py-3 border-t border-gray-100">
              <SpecialMoments 
                memories={memory.memoryCollection.highlightMemories}
                compact={true}
              />
            </div>
          )}
        </header>

        {/* スクロール可能メッセージ領域 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator - shadcn/ui Card使用 */}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 mb-4">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-2xl">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-xs text-gray-500">入力中...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 固定入力欄 - sticky bottom-0 */}
        <footer className="sticky bottom-0 z-50 border-t border-gray-200 bg-white shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/95">
          <div className="w-full px-4 sm:px-6 py-4">
            <ChatInputClaude
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              placeholder="メッセージを入力してください..."
            />
          </div>
        </footer>
        
        </div>
      </div>

      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        currentSessionId={currentSessionId}
      />

      {/* Level Up Modal */}
      {newLevel && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          onClose={() => setShowLevelUpModal(false)}
          newLevel={newLevel}
        />
      )}

      {/* Option B: Personal Info Modal */}
      <PersonalInfoModal
        isOpen={showPersonalInfoModal}
        onClose={() => setShowPersonalInfoModal(false)}
        onSubmit={handlePersonalInfoSubmit}
        aiPersonality={aiPersonality!}
        reason="親しくなった記念"
      />
    </>
  );
}
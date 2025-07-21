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
import { RelationshipLevelBar } from '@/components/relationship/RelationshipLevelBar';
import { LevelUpModal } from '@/components/relationship/LevelUpModal';
import { SpecialMoments } from '@/components/relationship/SpecialMoments';
import { PersonalInfoModal } from '@/components/typemate/PersonalInfoModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="flex flex-col h-screen bg-white">
      {/* 開発者モード - テスト表示 */}
      {testProfile && isDevelopmentMode() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-600 text-white px-4 py-2 text-center z-20 flex-shrink-0"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between text-sm">
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

      {/* Header - ChatGPTスタイル */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 px-6 py-4 z-10 flex-shrink-0"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToDiagnosis}>
              <ArrowLeft size={18} />
            </Button>
            {aiArchetypeData && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-sm font-semibold",
                  personalityEngine.getEmotionColor(currentEmotion),
                  personalityEngine.getEmotionAnimation(currentEmotion)
                )}>
                  AI
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 text-lg">
                    {aiArchetypeData.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {aiArchetypeData.nameEn}
                    </span>
                    {personalInfo.name && (
                      <span className="text-sm text-blue-600 flex items-center gap-1">
                        • <span className="text-xs">🎵</span> {personalInfo.name}さんとの{chatCount}回目の会話
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleShowHistory} title="履歴">
              <History size={18} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMemories(!showMemories)}
              title="思い出"
            >
              <Heart size={18} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShowProfile} title="設定">
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Relationship Level Bar - 簡潔に */}
      {relationship && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto px-6 py-2 flex-shrink-0"
        >
          <RelationshipLevelBar
            currentLevel={relationship.currentLevel}
            relationshipData={relationship.relationshipData}
            compact={true}
          />
        </motion.div>
      )}

      {/* 思い出表示エリア - コンパクト */}
      {showMemories && memory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-5xl mx-auto px-6 py-2 flex-shrink-0"
        >
          <SpecialMoments 
            memories={memory.memoryCollection.highlightMemories}
            compact={true}
          />
        </motion.div>
      )}

      {/* Chat Messages - ChatGPTスタイルスクロール */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-4 px-6 py-6">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator - ChatGPTスタイル */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-3 items-start"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  AI
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg max-w-xs">
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Chat Input - ChatGPTスタイル固定下部 */}
      <div className="border-t border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder="メッセージを入力してください..."
          />
        </div>
      </div>

      {/* 音楽的な背景装飾 - TypeMateオリジナルスタイル */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-slate-100/30 to-blue-100/30"
            style={{
              width: Math.random() * 60 + 40,
              height: Math.random() * 60 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* 音符のような要素 - TypeMateカラー */}
        <motion.div
          className="absolute top-20 right-20 text-slate-200/40 text-6xl select-none"
          animate={{
            rotate: [0, 10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🎵
        </motion.div>
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
    </div>
  );
}
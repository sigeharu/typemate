// 🎵 TypeMate Chat Page (Single Layout)
// 単一チャットレイアウト - 左右分割問題の解決版

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, History, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInputClaude } from '@/components/chat/ChatInputClaude';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { LevelUpModal } from '@/components/relationship/LevelUpModal';
import { PersonalInfoModal } from '@/components/typemate/PersonalInfoModal';
// import { SpecialMoments } from '@/components/relationship/SpecialMoments';
// import { personalityEngine } from '@/lib/personality-engine';
import { loadRelationshipData } from '@/lib/relationship-storage';
// import { memoryStorage } from '@/lib/memory-system';
import { isDevelopmentMode, getCurrentTestProfile, resetTestMode, emergencyCleanup } from '@/lib/dev-mode';
import { useMemorySaver } from '@/hooks/useMemoryManager';
import type { Message, BaseArchetype, PersonalInfo, MemorySystem, RelationshipData, TestProfile } from '@/types';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // User & AI state
  const [userType, setUserType] = useState<string>('');
  const [aiPersonality, setAiPersonality] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ name: '' });
  
  // Relationship & Memory
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [memory, setMemory] = useState<MemorySystem | null>(null);
  const [newLevel, setNewLevel] = useState<any>(null);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  
  // Chat session
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [chatCount, setChatCount] = useState(1);
  
  // Development mode
  const [testProfile, setTestProfile] = useState<TestProfile | null>(null);
  
  // 🎵 Phase 1: 記憶システム統合（既存機能保護）
  const { saveMessage } = useMemorySaver(
    currentSessionId, 
    aiPersonality?.archetype || 'DRM',
    undefined // Phase 1では匿名ユーザー対応
  );

  // Initialize
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get user type and AI personality
        const savedType = localStorage.getItem('userType64');
        if (!savedType) {
          router.push('/diagnosis');
          return;
        }

        const [baseType] = savedType.split('-') as [BaseArchetype, string];
        // Simple AI personality setup
        const compatiblePersonalities = ['DRM', 'SAG', 'BAR', 'HER']; // Compatible archetypes
        const selectedArchetype = compatiblePersonalities[0] as BaseArchetype; // Default to first
        const aiArchetypeData = ARCHETYPE_DATA[selectedArchetype];
        
        setUserType(savedType);
        setAiPersonality({
          archetype: selectedArchetype,
          name: aiArchetypeData.name,
          personality: aiArchetypeData.description
        });

        // Load relationship and memory data
        const relationshipData = loadRelationshipData();
        const memoryData = null; // Temporary disable
        const personalData = JSON.parse(localStorage.getItem('personalInfo') || '{"name":""}');
        
        setRelationship(relationshipData);
        setMemory(null);
        setPersonalInfo(personalData);
        setChatCount(relationshipData?.totalPoints ? Math.floor(relationshipData.totalPoints / 10) + 1 : 1);

        // Check for development mode
        if (isDevelopmentMode()) {
          const currentTestProfile = getCurrentTestProfile();
          if (currentTestProfile) {
            setTestProfile(currentTestProfile);
          }
        } else {
          // 本番環境の場合、テストモードのlocalStorageをクリア
          emergencyCleanup();
        }

        // Create session ID
        const sessionId = `session-${Date.now()}`;
        setCurrentSessionId(sessionId);

        setIsLoading(false);
      } catch (error) {
        console.error('Chat initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [router]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Handlers

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
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setShowHistory(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!aiPersonality || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      sender: 'user',
      timestamp: new Date(),
      sessionId: currentSessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Generate AI response using Claude API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          userType: userType,
          aiPersonality: aiPersonality?.archetype,
          relationshipType: 'friend',
          messageHistory: [],
          conversationTurn: messages.length,
          relationshipLevel: relationship?.currentLevel?.level || 1,
          importantMemories: [],
          relatedMemories: [],
          todaysEvents: [],
          chatCount: messages.length + 1,
          personalInfo: {
            name: personalInfo.name || undefined,
            birthday: undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.content || 'すみません、少し考えがまとまりません。もう一度お話しいただけますか？';
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        isUser: false,
        sender: 'ai',
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // 🎵 Phase 1: 記憶システム統合 - メッセージ保存（非同期）
      saveMessage(content, 'user', personalInfo.name).catch(error => 
        console.warn('User message save failed:', error)
      );
      saveMessage(aiResponse, 'ai').catch(error => 
        console.warn('AI message save failed:', error)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: `ai-${Date.now()}`,
        content: 'すみません、少し調子が悪いようです。もう一度お話しいただけますか？',
        isUser: false,
        sender: 'ai',
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    }
  };


  const handlePersonalInfoSubmit = (info: PersonalInfo) => {
    setPersonalInfo(info);
    localStorage.setItem('personalInfo', JSON.stringify(info));
    setShowPersonalInfoModal(false);
  };

  const handleResetTestMode = () => {
    resetTestMode();
    setTestProfile(null);
    window.location.reload();
  };

  // Loading state
  if (!userType || !aiPersonality || isLoading) {
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
      <div className="h-screen bg-white flex justify-center max-w-4xl mx-auto">
        {/* 単一チャットレイアウト */}
        <div className="w-full flex flex-col">
          {/* 開発者モードバー */}
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
          
          {/* ヘッダー */}
          <header className="border-b border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {aiPersonality?.name?.charAt(0) || 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900">
                    {aiPersonality?.name || 'TypeMate AI'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {aiPersonality?.personality || 'あなたの相談相手'}
                  </p>
                </div>
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
            
            {/* 関係性レベル表示 */}
            {relationship && relationship.currentLevel.level > 1 && (
              <div className="mt-3">
                <div className="bg-stone-100/50 border border-stone-200 rounded-lg p-2">
                  <div className="text-sm text-stone-600 text-center">
                    関係性レベル {relationship.currentLevel.level}/6: {relationship.currentLevel.name}
                  </div>
                </div>
              </div>
            )}
            
            {/* 思い出表示 */}
            {showMemories && memory && (
              <div className="mt-3">
                <div className="text-sm text-gray-500">思い出機能は準備中です</div>
              </div>
            )}
          </header>
          
          {/* メッセージエリア */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
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
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <Card className="flex-1 bg-stone-50 border border-stone-200">
                    <CardContent className="p-4">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </main>
          
          {/* 入力エリア */}
          <footer className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
            <ChatInputClaude
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              placeholder="メッセージを入力してください..."
            />
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

      {/* Personal Info Modal */}
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
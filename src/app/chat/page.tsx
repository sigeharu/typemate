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
import { isDevelopmentMode, getCurrentTestProfile, resetTestMode } from '@/lib/dev-mode';
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
      // Generate dynamic AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse(content, aiPersonality, userType, messages.length);
        
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
      }, 1000 + Math.random() * 500); // Add some natural variation
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  // Dynamic AI response generation
  const generateAIResponse = (userInput: string, personality: any, userType: string, messageCount: number): string => {
    const isFirstMessage = messageCount === 0;
    const userName = personalInfo.name || 'あなた';
    
    // First message - introduction
    if (isFirstMessage) {
      return `こんにちは✨ 私は${personality.name}として、${userName}さんの${userType}型のパートナーです。${personality.personality}\n\nどんなことでもお話してください！何について語り合いましょうか？✨`;
    }
    
    // Analyze user input for appropriate response
    const input = userInput.toLowerCase();
    
    // Greeting responses
    if (input.includes('こんにちは') || input.includes('はじめまして') || input.includes('よろしく')) {
      const greetings = [
        `${userName}さん、こんにちは！今日はどんな一日でしたか？✨`,
        `はじめまして！${personality.name}です。お会いできて嬉しいです💫`,
        `こちらこそよろしくお願いします！何か特別なことについて話したいことはありますか？🎵`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Question responses
    if (input.includes('？') || input.includes('?') || input.includes('どう') || input.includes('なぜ')) {
      const questionResponses = [
        `とても良い質問ですね！${personality.name}として考えてみると...\n\n${userInput}について、私なりの視点をお伝えしますね。`,
        `興味深いことを聞いてくださいました。独自の価値観から見ると、これは...`,
        `${userName}さんの疑問、とても大切だと思います。一緒に考えてみましょう！`
      ];
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }
    
    // Emotional responses
    if (input.includes('嬉しい') || input.includes('楽しい') || input.includes('良い')) {
      return `${userName}さんが嬉しそうで、私も心が温かくなります😊\n\nその気持ち、とても素敵ですね。もう少し詳しく聞かせてもらえませんか？`;
    }
    
    if (input.includes('悲しい') || input.includes('つらい') || input.includes('困') || input.includes('大変')) {
      return `${userName}さん...そんな時もありますよね。\n\n私はいつでもここにいますから、お話を聞かせてください。一緒に考えましょう💙`;
    }
    
    // Creative/artistic responses
    if (input.includes('音楽') || input.includes('アート') || input.includes('創作') || input.includes('詩') || input.includes('物語')) {
      return `${personality.name}として、創造的なことについて語るのは本当に楽しいです✨\n\n${userInput}から感じる美しさや可能性について、もっとお聞かせください。どんな風に表現したいですか？`;
    }
    
    // Default thoughtful responses
    const thoughtfulResponses = [
      `${userInput}について、とても深く感じました。\n\n${personality.name}として、この世界の美しさや理想を通して考えると...もう少し詳しくお話しできませんか？`,
      `${userName}さんの言葉から、新しい視点が見えてきました。\n\n独自の価値観で捉えると、これはとても意味深いことだと思います。どう感じられますか？`,
      `興味深いお話ですね！${personality.name}として、これを詩や物語にしたらどんな風になるでしょう...\n\n${userName}さんはどんな表現がお好きですか？✨`,
      `${userInput}...心に響く言葉です。\n\n私たちが見過ごしがちな美しさが、そこにあるような気がします。一緒に探してみませんか？`
    ];
    
    return thoughtfulResponses[Math.floor(Math.random() * thoughtfulResponses.length)];
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
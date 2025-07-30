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
import { supabase } from '@/lib/supabase-simple';
import { diagnosisService } from '@/lib/diagnosis-service';
import { memoryManager } from '@/lib/memory-manager';
import { storage, type ChatSession } from '@/lib/storage';
import type { Message, BaseArchetype, PersonalInfo, MemorySystem, RelationshipData, TestProfile } from '@/types';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { EmotionAnalyzer, type EmotionData } from '@/lib/emotion-analyzer';

// 🎵 UUID生成関数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Authentication state
  const [userId, setUserId] = useState<string>('');
  
  // User & AI state
  const [userType, setUserType] = useState<string>('');
  const [aiPersonality, setAiPersonality] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ name: '' });
  
  // Relationship & Memory
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [memory, setMemory] = useState<MemorySystem | null>({
    recentMemories: [],
    importantMoments: [],
    sharedExperiences: [],
    personalInfo: { name: '' }
  });
  const [newLevel, setNewLevel] = useState<any>(null);
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  
  // 🎵 Phase 2: 気分状態管理
  const [currentMood, setCurrentMood] = useState<string>('😊');
  
  // 🎵 Phase 2: 気分コンテキスト生成
  const getMoodContext = (mood: string): string => {
    const moodContexts: Record<string, string> = {
      '😊': 'ユーザーは楽しい気分です。一緒に盛り上がって、その楽しさを共有してください。',
      '😢': 'ユーザーは悲しい気分です。優しく寄り添い、温かい言葉で励ましてください。',
      '😠': 'ユーザーは怒っている気分です。まず話をじっくり聞き、気持ちを理解することに専念してください。',
      '😌': 'ユーザーは穏やかな気分です。その平穏を大切にして、落ち着いた会話を心がけてください。',
      '💭': 'ユーザーは考え事をしている気分です。思考整理を手伝い、一緒に考えてください。'
    };
    return moodContexts[mood] || moodContexts['😊'];
  };
  
  // 🎵 Phase 2: 気分変更ハンドラー
  const handleMoodChange = (mood: string) => {
    setCurrentMood(mood);
    
    const moodNames: Record<string, string> = {
      '😊': '楽しい', '😢': '悲しい', '😠': '怒り', 
      '😌': '穏やか', '💭': '考え中'
    };
    
    console.log(`🎵 気分変更: ${moodNames[mood]} ${mood}`);
  };
  
  // Chat session
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [chatCount, setChatCount] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  
  // Development mode
  const [testProfile, setTestProfile] = useState<TestProfile | null>(null);
  
  // 🎵 Phase 1: 記憶システム統合（認証ユーザー必須）
  const { saveMessage } = useMemorySaver(
    currentSessionId, 
    aiPersonality?.archetype || 'DRM',
    userId // 認証ユーザー必須
  );

  // Initialize
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 🔐 認証チェック（必須）
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ 未認証ユーザー - ログインページへリダイレクト');
          router.push('/auth/signin?redirect=/chat');
          return;
        }
        
        console.log('✅ 認証済みユーザー:', user.id);
        setUserId(user.id);

        // 🔬 診断状況を確認してルーティング決定（リトライ機能付き）
        console.log('🔍 チャットページ: 診断状況確認開始');
        let diagnosisStatus = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          diagnosisStatus = await diagnosisService.getDiagnosisStatus(user.id);
          console.log(`🔍 チャットページ診断状況結果 (試行${retryCount + 1}/${maxRetries}):`, diagnosisStatus);
          
          if (diagnosisStatus.hasDiagnosis) {
            break;
          }
          
          if (retryCount < maxRetries - 1) {
            console.log(`⏱️ 診断結果未取得 - ${1000}ms後にリトライ`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          retryCount++;
        }
        
        if (!diagnosisStatus?.hasDiagnosis) {
          console.log('❌ 未診断ユーザー（リトライ後） - 診断ページへリダイレクト');
          router.push('/diagnosis');
          return;
        }

        console.log('✅ 診断済みユーザー:', diagnosisStatus.userType);

        // Get user type from database or localStorage fallback
        let savedType = diagnosisStatus.userType || localStorage.getItem('userType64');
        if (!savedType) {
          console.log('❌ 診断結果が見つからない - 診断ページへリダイレクト');
          router.push('/diagnosis');
          return;
        }

        const [baseType] = savedType.split('-') as [BaseArchetype, string];
        // 診断結果に基づくAI人格選択
        const selectedArchetype = diagnosisStatus.aiPersonality || 'DRM'; // 診断結果からAI人格を取得、フォールバックはDRM
        const aiArchetypeData = ARCHETYPE_DATA[selectedArchetype];
        
        console.log('🎯 選択されたAI人格:', { 
          userType: savedType, 
          baseType, 
          selectedArchetype,
          fromDiagnosis: !!diagnosisStatus.aiPersonality 
        });
        
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


        // 🔄 チャット永続化: 既存セッション取得または新規作成
        console.log('🔍 既存会話セッション確認開始');
        const latestConversation = await memoryManager.getLatestConversation(user.id);
        
        let sessionId: string;
        if (latestConversation?.conversation_id) {
          sessionId = latestConversation.conversation_id;
          console.log('✅ 既存セッション復元:', sessionId);
          
          // 既存メッセージを読み込み
          const existingMessages = await memoryManager.getConversationMessages(sessionId, user.id);
          console.log('📋 既存メッセージ読み込み:', existingMessages.length + '件');
          setMessages(existingMessages);
        } else {
          sessionId = generateUUID();
          console.log('🆕 新規セッション作成:', sessionId);
        }
        
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
    router.push('/settings');
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowHistory(false);
  };

  const handleNewSession = () => {
    // 🎵 Create new session ID (UUID format for database)
    const newSessionId = generateUUID();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setSessionStartTime(new Date());
    setShowHistory(false);
  };

  // チャットセッション保存関数
  const saveCurrentSession = (updatedMessages: Message[]) => {
    if (!userType || !aiPersonality || updatedMessages.length === 0) return;
    
    try {
      // セッションタイトルを生成（最初のユーザーメッセージから）
      const userMessages = updatedMessages.filter(m => m.sender === 'user');
      const title = userMessages.length > 0 
        ? userMessages[0].content.slice(0, 30) + (userMessages[0].content.length > 30 ? '...' : '')
        : '新しい会話';

      const session: ChatSession = {
        id: currentSessionId,
        userType: userType as any,
        aiPersonality: aiPersonality.archetype,
        messages: updatedMessages,
        createdAt: sessionStartTime,
        updatedAt: new Date(),
        title
      };
      
      storage.saveChatSession(session);
      console.log('✅ チャットセッション保存成功:', session.id);
    } catch (error) {
      console.error('❌ チャットセッション保存エラー:', error);
    }
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

    const updatedMessagesWithUser = [...messages, userMessage];
    setMessages(updatedMessagesWithUser);
    setIsTyping(true);

    // ユーザーメッセージ送信後にセッション保存
    saveCurrentSession(updatedMessagesWithUser);

    try {
      // 🎵 Phase 2: 感情分析実行
      const emotionData = EmotionAnalyzer.analyzeMessage(content);
      console.log('🎵 Emotion Analysis:', emotionData);


      // Generate AI response using Claude API with emotion data
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
          relationshipLevel: typeof relationship?.currentLevel === 'object' ? relationship.currentLevel.level : relationship?.currentLevel || 1,
          importantMemories: [],
          relatedMemories: [],
          todaysEvents: [],
          chatCount: messages.length + 1,
          personalInfo: {
            name: personalInfo.name || undefined,
            birthday: undefined
          },
          // 🎵 Phase 2: 感情データ追加
          emotionData: emotionData,
          dominantEmotion: emotionData.dominantEmotion,
          emotionIntensity: emotionData.intensity,
          musicTone: emotionData.musicTone,
          // 🎵 Phase 2: 気分データ追加
          currentMood: currentMood,
          moodContext: getMoodContext(currentMood)
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.content || 'すみません、少し考えがまとまりません。もう一度お話しいただけますか？';
      
      // 🎵 Phase 2: 感情分析結果取得
      const emotionAnalysis = data.emotionAnalysis;
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        isUser: false,
        sender: 'ai',
        timestamp: new Date(Date.now() + 1), // +1ms to ensure proper ordering after user message
        sessionId: currentSessionId
      };
      
      const updatedMessagesWithAI = [...updatedMessagesWithUser, aiMessage];
      setMessages(updatedMessagesWithAI);
      setIsTyping(false);

      // AI応答後にセッション保存
      saveCurrentSession(updatedMessagesWithAI);
      
      // 🎵 Phase 2: 感情データ付き記憶保存（非同期）
      // 特別記憶の検出（感情強度0.7以上）
      if (emotionData.intensity >= 0.7) {
        console.log('🌟 Special moment detected!', {
          emotion: emotionData.dominantEmotion,
          intensity: emotionData.intensity,
          musicTone: emotionData.musicTone
        });
      }

      // Phase 2統合: 感情データ付きでメッセージ保存
      console.log('💾 Saving user message with emotion data:', {
        content: content.substring(0, 50) + '...',
        emotion: emotionData.dominantEmotion,
        intensity: emotionData.intensity,
        userId,
        conversationId: currentSessionId,
        isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentSessionId)
      });
      
      saveMessage(content, 'user', personalInfo.name, emotionData).then(success => {
        console.log(success ? '✅ User message saved successfully' : '❌ User message save failed');
      }).catch(error => 
        console.warn('❌ User message save failed:', error)
      );
      
      console.log('💾 Saving AI response with emotion data:', {
        response: aiResponse.substring(0, 50) + '...',
        emotion: emotionData.dominantEmotion,
        userId
      });
      
      saveMessage(aiResponse, 'ai', undefined, emotionData).then(success => {
        console.log(success ? '✅ AI message saved successfully' : '❌ AI message save failed');
      }).catch(error => 
        console.warn('❌ AI message save failed:', error)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: `ai-${Date.now()}`,
        content: 'すみません、少し調子が悪いようです。もう一度お話しいただけますか？',
        isUser: false,
        sender: 'ai',
        timestamp: new Date(Date.now() + 1), // +1ms to ensure proper ordering after user message
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
          <header className="border-b border-gray-200 bg-white p-3 sm:p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {aiPersonality?.name?.charAt(0) || 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900">
                    {aiPersonality?.name || 'TypeMate AI'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {aiPersonality?.personality || 'あなたの相談相手'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleShowHistory} 
                  className="h-10 w-10 p-0 hover:bg-slate-100 active:scale-95 transition-all duration-150"
                  title="チャット履歴"
                >
                  <History size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowMemories(!showMemories)}
                  className="h-10 w-10 p-0 hover:bg-pink-100 active:scale-95 transition-all duration-150 text-pink-600 hover:text-pink-700"
                  title="思い出"
                >
                  <Heart size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleShowProfile} 
                  className="h-10 w-10 p-0 hover:bg-slate-100 active:scale-95 transition-all duration-150"
                  title="設定"
                >
                  <Settings size={18} />
                </Button>
              </div>
            </div>

            
            {/* 関係性レベル表示 */}
            {relationship && typeof relationship.currentLevel === 'object' && relationship.currentLevel.level > 1 && (
              <div className="mt-3">
                <div className="bg-stone-100/50 border border-stone-200 rounded-lg p-2">
                  <div className="text-sm text-stone-600 text-center">
                    関係性レベル {relationship.currentLevel.level}/6: {relationship.currentLevel.name}
                  </div>
                </div>
              </div>
            )}
            
            {/* 思い出表示 */}
            {showMemories && (
              <div className="mt-3 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                  💕 共有した思い出
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-pink-700 font-medium mb-1">今日の会話</div>
                      <div className="text-pink-600">{messages.length}メッセージ交換</div>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-pink-700 font-medium mb-1">関係性レベル</div>
                      <div className="text-pink-600">レベル {relationship?.currentLevel?.level || 1}</div>
                    </div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-pink-700 font-medium mb-2">最近の話題</div>
                    <div className="text-pink-600 space-y-1">
                      {messages.filter(m => m.sender === 'user').slice(-3).map((msg, index) => (
                        <div key={msg.id} className="text-xs truncate">
                          • {msg.content.slice(0, 40)}{msg.content.length > 40 ? '...' : ''}
                        </div>
                      ))}
                      {messages.filter(m => m.sender === 'user').length === 0 && (
                        <div className="text-xs text-pink-500">まだお話していませんね♪</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center text-pink-600 text-xs italic">
                    🌸 一緒に過ごした時間を大切にしています
                  </div>
                </div>
              </div>
            )}
          </header>
          
          {/* メッセージエリア */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4">
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
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
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
          <footer className="flex-shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
            <ChatInputClaude
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              placeholder="メッセージを入力してください..."
              onShowHistory={handleShowHistory}
              onShowMemories={() => setShowMemories(!showMemories)}
              onShowProfile={handleShowProfile}
              // 🎵 Phase 2: 気分機能統合
              currentMood={currentMood}
              onMoodChange={handleMoodChange}
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
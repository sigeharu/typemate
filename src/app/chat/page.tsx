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
import { PrivacyIndicator, SecureConnectionStatus } from '@/components/privacy/PrivacyIndicator';
// import { SpecialMoments } from '@/components/relationship/SpecialMoments';
// import { personalityEngine } from '@/lib/personality-engine';
import { loadRelationshipData } from '@/lib/relationship-storage';
// import { memoryStorage } from '@/lib/memory-system';
import { isDevelopmentMode, getCurrentTestProfile, resetTestMode, emergencyCleanup } from '@/lib/dev-mode';
import { useMemorySaver } from '@/hooks/useMemoryManager';
import { useUnifiedChat } from '@/hooks/useUnifiedChat';
import { supabase } from '@/lib/supabase-simple';
import { diagnosisService } from '@/lib/diagnosis-service';
import { memoryManager } from '@/lib/memory-manager';
import { storage, type ChatSession } from '@/lib/storage';
import type { Message, BaseArchetype, PersonalInfo, MemorySystem, RelationshipData, TestProfile } from '@/types';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { EmotionAnalyzer, type EmotionData } from '@/lib/emotion-analyzer';
import { DailyGuidanceWidget } from '@/components/harmonic/DailyGuidanceWidget';
import { getHarmonicProfile, generateDailyHarmonicGuidance } from '@/lib/harmonic-ai-service';
import type { DailyHarmonicGuidance } from '@/lib/harmonic-ai-service';

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
  
  // Authentication state  
  const [userId, setUserId] = useState<string>('');
  
  // User & AI state
  const [userType, setUserType] = useState<string>('');
  const [aiPersonality, setAiPersonality] = useState<any>(null);
  const [relationshipType, setRelationshipType] = useState<'friend' | 'counselor' | 'romantic' | 'mentor'>('friend');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ name: '' });
  
  // Relationship & Memory
  const [relationship, setRelationship] = useState<RelationshipData | null>(null);
  const [memory, setMemory] = useState<MemorySystem | null>(null);
  const [newLevel, setNewLevel] = useState<any>(null);
  
  // Harmonic AI state
  const [dailyGuidance, setDailyGuidance] = useState<DailyHarmonicGuidance | null>(null);
  const [showGuidance, setShowGuidance] = useState(true);
  
  // UI state (non-chat related)
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
  
  // Legacy session state for initial compatibility
  const [chatCount, setChatCount] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  
  // Development mode
  const [testProfile, setTestProfile] = useState<TestProfile | null>(null);
  
  // 🎯 統一チャットフック統合 - 初期化前は仮の値を使用
  const chatState = useUnifiedChat({
    userType: userType as any || 'ARC-AS',
    aiPersonality: aiPersonality?.archetype || 'DRM',
    userId: userId || 'temp',
    autoSave: true,
    enableEncryption: true
  });
  
  // 🎵 Phase 1: 記憶システム統合（認証ユーザー必須）
  const { saveMessage } = useMemorySaver(
    chatState.currentSessionId, 
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
        
        // 🎯 設定ページで保存されたAI設定を優先的に取得
        let selectedArchetype: string = 'DRM';
        let savedRelationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor' = 'friend';
        let profile: any = null; // profileをより広いスコープで定義
        
        try {
          // user_profilesから保存済み設定を取得
          const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('selected_ai_personality, relationship_type, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);
          
          profile = profiles?.[0];
          
          if (error) {
            console.warn('⚠️ チャット用AI設定取得エラー:', error);
          } else if (profile?.selected_ai_personality) {
            // 保存された設定を使用
            selectedArchetype = profile.selected_ai_personality;
            savedRelationshipType = profile.relationship_type || 'friend';
            console.log('✅ 保存済みAI設定をチャットに適用:', {
              aiPersonality: selectedArchetype,
              relationshipType: savedRelationshipType,
              source: '設定ページ'
            });
          } else {
            // フォールバック: 診断結果を使用
            selectedArchetype = diagnosisStatus.aiPersonality || 'DRM';
            console.log('🔄 診断結果からAI設定を適用:', {
              aiPersonality: selectedArchetype,
              source: '診断結果'
            });
          }
        } catch (error) {
          console.warn('⚠️ AI設定取得エラー - デフォルト値を使用:', error);
          selectedArchetype = diagnosisStatus.aiPersonality || 'DRM';
        }
        
        const aiArchetypeData = ARCHETYPE_DATA[selectedArchetype as keyof typeof ARCHETYPE_DATA];
        
        console.log('🎯 最終的なAI設定:', { 
          userType: savedType, 
          baseType, 
          selectedArchetype,
          relationshipType: savedRelationshipType,
          aiName: aiArchetypeData.name
        });
        
        setUserType(savedType);
        setRelationshipType(savedRelationshipType);
        setAiPersonality({
          archetype: selectedArchetype,
          name: aiArchetypeData.name,
          personality: aiArchetypeData.description
        });

        // Load relationship and memory data
        const relationshipData = loadRelationshipData();
        const memoryData = null; // Temporary disable
        
        // 🔗 ハーモニックプロファイルから個人情報取得
        let personalData = { name: '', birthDate: null };
        
        try {
          const harmonicProfile = await getHarmonicProfile(user.id);
          if (harmonicProfile) {
            // データベースから名前を直接取得
            const { data: nameData } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('user_id', user.id)
              .order('updated_at', { ascending: false })
              .limit(1);
            
            const localPersonalData = JSON.parse(localStorage.getItem('personalInfo') || '{}');
            const dbName = nameData?.[0]?.display_name || '';
            personalData = {
              name: dbName || localPersonalData.name || '',
              birthDate: harmonicProfile.astrologyProfile.birthDate
            };
            console.log('🌟 ハーモニックプロファイルから個人情報取得:', {
              name: personalData.name,
              nameSource: dbName ? 'database' : (localPersonalData.name ? 'localStorage' : 'none'),
              birthDate: personalData.birthDate ? personalData.birthDate.toISOString().split('T')[0] : 'なし',
              zodiacSign: harmonicProfile.astrologyProfile.zodiac.sign
            });
          } else {
            // フォールバック: LocalStorageのみ
            const localPersonalData = JSON.parse(localStorage.getItem('personalInfo') || '{}');
            personalData = { name: localPersonalData.name || '', birthDate: null };
            console.log('📁 LocalStorageのみから個人情報取得:', personalData);
          }
        } catch (error) {
          console.warn('⚠️ 個人情報取得エラー:', error);
          const localPersonalData = JSON.parse(localStorage.getItem('personalInfo') || '{}');
          personalData = { name: localPersonalData.name || '', birthDate: null };
        }
        console.log('👤 Personal info loaded:', { 
          name: personalData.name, 
          source: personalData.name ? 'localStorage' : 'none' 
        });
        
        setRelationship(relationshipData);
        setMemory(null);
        setPersonalInfo(personalData);
        setChatCount(relationshipData?.totalPoints ? Math.floor(relationshipData.totalPoints / 10) + 1 : 1);

        // 🌟 ハーモニックAI日別ガイダンス読み込み
        try {
          const harmonicProfile = await getHarmonicProfile(user.id);
          if (harmonicProfile) {
            const guidance = await generateDailyHarmonicGuidance(harmonicProfile);
            setDailyGuidance(guidance);
          }
        } catch (error) {
          console.warn('⚠️ ハーモニックガイダンス読み込みエラー:', error);
        }

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


        // 🎯 統一チャットフックが初期化を処理するため、ここでは手動初期化をスキップ
        console.log('✅ 統一チャットフックによる初期化に委譲');
      } catch (error) {
        console.error('Chat initialization error:', error);
      }
    };

    initializeChat();
  }, [router]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatState.messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [chatState.messages]);

  // Handlers

  const handleShowProfile = () => {
    router.push('/settings');
  };

  const handleShowHistory = () => {
    chatState.setShowHistory(!chatState.showHistory);
  };

  const handleSelectSession = async (sessionId: string) => {
    await chatState.selectSession(sessionId);
    console.log('✅ Session selected via unified chat hook:', sessionId);
  };

  const handleNewSession = async () => {
    await chatState.createNewSession();
    setSessionStartTime(new Date());
    console.log('✅ New session created via unified chat hook');
  };

  // 🎯 セッション保存は統一チャットフックが自動処理するため削除

  // 🎯 統一チャットフック使用による簡略化されたメッセージ送信
  const handleSendMessage = async (content: string) => {
    if (!aiPersonality || chatState.isTyping) return;

    try {
      // 🎵 Phase 2: 感情分析実行
      const emotionData = EmotionAnalyzer.analyzeMessage(content);
      console.log('🎵 Emotion Analysis:', emotionData);

      // 🔐 統一フックを使用した簡略化されたメッセージ送信
      await chatState.sendMessage(content);
      
      console.log('✅ Message sent via unified chat hook');
    } catch (error) {
      console.error('❌ Error sending message via unified hook:', error);
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
  if (!userType || !aiPersonality || chatState.loadingStates.loading) {
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

            {/* 🔐 プライバシー表示 - モバイル最適化 */}
            <div className="mt-2 sm:mt-3">
              <SecureConnectionStatus 
                messagesEncrypted={chatState.messages.length}
                totalMessages={chatState.messages.length}
                securityEnhanced={true}
              />
            </div>

            {/* 🎯 統合データ状態表示 */}
            {(chatState.loadingStates.syncing || chatState.loadingStates.loadingMessages || chatState.error) && (
              <div className="mt-2 sm:mt-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-xs text-blue-700">
                    {chatState.loadingStates.syncing && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Supabaseと同期中...</span>
                      </div>
                    )}
                    {chatState.loadingStates.loadingMessages && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>メッセージを読み込み中...</span>
                      </div>
                    )}
                    {chatState.error && (
                      <div className="flex items-center gap-2 text-red-700">
                        <span>⚠️</span>
                        <span>{chatState.error}</span>
                        <button 
                          onClick={() => chatState.clearError()}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 関係性レベル表示 - モバイル最適化 */}
            {relationship && typeof relationship.currentLevel === 'object' && relationship.currentLevel.level > 1 && (
              <div className="mt-2 sm:mt-3">
                <div className="bg-stone-100/50 border border-stone-200 rounded-lg p-1.5 sm:p-2">
                  <div className="text-xs sm:text-sm text-stone-600 text-center">
                    関係性レベル {relationship.currentLevel.level}/6: {relationship.currentLevel.name}
                  </div>
                </div>
              </div>
            )}
            
            {/* 思い出表示 - モバイル最適化 */}
            {showMemories && (
              <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                  💕 共有した思い出
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-pink-700 font-medium mb-1">今日の会話</div>
                      <div className="text-pink-600">{chatState.messages.length}メッセージ交換</div>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-pink-700 font-medium mb-1">関係性レベル</div>
                      <div className="text-pink-600">レベル {relationship?.currentLevel?.level || 1}</div>
                    </div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <div className="text-pink-700 font-medium mb-2">最近の話題</div>
                    <div className="text-pink-600 space-y-1">
                      {chatState.messages.filter(m => m.sender === 'user').slice(-3).map((msg, index) => (
                        <div key={msg.id} className="text-xs truncate">
                          • {msg.content.slice(0, 40)}{msg.content.length > 40 ? '...' : ''}
                        </div>
                      ))}
                      {chatState.messages.filter(m => m.sender === 'user').length === 0 && (
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
              
              {/* 🌟 ハーモニック・ガイダンス表示 */}
              {dailyGuidance && showGuidance && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4"
                >
                  <DailyGuidanceWidget 
                    guidance={dailyGuidance}
                    compact={false}
                    onRefresh={async () => {
                      try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                          const profile = await getHarmonicProfile(user.id);
                          if (profile) {
                            const newGuidance = await generateDailyHarmonicGuidance(profile);
                            setDailyGuidance(newGuidance);
                          }
                        }
                      } catch (error) {
                        console.warn('⚠️ ガイダンス更新エラー:', error);
                      }
                    }}
                  />
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setShowGuidance(false)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      非表示にする
                    </button>
                  </div>
                </motion.div>
              )}
              
              <AnimatePresence>
                {chatState.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {chatState.isTyping && (
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
              disabled={chatState.isTyping || chatState.loadingStates.sending}
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
        isOpen={chatState.showHistory}
        onClose={() => chatState.setShowHistory(false)}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        currentSessionId={chatState.currentSessionId}
        userId={userId}
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
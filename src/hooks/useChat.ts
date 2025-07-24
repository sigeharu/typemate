// 🎵 TypeMate Chat Hook
// チャット状態管理とメッセージ処理のカスタムフック

'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage, type ChatSession, type UserProfile } from '@/lib/storage';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { personalityEngine, type EmotionState } from '@/lib/personality-engine';
import type { Message, Type64, BaseArchetype } from '@/types';
import { useRelationship } from './useRelationship';
import { useAstrology } from './useAstrology';
import { useMemory, extractMemoryCandidate } from './useMemory';
import { useSpecialEvents } from './useSpecialEvents';

interface UseChatOptions {
  userType: Type64;
  aiPersonality: BaseArchetype;
  autoSave?: boolean;
  sessionId?: string;
}

export function useChat({
  userType,
  aiPersonality,
  autoSave = true,
  sessionId
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    sessionId || uuidv4()
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>('calm');
  
  // Option B: 段階的情報収集
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  
  // 関係性と占いシステムの統合
  const relationship = useRelationship();
  const astrology = useAstrology();
  
  // 思い出システムの統合
  const memory = useMemory({ userType: userType!, aiPersonality: aiPersonality! });
  
  // 特別イベントシステムの統合
  const specialEvents = useSpecialEvents({
    relationshipLevel: relationship?.currentLevel.level || 1,
    firstMeetingDate: relationship?.relationshipData.specialDates.firstMeeting || new Date()
  });

  // セッションの初期化
  useEffect(() => {
    const initializeSession = () => {
      setIsLoading(true);
      
      // userTypeまたはaiPersonalityがnullの場合はエラー状態を設定
      if (!userType || !aiPersonality) {
        setMessages([{
          id: uuidv4(),
          content: 'エラー: ユーザータイプが設定されていません。診断ページからやり直してください。',
          sender: 'system',
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }
      
      if (sessionId) {
        // 指定されたセッションをロード
        const session = storage.getChatSession(sessionId);
        if (session) {
          setMessages(session.messages);
          setCurrentSessionId(sessionId);
          setIsLoading(false);
          return;
        }
      }

      // 最新のセッションを取得または新規作成
      const latestSession = storage.getLatestChatSession(userType, aiPersonality);
      
      if (latestSession && latestSession.messages.length > 0) {
        setMessages(latestSession.messages);
        setCurrentSessionId(latestSession.id);
      } else {
        // 新しいセッションを作成し、初期メッセージを追加
        const newSessionId = uuidv4();
        setCurrentSessionId(newSessionId);
        
        const initialMessage = createInitialMessage(userType, aiPersonality);
        setMessages([initialMessage]);
        
        if (autoSave) {
          const newSession: ChatSession = {
            id: newSessionId,
            userType,
            aiPersonality,
            messages: [initialMessage],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          storage.saveChatSession(newSession);
        }
      }
      
      setIsLoading(false);
    };

    initializeSession();
  }, [userType, aiPersonality, sessionId, autoSave]);

  // メッセージが更新されたときの自動保存
  useEffect(() => {
    if (!autoSave || isLoading || messages.length === 0) return;

    const session: ChatSession = {
      id: currentSessionId,
      userType,
      aiPersonality,
      messages,
      createdAt: storage.getChatSession(currentSessionId)?.createdAt || new Date(),
      updatedAt: new Date(),
      title: generateSessionTitle(messages)
    };

    storage.saveChatSession(session);
  }, [messages, currentSessionId, userType, aiPersonality, autoSave, isLoading]);

  // 初期メッセージの生成
  const createInitialMessage = useCallback((
    userType: Type64, 
    aiPersonality: BaseArchetype
  ): Message => {
    if (!userType || !aiPersonality) {
      return {
        id: uuidv4(),
        content: 'こんにちは！TypeMateへようこそ 🌟',
        sender: 'ai',
        timestamp: new Date(),
        archetypeType: aiPersonality
      };
    }

    const [baseType, variant] = userType.split('-') as [BaseArchetype, string];
    const userArchetype = ARCHETYPE_DATA[baseType];
    const aiArchetypeData = ARCHETYPE_DATA[aiPersonality];
    const environmentTrait = variant?.[0] === 'A' ? '協調型' : '競争型';
    const motivationTrait = variant?.[1] === 'S' ? '安定志向' : '成長志向';

    return {
      id: uuidv4(),
      content: `こんにちは🌟 私は${aiArchetypeData.name}として、あなたの${userArchetype.name}（${environmentTrait}×${motivationTrait}）のパートナーです。${aiArchetypeData.description} どんなことでもお話ししてくださいね✨`,
      sender: 'ai',
      timestamp: new Date(),
      archetypeType: aiPersonality
    };
  }, []);

  // メッセージ送信
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // userTypeまたはaiPersonalityがnullの場合はエラーメッセージを表示
    if (!userType || !aiPersonality) {
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'エラー: ユーザータイプが設定されていません。診断ページからやり直してください。',
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Option B: チャット回数を増加
    const chatCount = storage.incrementChatCount();

    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      archetypeType: userType
    };

    setMessages(prev => [...prev, userMessage]);
    
    // 🎵 ユーザーメッセージをメモリAPIに保存
    const saveUserMessage = async () => {
      try {
        await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageContent: content,
            messageRole: 'user',
            archetype: userType,
            conversationId: currentSessionId,
            userId: 'guest', // ゲストユーザー対応
            relationshipLevel: relationship.currentLevel.level
          })
        });
        console.log('✨ ユーザーメッセージ記憶保存完了！');
      } catch (error) {
        console.error('User message memory save failed:', error);
        // エラーでもチャット続行（重要！）
      }
    };

    // 非同期で実行（チャットをブロックしない）
    saveUserMessage();
    
    setIsTyping(true);
    
    // Option B: 2回目のチャットで個人情報モーダル表示判定
    if (storage.shouldShowPersonalInfoModal()) {
      setShowPersonalInfoModal(true);
    }
    
    // 関係性ポイントの追加
    await relationship.addPoints('message');
    relationship.checkMessageForBonus(content);

    // AI返答の生成（リアルAI API使用）
    try {
      const messageHistory = messages.map(m => m.content);
      const userProfile = storage.getUserProfile();
      const relationshipType = userProfile?.relationshipType || 'friend';
      
      // 占い情報のコンテキスト生成
      const astrologyContext = astrology.getAstrologyContext();
      
      // 重要な思い出の取得
      const importantMemories = memory.getImportantMemories(3);
      const relatedMemories = memory.getRelatedToKeywords([content]);
      
      // 今日のイベント確認
      const todaysEvents = specialEvents.todaysEvents;
      
      // Option B: 個人情報の取得
      const personalInfo = storage.getPersonalInfo();
      
      // リアルAI APIコール
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          userType,
          aiPersonality,
          relationshipType,
          messageHistory,
          conversationTurn: messages.length / 2,
          astrologyContext,
          relationshipLevel: relationship.currentLevel.level,
          chatCount, // Option B: チャット回数を追加
          personalInfo, // Option B: 個人情報を追加
          importantMemories: importantMemories.map(m => ({
            content: m.content,
            emotionScore: m.emotionScore,
            category: m.category,
            timestamp: m.timestamp
          })),
          relatedMemories: relatedMemories.map(m => ({
            content: m.content,
            keywords: m.keywords
          })),
          todaysEvents: todaysEvents.map(e => ({
            name: e.name,
            message: e.message,
            type: e.type
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const aiResponse = await response.json();
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: uuidv4(),
          content: aiResponse.content,
          sender: 'ai',
          timestamp: new Date(),
          archetypeType: aiPersonality,
          emotion: aiResponse.emotion
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // 🎵 AI応答をメモリAPIに保存
        const saveAIMessage = async (aiContent: string) => {
          try {
            await fetch('/api/memory', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messageContent: aiContent,
                messageRole: 'ai',
                archetype: aiPersonality,
                conversationId: currentSessionId,
                userId: 'guest',
                relationshipLevel: relationship.currentLevel.level
              })
            });
            console.log('✨ AI応答記憶保存完了！');
          } catch (error) {
            console.error('AI message memory save failed:', error);
            // エラーでもチャット続行（重要！）
          }
        };

        // 非同期で実行
        saveAIMessage(aiResponse.content);
        
        setCurrentEmotion(aiResponse.emotion);
        setIsTyping(false);
        
        // 思い出の作成判定
        const memoryCandidate = extractMemoryCandidate(content, aiResponse.content);
        if (memoryCandidate.shouldSave) {
          memory.addMemory(
            memoryCandidate.content,
            content,
            relationship.currentLevel.level
          );
        }
        
        // 関連する思い出の参照回数増加
        relatedMemories.forEach(relatedMemory => {
          memory.incrementReference(relatedMemory.id);
        });
        
      }, 800 + Math.random() * 1200); // 少し早めのレスポンス
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      
      // フォールバック: ローカル個性エンジンを使用
      try {
        const messageHistory = messages.map(m => m.content);
        const userProfile = storage.getUserProfile();
        const relationshipType = userProfile?.relationshipType || 'friend';
        
        const context = {
          userType,
          aiPersonality,
          relationshipType,
          messageHistory,
          timeOfDay: personalityEngine.getCurrentTimeOfDay(),
          conversationTurn: messages.length / 2
        };

        const fallbackResponse = await personalityEngine.generateResponse(content, context);
        
        setTimeout(() => {
          const aiMessage: Message = {
            id: uuidv4(),
            content: fallbackResponse.content + ' (オフライン)',
            sender: 'ai',
            timestamp: new Date(),
            archetypeType: aiPersonality,
            emotion: fallbackResponse.emotion
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setCurrentEmotion(fallbackResponse.emotion);
          setIsTyping(false);
        }, 1000);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setIsTyping(false);
      }
    }
  }, [userType, aiPersonality, messages]);

  // 新しいセッションの作成
  const startNewSession = useCallback(() => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    
    const initialMessage = createInitialMessage(userType, aiPersonality);
    setMessages([initialMessage]);
  }, [userType, aiPersonality, createInitialMessage]);

  // Option B: 個人情報更新ハンドラー
  const handlePersonalInfoSubmit = useCallback((info: { name: string; birthday: string }) => {
    // 個人情報をストレージに保存
    storage.updatePersonalInfo(info);
    
    // 関係性ポイントを追加（名前・誕生日取得で50ポイント）
    relationship.addPoints('deep_conversation');
    relationship.addPoints('emotion_expression');
    
    // レベルアップお祝いメッセージを送信
    const celebrationMessage: Message = {
      id: uuidv4(),
      content: `${info.name}さん♪ 素敵な名前ですね！これからは${info.name}さんって呼ばせてもらいます✨ 私たちの関係がより親しくなりました🎉`,
      sender: 'ai',
      timestamp: new Date(),
      archetypeType: aiPersonality,
      isSpecial: true
    };
    
    setMessages(prev => [...prev, celebrationMessage]);
    setShowPersonalInfoModal(false);
  }, [aiPersonality, relationship]);

  // セッションのクリア
  const clearSession = useCallback(() => {
    setMessages([]);
    if (autoSave) {
      storage.deleteChatSession(currentSessionId);
    }
  }, [currentSessionId, autoSave]);

  return {
    messages,
    isTyping,
    isLoading,
    currentSessionId,
    currentEmotion,
    sendMessage,
    startNewSession,
    clearSession,
    relationship,
    astrology,
    memory,
    specialEvents,
    // Option B関連
    showPersonalInfoModal,
    setShowPersonalInfoModal,
    handlePersonalInfoSubmit,
    chatCount: storage.getChatCount(),
    personalInfo: storage.getPersonalInfo()
  };
}

// セッションタイトル生成
function generateSessionTitle(messages: Message[]): string {
  if (messages.length === 0) return '新しい会話';
  
  const userMessages = messages.filter(m => m.sender === 'user');
  if (userMessages.length === 0) return '新しい会話';
  
  const firstUserMessage = userMessages[0].content;
  const truncated = firstUserMessage.length > 20 
    ? firstUserMessage.substring(0, 20) + '...' 
    : firstUserMessage;
    
  return truncated;
}
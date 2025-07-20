// 🎵 TypeMate Chat Hook
// チャット状態管理とメッセージ処理のカスタムフック

'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage, type ChatSession, type UserProfile } from '@/lib/storage';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { personalityEngine, type EmotionState } from '@/lib/personality-engine';
import type { Message, Type64, BaseArchetype } from '@/types';

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

    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      archetypeType: userType
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // AI返答の生成（リアルAI API使用）
    try {
      const messageHistory = messages.map(m => m.content);
      const userProfile = storage.getUserProfile();
      const relationshipType = userProfile?.relationshipType || 'friend';
      
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
          conversationTurn: messages.length / 2
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
        setCurrentEmotion(aiResponse.emotion);
        setIsTyping(false);
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
    clearSession
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
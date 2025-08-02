// 🎵 TypeMate 統一チャットフック
// localStorage/Supabase完全統合のチャットシステム

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage, type ChatSession } from '@/lib/storage';
import { memoryManager } from '@/lib/memory-manager';
import { useMemoryManager } from './useMemoryManager';
import type { Message, Type64, BaseArchetype } from '@/types';
import { PrivacyEngine, createEncryptedMessage } from '@/lib/privacy-encryption';
import { SecureMemoryManager } from '@/lib/SecureMemoryManager';
import { sendEnhancedMessage, isHarmonicEnhancementAvailable } from '@/lib/harmonic-chat-service';

// 📋 統一チャット状態の型定義
interface UnifiedChatState {
  messages: Message[];
  sessions: ChatSession[];
  currentSessionId: string;
  nextSequenceNumber: number;
  
  // 詳細ローディング状態
  loadingStates: {
    sending: boolean;
    loading: boolean;
    syncing: boolean;
    loadingMessages: boolean;
    savingSession: boolean;
  };
  
  // エラー状態
  error: string | null;
  networkError: boolean;
  
  // UI状態
  isTyping: boolean;
  showHistory: boolean;
}

// 🎯 フックオプション
interface UseUnifiedChatOptions {
  userType: Type64;
  aiPersonality: BaseArchetype;
  userId: string;
  autoSave?: boolean;
  sessionId?: string;
  enableEncryption?: boolean;
}

// 🎯 フック戻り値の型
interface UseUnifiedChatReturn extends UnifiedChatState {
  // メッセージ操作
  sendMessage: (content: string) => Promise<void>;
  
  // セッション管理
  createNewSession: () => Promise<string>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // データ同期
  syncWithSupabase: () => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  
  // UI操作
  setShowHistory: (show: boolean) => void;
  clearError: () => void;
  
  // 便利メソッド
  getCurrentSession: () => ChatSession | null;
  getMessageCount: () => number;
  hasUnsyncedData: () => boolean;
}

export function useUnifiedChat({
  userType,
  aiPersonality,
  userId,
  autoSave = true,
  sessionId,
  enableEncryption = true
}: UseUnifiedChatOptions): UseUnifiedChatReturn {
  
  // 🏗️ 基本状態管理
  const [state, setState] = useState<UnifiedChatState>({
    messages: [],
    sessions: [],
    currentSessionId: sessionId || '',
    nextSequenceNumber: 1,
    loadingStates: {
      sending: false,
      loading: true,
      syncing: false,
      loadingMessages: false,
      savingSession: false
    },
    error: null,
    networkError: false,
    isTyping: false,
    showHistory: false
  });

  // 🔄 リトライ用Ref
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // 🎵 Memory Manager統合
  const memoryManagerHook = useMemoryManager({
    userId,
    conversationId: state.currentSessionId,
    archetype: aiPersonality,
    autoLoad: false
  });

  // 🚀 初期化処理
  useEffect(() => {
    const initializeChat = async () => {
      console.log('🎵 UnifiedChat初期化開始:', { userType, aiPersonality, userId, sessionId });
      
      setState(prev => ({ 
        ...prev, 
        loadingStates: { ...prev.loadingStates, loading: true },
        error: null 
      }));

      try {
        // 1. localStorageからセッション一覧を読み込み
        const allSessions = storage.getAllChatSessions();
        console.log('📋 localStorage sessions loaded:', allSessions.length);

        // 2. 指定されたセッションまたは最新セッションを特定
        let targetSessionId = sessionId;
        let targetSession: ChatSession | null = null;

        if (targetSessionId) {
          targetSession = storage.getChatSession(targetSessionId);
        } else {
          // 最新のセッションを取得
          const latestSession = storage.getLatestChatSession(userType, aiPersonality);
          if (latestSession) {
            targetSessionId = latestSession.id;
            targetSession = latestSession;
          }
        }

        // 3. セッションが見つからない場合は新規作成
        if (!targetSession) {
          console.log('🆕 新規セッション作成');
          targetSessionId = await createNewSessionInternal();
          targetSession = storage.getChatSession(targetSessionId!);
        }

        // 4. Supabaseからメッセージを読み込み（最優先）
        let messages: Message[] = [];
        if (targetSessionId) {
          try {
            const supabaseMessages = await memoryManager.getConversationMessages(targetSessionId, userId);
            console.log('💾 Supabase messages loaded:', supabaseMessages.length);
            messages = supabaseMessages;
          } catch (supabaseError) {
            console.warn('⚠️ Supabase読み込み失敗、localStorageを使用:', supabaseError);
            messages = targetSession?.messages || [];
          }
        }

        // 5. 次のシーケンス番号を計算
        const maxSequence = messages.length > 0 
          ? Math.max(...messages.map(m => m.sequenceNumber ?? 0))
          : 0;

        // 6. 状態を更新
        setState(prev => ({
          ...prev,
          sessions: allSessions,
          currentSessionId: targetSessionId || '',
          messages,
          nextSequenceNumber: maxSequence + 1,
          loadingStates: { ...prev.loadingStates, loading: false },
          error: null
        }));

        console.log('✅ UnifiedChat初期化完了:', {
          sessionId: targetSessionId,
          messagesCount: messages.length,
          nextSequenceNumber: maxSequence + 1
        });

      } catch (error) {
        console.error('❌ UnifiedChat初期化エラー:', error);
        setState(prev => ({
          ...prev,
          loadingStates: { ...prev.loadingStates, loading: false },
          error: `初期化エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
          networkError: true
        }));
      }
    };

    if (userType && aiPersonality && userId) {
      initializeChat();
    }
  }, [userType, aiPersonality, userId, sessionId]);

  // 🔄 新規セッション作成（内部用）
  const createNewSessionInternal = async (): Promise<string> => {
    const newSessionId = uuidv4();
    const initialMessage: Message = {
      id: uuidv4(),
      content: `こんにちは🌟 私は${aiPersonality}として、あなたの${userType}のパートナーです。どんなことでもお話ししてくださいね✨`,
      sender: 'ai',
      timestamp: new Date(),
      isUser: false,
      sessionId: newSessionId,
      sequenceNumber: 1,
      archetypeType: aiPersonality
    };

    const newSession: ChatSession = {
      id: newSessionId,
      userType,
      aiPersonality,
      messages: [initialMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
      title: '新しい会話'
    };

    // localStorageに保存
    storage.saveChatSession(newSession);
    
    // Supabaseに初期メッセージを保存（非同期）
    if (enableEncryption) {
      try {
        await memoryManagerHook.saveMessage(
          initialMessage.content,
          'ai',
          undefined,
          undefined,
          1
        );
        console.log('💾 初期メッセージをSupabaseに保存完了');
      } catch (error) {
        console.warn('⚠️ 初期メッセージSupabase保存失敗:', error);
      }
    }

    return newSessionId;
  };

  // 📨 メッセージ送信（楽観的更新）
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !userType || !aiPersonality || !userId) {
      console.warn('❌ Invalid message send parameters');
      return;
    }

    const messageId = uuidv4();
    const timestamp = new Date();
    const sequenceNumber = state.nextSequenceNumber;

    // 1. 楽観的UI更新（即座にメッセージを表示）
    const userMessage: Message = {
      id: messageId,
      content: content.trim(),
      sender: 'user',
      timestamp,
      isUser: true,
      sessionId: state.currentSessionId,
      sequenceNumber,
      archetypeType: userType
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      nextSequenceNumber: prev.nextSequenceNumber + 1,
      loadingStates: { ...prev.loadingStates, sending: true },
      isTyping: true,
      error: null
    }));

    try {
      // 2. Supabaseに保存（暗号化対応）
      if (enableEncryption) {
        const saveSuccess = await memoryManagerHook.saveMessage(
          content.trim(),
          'user',
          undefined,
          undefined,
          sequenceNumber
        );
        
        if (!saveSuccess) {
          throw new Error('Failed to save user message to Supabase');
        }
      }

      // 3. localStorage更新
      if (autoSave) {
        const currentSession = storage.getChatSession(state.currentSessionId);
        if (currentSession) {
          const updatedSession: ChatSession = {
            ...currentSession,
            messages: [...currentSession.messages, userMessage],
            updatedAt: new Date()
          };
          storage.saveChatSession(updatedSession);
        }
      }

      // 4. ハーモニック統合AI応答生成
      const messageHistory = state.messages.map(m => m.content);
      
      console.log('🌟 Using Harmonic Enhanced Chat Service', {
        userId,
        userType,
        aiPersonality,
        messageHistoryLength: messageHistory.length
      });
      
      const enhancedRequest = {
        message: content.trim(),
        userType,
        aiPersonality,
        userId,
        relationshipType: 'friend' as const,
        messageHistory,
        conversationTurn: state.messages.length / 2,
        currentMood: '😊',
        moodContext: '',
        personalInfo: {},
        chatCount: state.messages.length + 1,
      };

      const aiResponse = await sendEnhancedMessage(enhancedRequest);
      
      console.log('✨ Harmonic Enhanced Response:', {
        hasAstrologicalInsight: !!aiResponse.astrologicalInsight,
        harmonicEnhancement: aiResponse.harmonicEnhancement,
        emotionIntensity: aiResponse.emotionAnalysis?.intensity || 0,
        contentLength: aiResponse.content?.length || 0
      });
      
      // 5. AI応答の楽観的追加
      const aiMessage: Message = {
        id: uuidv4(),
        content: aiResponse.content,
        sender: 'ai',
        timestamp: new Date(),
        isUser: false,
        sessionId: state.currentSessionId,
        sequenceNumber: sequenceNumber + 1,
        archetypeType: aiPersonality,
        emotion: aiResponse.emotion
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        nextSequenceNumber: prev.nextSequenceNumber + 1,
        loadingStates: { ...prev.loadingStates, sending: false },
        isTyping: false
      }));

      // 6. AI応答をSupabaseに保存
      if (enableEncryption) {
        await memoryManagerHook.saveMessage(
          aiResponse.content,
          'ai',
          undefined,
          aiResponse.emotionAnalysis,
          sequenceNumber + 1
        );
      }

      // 7. localStorage更新（AI応答）
      if (autoSave) {
        const currentSession = storage.getChatSession(state.currentSessionId);
        if (currentSession) {
          const updatedSession: ChatSession = {
            ...currentSession,
            messages: [...currentSession.messages, userMessage, aiMessage],
            updatedAt: new Date()
          };
          storage.saveChatSession(updatedSession);
        }
      }

      console.log('✅ メッセージ送信完了:', {
        userMessageId: messageId,
        aiMessageId: aiMessage.id,
        sequenceNumbers: [sequenceNumber, sequenceNumber + 1]
      });

      retryCountRef.current = 0; // リトライカウンターリセット

    } catch (error) {
      console.error('❌ メッセージ送信エラー:', error);
      
      // エラー時のロールバック（楽観的更新を取り消し）
      setState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1), // 最後のメッセージを削除
        nextSequenceNumber: prev.nextSequenceNumber - 1,
        loadingStates: { ...prev.loadingStates, sending: false },
        isTyping: false,
        error: `メッセージ送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        networkError: true
      }));

      // リトライ機能
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`🔄 リトライ ${retryCountRef.current}/${maxRetries}`);
        setTimeout(() => sendMessage(content), 2000 * retryCountRef.current);
      }
    }
  }, [state.currentSessionId, state.nextSequenceNumber, state.messages, userType, aiPersonality, userId, enableEncryption, autoSave, memoryManagerHook]);

  // 🆕 新規セッション作成
  const createNewSession = useCallback(async (): Promise<string> => {
    setState(prev => ({ 
      ...prev, 
      loadingStates: { ...prev.loadingStates, savingSession: true } 
    }));

    try {
      const newSessionId = await createNewSessionInternal();
      
      // 状態を更新
      const allSessions = storage.getAllChatSessions();
      const newSession = storage.getChatSession(newSessionId);
      
      setState(prev => ({
        ...prev,
        currentSessionId: newSessionId,
        sessions: allSessions,
        messages: newSession?.messages || [],
        nextSequenceNumber: 2, // 初期メッセージの次
        loadingStates: { ...prev.loadingStates, savingSession: false },
        error: null
      }));

      console.log('✅ 新規セッション作成完了:', newSessionId);
      return newSessionId;

    } catch (error) {
      console.error('❌ 新規セッション作成エラー:', error);
      setState(prev => ({
        ...prev,
        loadingStates: { ...prev.loadingStates, savingSession: false },
        error: `セッション作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      throw error;
    }
  }, [userType, aiPersonality, userId, enableEncryption, memoryManagerHook]);

  // 📖 セッション選択
  const selectSession = useCallback(async (sessionId: string) => {
    console.log('🔍 セッション選択開始:', sessionId);
    
    setState(prev => ({ 
      ...prev, 
      loadingStates: { ...prev.loadingStates, loadingMessages: true },
      error: null 
    }));

    try {
      // 1. localStorageからセッション情報を取得
      const session = storage.getChatSession(sessionId);
      if (!session) {
        throw new Error(`セッション ${sessionId} が見つかりません`);
      }

      // 2. Supabaseからメッセージを読み込み
      const supabaseMessages = await memoryManager.getConversationMessages(sessionId, userId);
      console.log('📊 Supabase messages loaded for session:', supabaseMessages.length);

      // 3. 次のシーケンス番号を計算
      const maxSequence = supabaseMessages.length > 0 
        ? Math.max(...supabaseMessages.map(m => m.sequenceNumber ?? 0))
        : 0;

      // 4. 状態を更新
      setState(prev => ({
        ...prev,
        currentSessionId: sessionId,
        messages: supabaseMessages,
        nextSequenceNumber: maxSequence + 1,
        loadingStates: { ...prev.loadingStates, loadingMessages: false },
        showHistory: false
      }));

      console.log('✅ セッション選択完了:', {
        sessionId,
        messagesCount: supabaseMessages.length,
        nextSequenceNumber: maxSequence + 1
      });

    } catch (error) {
      console.error('❌ セッション選択エラー:', error);
      setState(prev => ({
        ...prev,
        loadingStates: { ...prev.loadingStates, loadingMessages: false },
        error: `セッション読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, [userId]);

  // 🗑️ セッション削除
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      // localStorageから削除
      storage.deleteChatSession(sessionId);
      
      // セッション一覧を更新
      const allSessions = storage.getAllChatSessions();
      
      setState(prev => ({
        ...prev,
        sessions: allSessions,
        currentSessionId: prev.currentSessionId === sessionId ? '' : prev.currentSessionId,
        messages: prev.currentSessionId === sessionId ? [] : prev.messages
      }));

      console.log('✅ セッション削除完了:', sessionId);

    } catch (error) {
      console.error('❌ セッション削除エラー:', error);
      setState(prev => ({
        ...prev,
        error: `セッション削除に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, []);

  // 🔄 Supabaseとの同期
  const syncWithSupabase = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      loadingStates: { ...prev.loadingStates, syncing: true } 
    }));

    try {
      if (state.currentSessionId) {
        const supabaseMessages = await memoryManager.getConversationMessages(state.currentSessionId, userId);
        setState(prev => ({
          ...prev,
          messages: supabaseMessages,
          loadingStates: { ...prev.loadingStates, syncing: false }
        }));
        console.log('✅ Supabase同期完了');
      }
    } catch (error) {
      console.error('❌ Supabase同期エラー:', error);
      setState(prev => ({
        ...prev,
        loadingStates: { ...prev.loadingStates, syncing: false },
        error: `同期に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, [state.currentSessionId, userId]);

  // 📋 セッション一覧更新
  const refreshSessions = useCallback(async () => {
    try {
      const allSessions = storage.getAllChatSessions();
      setState(prev => ({ ...prev, sessions: allSessions }));
      console.log('✅ セッション一覧更新完了');
    } catch (error) {
      console.error('❌ セッション一覧更新エラー:', error);
    }
  }, []);

  // 📖 特定セッションのメッセージ読み込み
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const messages = await memoryManager.getConversationMessages(sessionId, userId);
      console.log('✅ セッションメッセージ読み込み完了:', messages.length);
      return messages;
    } catch (error) {
      console.error('❌ セッションメッセージ読み込みエラー:', error);
      throw error;
    }
  }, [userId]);

  // 🎛️ UI操作
  const setShowHistory = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showHistory: show }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, networkError: false }));
  }, []);

  // 🔧 便利メソッド
  const getCurrentSession = useCallback((): ChatSession | null => {
    return storage.getChatSession(state.currentSessionId);
  }, [state.currentSessionId]);

  const getMessageCount = useCallback((): number => {
    return state.messages.length;
  }, [state.messages.length]);

  const hasUnsyncedData = useCallback((): boolean => {
    // localStorageとSupabaseの同期状況をチェック
    // 簡易実装：エラー状態をチェック
    return state.networkError;
  }, [state.networkError]);

  // 🎯 戻り値
  return {
    // 状態
    ...state,
    
    // メッセージ操作
    sendMessage,
    
    // セッション管理
    createNewSession,
    selectSession,
    deleteSession,
    
    // データ同期
    syncWithSupabase,
    loadSessionMessages,
    refreshSessions,
    
    // UI操作
    setShowHistory,
    clearError,
    
    // 便利メソッド
    getCurrentSession,
    getMessageCount,
    hasUnsyncedData
  };
}
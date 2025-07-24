// 🎵 TypeMate Phase 1: 記憶管理React Hook
// チャット統合用記憶システムフック

import { useState, useEffect, useCallback } from 'react';
import { memoryManager, type BasicMemory, type ShortTermMemory, type MemoryProgressState } from '@/lib/memory-manager';

interface UseMemoryManagerOptions {
  userId?: string;
  conversationId?: string;
  archetype: string;
  autoLoad?: boolean;
}

interface UseMemoryManagerReturn {
  // Phase 1: 基本状態
  memories: BasicMemory[];
  memoryProgress: MemoryProgressState;
  isLoading: boolean;
  error: string | null;
  
  // Phase 1: 記憶操作
  saveMessage: (content: string, role: 'user' | 'ai', userName?: string) => Promise<boolean>;
  loadShortTermMemory: () => Promise<void>;
  updateUserName: (name: string) => Promise<boolean>;
  updateRelationshipLevel: (level: number) => Promise<boolean>;
  
  // Phase 1: 便利メソッド
  hasUserName: boolean;
  conversationCount: number;
  lastMemories: BasicMemory[];
}

export function useMemoryManager({
  userId,
  conversationId,
  archetype,
  autoLoad = true
}: UseMemoryManagerOptions): UseMemoryManagerReturn {
  
  // Phase 1: 基本状態管理
  const [memories, setMemories] = useState<BasicMemory[]>([]);
  const [memoryProgress, setMemoryProgress] = useState<MemoryProgressState>({
    hasUserName: false,
    relationshipLevel: 1,
    conversationCount: 0,
    lastInteraction: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: 短期記憶読み込み
  const loadShortTermMemory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const shortTerm = await memoryManager.getShortTermMemory(userId, conversationId);
      const progress = await memoryManager.getMemoryProgress(userId);
      
      setMemories(shortTerm.memories);
      setMemoryProgress(progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Memory load failed';
      setError(errorMessage);
      console.error('Memory load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, conversationId]);

  // Phase 1: メッセージ保存
  const saveMessage = useCallback(async (
    content: string, 
    role: 'user' | 'ai', 
    userName?: string
  ): Promise<boolean> => {
    if (!conversationId) {
      console.warn('No conversation ID provided for memory save');
      return false;
    }

    try {
      const memory = await memoryManager.saveConversationMemory(
        content,
        role,
        archetype,
        conversationId,
        userId,
        userName
      );

      if (memory) {
        // 成功時は短期記憶を更新
        setMemories(prev => [memory, ...prev.slice(0, 9)]); // 最新10件維持
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Message save error:', err);
      return false;
    }
  }, [userId, conversationId, archetype]);

  // Phase 1: ユーザー名更新
  const updateUserName = useCallback(async (name: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await memoryManager.updateUserName(userId, name);
      if (success) {
        setMemoryProgress(prev => ({ ...prev, hasUserName: true }));
        // 既存記憶も更新
        await loadShortTermMemory();
      }
      return success;
    } catch (err) {
      console.error('User name update error:', err);
      return false;
    }
  }, [userId, loadShortTermMemory]);

  // Phase 1: 関係性レベル更新
  const updateRelationshipLevel = useCallback(async (level: number): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const success = await memoryManager.updateRelationshipLevel(userId, level);
      if (success) {
        setMemoryProgress(prev => ({ ...prev, relationshipLevel: level }));
      }
      return success;
    } catch (err) {
      console.error('Relationship level update error:', err);
      return false;
    }
  }, [userId]);

  // Phase 1: 自動読み込み
  useEffect(() => {
    if (autoLoad) {
      loadShortTermMemory();
    }
  }, [autoLoad, loadShortTermMemory]);

  // Phase 1: 便利な計算値
  const hasUserName = memoryProgress.hasUserName;
  const conversationCount = memoryProgress.conversationCount;
  const lastMemories = memories.slice(0, 5); // 直近5件

  return {
    // 基本状態
    memories,
    memoryProgress,
    isLoading,
    error,
    
    // 操作メソッド
    saveMessage,
    loadShortTermMemory,
    updateUserName,
    updateRelationshipLevel,
    
    // 便利プロパティ
    hasUserName,
    conversationCount,
    lastMemories
  };
}

// Phase 1: 軽量版フック（メッセージ保存のみ）
export function useMemorySaver(conversationId: string, archetype: string, userId?: string) {
  const saveMessage = useCallback(async (
    content: string, 
    role: 'user' | 'ai', 
    userName?: string
  ): Promise<boolean> => {
    try {
      const memory = await memoryManager.saveConversationMemory(
        content,
        role,
        archetype,
        conversationId,
        userId,
        userName
      );
      return !!memory;
    } catch (err) {
      console.error('Memory save error:', err);
      return false;
    }
  }, [conversationId, archetype, userId]);

  return { saveMessage };
}
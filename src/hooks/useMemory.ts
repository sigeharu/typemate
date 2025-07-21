// 💝 TypeMate Memory Hook
// 思い出管理カスタムフック

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Memory, 
  MemoryCollection,
  createMemory,
  createMemoryCollection,
  searchMemories,
  getRelatedMemories,
  calculateEmotionScore,
  extractKeywords
} from '@/lib/memory-system';
import { MemoryWeightEngine } from '@/lib/memory-weight';
import type { Type64, BaseArchetype } from '@/types';

const MEMORY_STORAGE_KEY = 'typemate-memories';

interface UseMemoryOptions {
  userType: Type64;
  aiPersonality: BaseArchetype;
}

interface UseMemoryReturn {
  memories: Memory[];
  memoryCollection: MemoryCollection;
  addMemory: (content: string, originalMessage: string, relationshipLevel: number) => Memory;
  getImportantMemories: (limit?: number) => Memory[];
  searchMemory: (query: string, category?: Memory['category']) => Memory[];
  getRecentMemories: (days?: number) => Memory[];
  getMemoriesByCategory: (category: Memory['category']) => Memory[];
  incrementReference: (memoryId: string) => void;
  getRelatedToKeywords: (keywords: string[]) => Memory[];
  getMemoryStats: () => ReturnType<MemoryWeightEngine['analyzeGrowthPattern']>;
  clearMemories: () => void;
  exportMemories: () => string;
  importMemories: (data: string) => boolean;
}

export function useMemory({ userType, aiPersonality }: UseMemoryOptions): UseMemoryReturn {
  const [memories, setMemories] = useState<Memory[]>([]);
  const memoryEngine = useMemo(() => new MemoryWeightEngine(), []);

  // データの永続化
  useEffect(() => {
    const savedMemories = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (savedMemories) {
      try {
        const parsed = JSON.parse(savedMemories);
        const restoredMemories = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMemories(restoredMemories);
      } catch (error) {
        console.error('Failed to load memories:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    }
  }, [memories]);

  // メモリーコレクションの作成
  const memoryCollection = useMemo(() => {
    const updatedMemories = memoryEngine.recalculateAllWeights(memories);
    return createMemoryCollection(updatedMemories);
  }, [memories, memoryEngine]);

  // 思い出の追加
  const addMemory = useCallback((
    content: string, 
    originalMessage: string, 
    relationshipLevel: number
  ): Memory => {
    const context = {
      userType,
      aiPersonality,
      timeOfDay: new Date().getHours() < 12 ? '朝' : 
                 new Date().getHours() < 17 ? '昼' : '夜',
      conversationTurn: memories.length
    };

    const newMemory = createMemory(content, originalMessage, context, relationshipLevel);
    
    setMemories(prev => [newMemory, ...prev]);
    
    return newMemory;
  }, [userType, aiPersonality, memories.length]);

  // 重要な思い出の取得
  const getImportantMemories = useCallback((limit: number = 5): Memory[] => {
    return memoryEngine.selectImportantMemories(memories, limit);
  }, [memories, memoryEngine]);

  // 思い出の検索
  const searchMemory = useCallback((
    query: string,
    category?: Memory['category']
  ): Memory[] => {
    return searchMemories(memories, query, category);
  }, [memories]);

  // 最近の思い出
  const getRecentMemories = useCallback((days: number = 7): Memory[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return memories
      .filter(memory => memory.timestamp >= cutoffDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [memories]);

  // カテゴリー別思い出
  const getMemoriesByCategory = useCallback((category: Memory['category']): Memory[] => {
    return memories
      .filter(memory => memory.category === category)
      .sort((a, b) => {
        const weightA = memoryEngine.recalculateWeight(a);
        const weightB = memoryEngine.recalculateWeight(b);
        return weightB - weightA;
      });
  }, [memories, memoryEngine]);

  // 参照回数の増加
  const incrementReference = useCallback((memoryId: string): void => {
    setMemories(prev => 
      prev.map(memory => 
        memory.id === memoryId 
          ? { ...memory, references: memory.references + 1 }
          : memory
      )
    );
  }, []);

  // キーワード関連思い出
  const getRelatedToKeywords = useCallback((keywords: string[]): Memory[] => {
    return getRelatedMemories(memories, keywords);
  }, [memories]);

  // 成長統計の取得
  const getMemoryStats = useCallback(() => {
    return memoryEngine.analyzeGrowthPattern(memories);
  }, [memories, memoryEngine]);

  // メモリークリア
  const clearMemories = useCallback((): void => {
    setMemories([]);
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  }, []);

  // メモリーエクスポート
  const exportMemories = useCallback((): string => {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      userType,
      aiPersonality,
      memories: memories
    }, null, 2);
  }, [memories, userType, aiPersonality]);

  // メモリーインポート
  const importMemories = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.memories || !Array.isArray(parsed.memories)) {
        return false;
      }

      const restoredMemories = parsed.memories.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));

      setMemories(restoredMemories);
      return true;
    } catch (error) {
      console.error('Failed to import memories:', error);
      return false;
    }
  }, []);

  return {
    memories,
    memoryCollection,
    addMemory,
    getImportantMemories,
    searchMemory,
    getRecentMemories,
    getMemoriesByCategory,
    incrementReference,
    getRelatedToKeywords,
    getMemoryStats,
    clearMemories,
    exportMemories,
    importMemories
  };
}

// 会話から思い出候補を抽出する補助関数
export function extractMemoryCandidate(
  userMessage: string,
  aiResponse: string,
  threshold: number = 5
): { shouldSave: boolean; content: string; emotionScore: number } {
  // ユーザーメッセージとAI応答を組み合わせて分析
  const combinedContent = `${userMessage} ${aiResponse}`;
  const emotionScore = calculateEmotionScore(combinedContent);
  
  // 閾値を超えるか、特定のキーワードがあれば保存対象
  const keywords = extractKeywords(combinedContent);
  const shouldSave = emotionScore >= threshold || 
                    keywords.some(k => ['好き', '愛してる', '初めて', '記念'].includes(k));

  // 保存する内容を決定（主にユーザーの発言を中心に）
  const content = userMessage.length > aiResponse.length ? userMessage : combinedContent;

  return {
    shouldSave,
    content,
    emotionScore
  };
}
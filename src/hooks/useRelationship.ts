// 💕 TypeMate Relationship Hook
// 関係性管理カスタムフック

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  RelationshipData, 
  RelationshipLevel, 
  PointEvent 
} from '@/types';
import {
  RELATIONSHIP_LEVELS,
  calculateRelationshipLevel,
  addRelationshipPoints,
  isDeepConversation,
  hasEmotionExpression,
  calculateDailyStreak
} from '@/lib/relationship-system';
import {
  loadRelationshipData,
  saveRelationshipData,
  addMilestone,
  getRelationshipStats
} from '@/lib/relationship-storage';

interface UseRelationshipReturn {
  relationshipData: RelationshipData;
  currentLevel: RelationshipLevel;
  stats: ReturnType<typeof getRelationshipStats>;
  addPoints: (eventType: PointEvent['type']) => Promise<{
    levelUp: boolean;
    newLevel?: RelationshipLevel;
  }>;
  checkMessageForBonus: (message: string) => void;
  updateDailyStreak: () => void;
}

export function useRelationship(): UseRelationshipReturn {
  const [relationshipData, setRelationshipData] = useState<RelationshipData>(() => 
    loadRelationshipData()
  );
  
  const currentLevel = calculateRelationshipLevel(relationshipData.totalPoints);
  const stats = getRelationshipStats();

  // データの永続化
  useEffect(() => {
    saveRelationshipData(relationshipData);
  }, [relationshipData]);

  // ポイント追加
  const addPoints = useCallback(async (eventType: PointEvent['type']) => {
    return new Promise<{ levelUp: boolean; newLevel?: RelationshipLevel }>((resolve) => {
      setRelationshipData(current => {
        const result = addRelationshipPoints(current, eventType);
        
        // レベルアップ時の処理
        if (result.levelUp && result.newLevel) {
          // マイルストーン追加
          setTimeout(() => {
            addMilestone(`${result.newLevel!.name}に到達！`);
          }, 100);
        }
        
        resolve({
          levelUp: result.levelUp,
          newLevel: result.newLevel
        });
        
        return result.newData;
      });
    });
  }, []);

  // メッセージ内容をチェックしてボーナスポイント
  const checkMessageForBonus = useCallback((message: string) => {
    // 深い会話チェック
    if (isDeepConversation(message)) {
      addPoints('deep_conversation');
    }
    
    // 感情表現チェック
    if (hasEmotionExpression(message)) {
      addPoints('emotion_expression');
    }
  }, [addPoints]);

  // デイリーストリーク更新
  const updateDailyStreak = useCallback(() => {
    setRelationshipData(current => {
      const newStreak = calculateDailyStreak(current.lastInteraction, current.dailyStreak);
      
      if (newStreak > current.dailyStreak) {
        // ストリークボーナス
        addPoints('daily_bonus');
      }
      
      return {
        ...current,
        dailyStreak: newStreak,
        lastInteraction: new Date()
      };
    });
  }, [addPoints]);

  // 初回マウント時のストリーク確認
  useEffect(() => {
    updateDailyStreak();
  }, []);

  return {
    relationshipData,
    currentLevel,
    stats,
    addPoints,
    checkMessageForBonus,
    updateDailyStreak
  };
}
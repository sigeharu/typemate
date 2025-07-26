// 🎵 TypeMate Phase 1: 記憶管理システム
// 基本記憶保存・取得とSupabase統合

import { supabase } from './supabase-simple';
import type { Database } from '@/types/database';
import { type EmotionData as EmotionAnalysisData } from './emotion-analyzer';

type MemoryRow = Database['public']['Tables']['typemate_memory']['Row'];
type MemoryInsert = Database['public']['Tables']['typemate_memory']['Insert'];

// 🎵 Phase 2: 感情分析データ構造
export interface EmotionData {
  emotion: string;
  intensity: number; // 1-10スケール
  isSpecialMoment: boolean; // 8点以上で特別記憶
  category: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

// Phase 1: 基本記憶データ構造（Phase 2: 感情データ追加）
export interface BasicMemory {
  id: string;
  userId?: string;
  archetype: string;
  relationshipLevel: number;
  userName?: string;
  messageContent?: string;
  messageRole?: 'user' | 'ai';
  conversationId?: string;
  createdAt: string;
  // 🎵 Phase 2: 感情データ追加
  emotionData?: EmotionData;
}

// Phase 1: 短期記憶コレクション（直近10件）
export interface ShortTermMemory {
  memories: BasicMemory[];
  totalCount: number;
  lastUpdated: string;
}

// Phase 1: 段階的情報収集状態
export interface MemoryProgressState {
  hasUserName: boolean;
  relationshipLevel: number;
  conversationCount: number;
  lastInteraction: string;
}

export class MemoryManager {
  private static instance: MemoryManager;
  
  private constructor() {}
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Phase 1: 基本記憶保存（認証ユーザー必須）
  async saveMemory(memory: Omit<MemoryInsert, 'id' | 'created_at'>, userId: string): Promise<BasicMemory | null> {
    if (!userId) {
      console.error('❌ Memory save failed: userId is required for authenticated users');
      return null;
    }

    try {
      console.log('🎵 Attempting to save memory:', {
        userId,
        archetype: memory.archetype,
        role: memory.message_role,
        hasContent: !!memory.message_content,
        conversationId: memory.conversation_id
      });

      const { data, error } = await supabase
        .from('typemate_memory')
        .insert({
          ...memory,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Memory save error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId
        });
        return null;
      }

      console.log('✅ Memory saved successfully:', data.id);
      return this.transformRowToMemory(data);
    } catch (error) {
      console.error('💥 Memory save exception:', error);
      return null;
    }
  }

  // Phase 1: 短期記憶取得（認証ユーザー必須）
  async getShortTermMemory(userId: string, conversationId?: string): Promise<ShortTermMemory> {
    if (!userId) {
      console.error('❌ Memory fetch failed: userId is required for authenticated users');
      return { memories: [], totalCount: 0, lastUpdated: new Date().toISOString() };
    }

    try {
      console.log('🎵 Loading short-term memory:', { userId, conversationId });
      
      let query = supabase
        .from('typemate_memory')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Short-term memory fetch error:', error);
        return { memories: [], totalCount: 0, lastUpdated: new Date().toISOString() };
      }

      const memories = data?.map(row => this.transformRowToMemory(row)) || [];
      console.log('✅ Loaded memories:', memories.length, 'items');

      return {
        memories,
        totalCount: memories.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Short-term memory fetch exception:', error);
      return { memories: [], totalCount: 0, lastUpdated: new Date().toISOString() };
    }
  }

  // Phase 1: 段階的情報収集状態チェック（認証ユーザー必須）
  async getMemoryProgress(userId: string): Promise<MemoryProgressState> {
    if (!userId) {
      console.error('❌ Memory progress fetch failed: userId is required');
      return {
        hasUserName: false,
        relationshipLevel: 1,
        conversationCount: 0,
        lastInteraction: new Date().toISOString()
      };
    }

    try {
      const { data, error } = await supabase
        .from('typemate_memory')
        .select('user_name, relationship_level, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Memory progress fetch error:', error);
        return {
          hasUserName: false,
          relationshipLevel: 1,
          conversationCount: 0,
          lastInteraction: new Date().toISOString()
        };
      }

      const memories = data || [];
      const hasName = memories.some(m => m.user_name);
      const maxLevel = Math.max(...memories.map(m => m.relationship_level || 1), 1);
      const lastInteraction = memories[0]?.created_at || new Date().toISOString();

      return {
        hasUserName: hasName,
        relationshipLevel: maxLevel,
        conversationCount: memories.length,
        lastInteraction
      };
    } catch (error) {
      console.error('Memory progress fetch exception:', error);
      return {
        hasUserName: false,
        relationshipLevel: 1,
        conversationCount: 0,
        lastInteraction: new Date().toISOString()
      };
    }
  }

  // Phase 1: ユーザー名更新（認証ユーザー必須）
  async updateUserName(userId: string, userName: string): Promise<boolean> {
    if (!userId) {
      console.error('❌ User name update failed: userId is required');
      return false;
    }

    try {
      console.log('🎵 Updating user name:', { userId, userName });
      
      const { error } = await supabase
        .from('typemate_memory')
        .update({ user_name: userName })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ User name update error:', error);
        return false;
      }

      console.log('✅ User name updated successfully');
      return true;
    } catch (error) {
      console.error('💥 User name update exception:', error);
      return false;
    }
  }

  // Phase 1: 関係性レベル更新（認証ユーザー必須）
  async updateRelationshipLevel(userId: string, level: number): Promise<boolean> {
    if (!userId) {
      console.error('❌ Relationship level update failed: userId is required');
      return false;
    }

    try {
      console.log('🎵 Updating relationship level:', { userId, level });
      
      const { error } = await supabase
        .from('typemate_memory')
        .update({ relationship_level: level })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Relationship level update error:', error);
        return false;
      }

      console.log('✅ Relationship level updated successfully');
      return true;
    } catch (error) {
      console.error('💥 Relationship level update exception:', error);
      return false;
    }
  }

  // 🎵 Phase 2: 感情データ付き会話記憶保存（チャット統合用・認証ユーザー必須）
  async saveConversationMemory(
    messageContent: string,
    messageRole: 'user' | 'ai',
    archetype: string,
    conversationId: string,
    userId: string,
    userName?: string,
    emotionData?: EmotionData
  ): Promise<BasicMemory | null> {
    const memory = await this.saveMemory({
      archetype,
      relationship_level: 1,
      user_name: userName,
      message_content: messageContent,
      message_role: messageRole,
      conversation_id: conversationId
    }, userId);

    // Phase 2: 感情データを結果に追加
    if (memory && emotionData) {
      memory.emotionData = emotionData;
      console.log('🎵 Emotion data attached:', {
        emotion: emotionData.emotion,
        intensity: emotionData.intensity,
        isSpecial: emotionData.isSpecialMoment
      });
    }

    return memory;
  }

  // Phase 1: データ変換ヘルパー
  private transformRowToMemory(row: MemoryRow): BasicMemory {
    return {
      id: row.id,
      userId: row.user_id || undefined,
      archetype: row.archetype,
      relationshipLevel: row.relationship_level,
      userName: row.user_name || undefined,
      messageContent: row.message_content || undefined,
      messageRole: row.message_role || undefined,
      conversationId: row.conversation_id || undefined,
      createdAt: row.created_at
    };
  }

  // 🎵 Phase 2: 感情データ保存
  async saveEmotionData(messageId: string, emotionData: EmotionAnalysisData): Promise<boolean> {
    try {
      console.log('🎵 Saving emotion data for message:', messageId, {
        emotion: emotionData.dominantEmotion,
        intensity: emotionData.intensity,
        musicTone: emotionData.musicTone
      });

      // この実装では感情データをコンソールログに出力（将来的にはテーブル保存）
      // 実際のテーブル実装はPhase 3で行う予定
      console.log('✅ Emotion data logged successfully');
      return true;
    } catch (error) {
      console.error('Emotion data save exception:', error);
      return false;
    }
  }

  // 🎵 Phase 2: 特別記憶作成
  async createSpecialMemory(
    content: string, 
    emotionData: EmotionAnalysisData, 
    archetype: string, 
    userId?: string
  ): Promise<boolean> {
    try {
      const emotionScore = Math.round(emotionData.intensity * 10);
      const category = this.categorizeEmotion(emotionData.dominantEmotion);
      
      console.log('✨ Creating special memory:', {
        userId,
        content: content.substring(0, 50) + '...',
        emotionScore,
        category,
        archetype,
        isHighlight: emotionScore >= 7
      });

      // この実装では特別記憶をコンソールログに出力（将来的にはテーブル保存）
      // 実際のテーブル実装はPhase 3で行う予定
      console.log('✨ Special memory created! Score:', emotionScore);
      return true;
    } catch (error) {
      console.error('Special memory exception:', error);
      return false;
    }
  }

  // 🎵 Phase 2: 感情カテゴリ分類ヘルパー
  private categorizeEmotion(dominantEmotion: string): string {
    const categoryMap = {
      'happiness': 'emotion',
      'excitement': 'special',
      'affection': 'confession',
      'gratitude': 'support',
      'sadness': 'support',
      'confusion': 'growth',
      'frustration': 'support',
      'curiosity': 'growth'
    };
    return categoryMap[dominantEmotion] || 'emotion';
  }

  // 🎵 Phase 2: キーワード抽出ヘルパー
  private extractKeywords(content: string): string[] {
    const keywords = [];
    const emotionWords = ['嬉しい', '楽しい', '悲しい', '好き', '大切', '感謝', 'ありがとう', 'すごい', 'やばい'];
    
    emotionWords.forEach(word => {
      if (content.includes(word)) keywords.push(word);
    });
    
    return keywords;
  }
}

// Phase 1: シングルトンインスタンス
export const memoryManager = MemoryManager.getInstance();
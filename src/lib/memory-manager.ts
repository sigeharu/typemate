// 🎵 TypeMate Phase 1: 記憶管理システム
// 基本記憶保存・取得とSupabase統合

import { supabase } from './supabase-simple';
import type { Database } from '@/types/database';

type MemoryRow = Database['public']['Tables']['typemate_memory']['Row'];
type MemoryInsert = Database['public']['Tables']['typemate_memory']['Insert'];

// Phase 1: 基本記憶データ構造
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

  // Phase 1: 基本記憶保存
  async saveMemory(memory: Omit<MemoryInsert, 'id' | 'created_at'>, userId?: string): Promise<BasicMemory | null> {
    try {
      console.log('🎵 Attempting to save memory:', {
        userId: userId || 'guest',
        archetype: memory.archetype,
        role: memory.message_role,
        hasContent: !!memory.message_content,
        conversationId: memory.conversation_id
      });

      const { data, error } = await supabase
        .from('typemate_memory')
        .insert({
          ...memory,
          user_id: userId || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Memory save error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: userId || 'guest'
        });
        
        // RLSエラーの詳細ログ
        if (error.code === '42501') {
          console.error('🔒 RLS Policy violation - user_id:', userId || 'null', 
            '- This likely means guest users are blocked by RLS policies');
        }
        
        return null;
      }

      console.log('✅ Memory saved successfully:', data.id);
      return this.transformRowToMemory(data);
    } catch (error) {
      console.error('💥 Memory save exception:', error);
      return null;
    }
  }

  // Phase 1: 短期記憶取得（直近10件）
  async getShortTermMemory(userId?: string, conversationId?: string): Promise<ShortTermMemory> {
    try {
      console.log('🎵 Loading short-term memory:', { userId: userId || 'guest', conversationId });
      
      let query = supabase
        .from('typemate_memory')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // ゲストユーザーとログインユーザーで条件分岐
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

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

  // Phase 1: 段階的情報収集状態チェック
  async getMemoryProgress(userId?: string): Promise<MemoryProgressState> {
    try {
      const { data, error } = await supabase
        .from('typemate_memory')
        .select('user_name, relationship_level, created_at')
        .eq('user_id', userId || 'anonymous')
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

  // Phase 1: ユーザー名更新
  async updateUserName(userId: string, userName: string): Promise<boolean> {
    try {
      console.log('🎵 Updating user name:', { userId: userId || 'guest', userName });
      
      let query = supabase
        .from('typemate_memory')
        .update({ user_name: userName });
      
      // ゲストユーザーの場合はuser_idがnullのレコードを更新
      if (!userId) {
        query = query.is('user_id', null);
      } else {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

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

  // Phase 1: 関係性レベル更新
  async updateRelationshipLevel(userId: string, level: number): Promise<boolean> {
    try {
      console.log('🎵 Updating relationship level:', { userId: userId || 'guest', level });
      
      let query = supabase
        .from('typemate_memory')
        .update({ relationship_level: level });
      
      // ゲストユーザーの場合はuser_idがnullのレコードを更新
      if (!userId) {
        query = query.is('user_id', null);
      } else {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

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

  // Phase 1: 会話記憶保存（チャット統合用）
  async saveConversationMemory(
    messageContent: string,
    messageRole: 'user' | 'ai',
    archetype: string,
    conversationId: string,
    userId?: string,
    userName?: string
  ): Promise<BasicMemory | null> {
    return this.saveMemory({
      archetype,
      relationship_level: 1,
      user_name: userName,
      message_content: messageContent,
      message_role: messageRole,
      conversation_id: conversationId
    }, userId);
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
}

// Phase 1: シングルトンインスタンス
export const memoryManager = MemoryManager.getInstance();
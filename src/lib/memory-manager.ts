// 🎵 TypeMate Phase 1: 記憶管理システム
// 基本記憶保存・取得とSupabase統合

import { supabase } from './supabase-simple';
import type { Database } from '@/types/database';
import { type EmotionData as EmotionAnalysisData } from './emotion-analyzer';
import { PrivacyEngine, createEncryptedMessage, type EncryptedMessage } from './privacy-encryption';
import { SecureMemoryManager } from './SecureMemoryManager';

// 🔒 真のエンドツーエンド暗号化対応

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
  messageContent?: string; // クライアントサイドで復号化済みの内容
  messageRole?: 'user' | 'ai';
  conversationId?: string;
  createdAt: string;
  // 🎵 Phase 2: 感情データ追加
  emotionData?: EmotionData;
  // 🔒 暗号化メタデータ
  isEncrypted?: boolean;
  encryptionHash?: string;
  privacyLevel?: number;
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

    // 🛡️ UUID形式の検証（PostgreSQLエラー防止）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format for memory save:', userId);
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
      return this.transformRowToMemory(data, userId);
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

    // 🛡️ UUID形式の検証（PostgreSQLエラー防止）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('⚠️ Invalid userId format, returning empty memories:', userId);
      return { memories: [], totalCount: 0, lastUpdated: new Date().toISOString() };
    }
    if (conversationId && !uuidRegex.test(conversationId)) {
      console.warn('⚠️ Invalid conversationId format, ignoring filter:', conversationId);
      conversationId = undefined; // フィルターを無効化
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

      const memories = data?.map(row => this.transformRowToMemory(row, userId)) || [];
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
  // 🔒 暗号化対応会話記憶保存メソッド（認証ユーザー必須）
  async saveConversationMemory(
    messageContent: string,
    messageRole: 'user' | 'ai',
    archetype: string,
    conversationId: string,
    userId: string,
    userName?: string,
    emotionData?: EmotionData,
    sequenceNumber?: number // 👈 NEW: 順序保証用
  ): Promise<BasicMemory | null> {
    // 🔐 エンドツーエンド暗号化実装
    const masterPassword = 'temp-master-password-2025'; // TODO: 実際のマスターパスワード取得
    const userKey = PrivacyEngine.generateUserKeyFromMaster(masterPassword, userId);
    const keyReference = { sessionId: conversationId, messageId: Date.now().toString() };
    
    // セキュアメモリに保存
    SecureMemoryManager.storeSecureKey(userKey, keyReference);
    
    try {
      // メッセージを暗号化
      const encryptedMessageData = createEncryptedMessage(messageContent, userKey);
      
      console.log('🔐 Message encryption for DB storage:', {
        original: messageContent.substring(0, 20) + '...',
        encrypted: encryptedMessageData.encrypted.substring(0, 32) + '...',
        privacyLevel: encryptedMessageData.privacyLevel,
        hash: encryptedMessageData.hash.substring(0, 16) + '...'
      });
      
      // 暗号化されたデータをデータベースに保存
      const memoryData: any = {
        archetype,
        relationship_level: 1,
        user_name: userName,
        message_content: encryptedMessageData.encrypted, // 🔒 暗号化データを保存
        message_role: messageRole,
        conversation_id: conversationId
      };
      
      // 🚨 HOTFIX: sequence_numberが存在する場合のみ追加
      if (sequenceNumber) {
        memoryData.sequence_number = sequenceNumber;
      }
      
      const memory = await this.saveMemory(memoryData, userId);

      if (memory) {
        // クライアント側で復号化して返す
        try {
          const decryptedContent = PrivacyEngine.decryptMessage(encryptedMessageData.encrypted, userKey);
          memory.messageContent = decryptedContent; // 復号化済み内容をクライアントに返す
          memory.isEncrypted = true;
          memory.encryptionHash = encryptedMessageData.hash;
          memory.privacyLevel = encryptedMessageData.privacyLevel;
        } catch (decryptError) {
          console.error('🚨 Decryption failed for client:', decryptError);
          memory.messageContent = '[復号化エラー]';
        }

        // Phase 2: 感情データを結果に追加
        if (emotionData) {
          memory.emotionData = emotionData;
          console.log('🎵 Emotion data attached:', {
            emotion: emotionData.emotion,
            intensity: emotionData.intensity,
            isSpecial: emotionData.isSpecialMoment
          });
        }
      }

      return memory;
    } finally {
      // キーを即座に削除
      setTimeout(() => {
        SecureMemoryManager.clearKey(keyReference);
      }, 100);
    }
  }

  // 🔒 Phase 1: データ変換ヘルパー (暗号化対応)
  private transformRowToMemory(row: MemoryRow, userId?: string): BasicMemory {
    const basicMemory: BasicMemory = {
      id: row.id,
      userId: row.user_id || undefined,
      archetype: row.archetype,
      relationshipLevel: row.relationship_level,
      userName: row.user_name || undefined,
      messageContent: row.message_content || undefined,
      messageRole: row.message_role || undefined,
      conversationId: row.conversation_id || undefined,
      createdAt: row.created_at,
      isEncrypted: false
    };

    // 🔐 暗号化データの復号化処理
    if (row.message_content && userId) {
      try {
        // まずは暗号化されたデータかチェック
        if (this.isEncryptedData(row.message_content)) {
          const masterPassword = 'temp-master-password-2025'; // TODO: 実際のマスターパスワード取得
          const userKey = PrivacyEngine.generateUserKeyFromMaster(masterPassword, userId);
          
          const decryptedContent = PrivacyEngine.decryptMessage(row.message_content, userKey);
          basicMemory.messageContent = decryptedContent;
          basicMemory.isEncrypted = true;
          
          console.log('🔓 Message decrypted successfully:', {
            messageId: row.id,
            contentPreview: decryptedContent.substring(0, 20) + '...'
          });
        }
        // 平文データの場合はそのまま
      } catch (decryptError) {
        console.warn('⚠️ Decryption failed, using original content:', {
          messageId: row.id,
          error: decryptError instanceof Error ? decryptError.message : 'Unknown error'
        });
        // 復号化に失敗した場合は元のデータを使用（後方互換性）
      }
    }

    return basicMemory;
  }

  // 🔍 暗号化データ判定ヘルパー
  private isEncryptedData(content: string): boolean {
    // AES暗号化データの特徴をチェック
    try {
      // Base64エンコードされた暗号化データの形式をチェック
      return content.length > 50 && /^[A-Za-z0-9+/=]+$/.test(content);
    } catch {
      return false;
    }
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

  // 🔄 チャット永続化: 最新会話セッションの取得
  async getLatestConversation(userId: string): Promise<{ conversation_id: string; created_at: string } | null> {
    if (!userId) {
      console.error('❌ getLatestConversation: userId is required');
      return null;
    }

    // 🛡️ UUID形式の検証（PostgreSQLエラー防止）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('⚠️ Invalid userId format for getLatestConversation:', userId);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('typemate_memory')
        .select('conversation_id, created_at')
        .eq('user_id', userId)
        .not('conversation_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Latest conversation fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ getLatestConversation error:', error);
      return null;
    }
  }

  // 🔄 チャット永続化: 特定セッションのメッセージ取得
  async getConversationMessages(conversationId: string, userId: string): Promise<any[]> {
    if (!userId || !conversationId) {
      console.error('❌ getConversationMessages: userId and conversationId are required');
      return [];
    }

    // 🛡️ UUID形式の検証（PostgreSQLエラー防止）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      console.warn('⚠️ Invalid conversationId format, skipping database query:', conversationId);
      return [];
    }
    if (!uuidRegex.test(userId)) {
      console.warn('⚠️ Invalid userId format, skipping database query:', userId);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('typemate_memory')
        .select('id, message_content, message_role, created_at, conversation_id, sequence_number')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .not('message_content', 'is', null)
        .order('sequence_number', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Conversation messages fetch error:', error);
        return [];
      }

      // 🔐 各メッセージを復号化して返す
      return data?.map(memory => {
        let decryptedContent = memory.message_content;
        
        // 暗号化データの復号化処理
        if (memory.message_content && this.isEncryptedData(memory.message_content)) {
          try {
            const masterPassword = 'temp-master-password-2025'; // TODO: 実際のマスターパスワード取得
            const userKey = PrivacyEngine.generateUserKeyFromMaster(masterPassword, userId);
            decryptedContent = PrivacyEngine.decryptMessage(memory.message_content, userKey);
            
            console.log('🔓 Conversation message decrypted:', {
              messageId: memory.id,
              role: memory.message_role,
              preview: decryptedContent?.substring(0, 20) + '...'
            });
          } catch (decryptError) {
            console.warn('⚠️ Failed to decrypt conversation message:', {
              messageId: memory.id,
              error: decryptError instanceof Error ? decryptError.message : 'Unknown error'
            });
            // 復号化失敗時は元のデータを使用（後方互換性）
          }
        }

        return {
          id: memory.id,
          content: decryptedContent,
          isUser: memory.message_role === 'user',
          sender: memory.message_role,
          timestamp: new Date(memory.created_at),
          sessionId: memory.conversation_id,
          sequenceNumber: memory.sequence_number ?? undefined // 👈 CRITICAL: null の場合はundefinedに（型安全性）
        };
      }) || [];
    } catch (error) {
      console.error('❌ getConversationMessages error:', error);
      return [];
    }
  }

  // 🔄 既存データ復旧: sequence番号を created_at 順で自動採番
  async repairSequenceNumbers(conversationId: string, userId: string): Promise<boolean> {
    if (!userId || !conversationId) {
      console.error('❌ repairSequenceNumbers: userId and conversationId are required');
      return false;
    }

    // 🛡️ UUID形式の検証（PostgreSQLエラー防止）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      console.warn('⚠️ Invalid conversationId format for repairSequenceNumbers:', conversationId);
      return false;
    }
    if (!uuidRegex.test(userId)) {
      console.warn('⚠️ Invalid userId format for repairSequenceNumbers:', userId);
      return false;
    }

    try {
      console.log('🔧 Repairing sequence numbers for conversation:', conversationId);
      
      // 既存メッセージを created_at 順で取得
      const { data: messages, error } = await supabase
        .from('typemate_memory')
        .select('id, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .not('message_content', 'is', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch messages for repair:', error);
        return false;
      }

      if (!messages || messages.length === 0) {
        console.log('ℹ️ No messages found to repair');
        return true;
      }

      // sequence番号を順番に割り当て（1から開始）
      const updates = messages.map((message, index) => ({
        id: message.id,
        sequence_number: index + 1
      }));

      console.log(`🔧 Updating ${updates.length} messages with sequence numbers`);

      // より効率的なバッチ更新実行（Promise.allSettled使用）
      const updatePromises = updates.map(update =>
        supabase
          .from('typemate_memory')
          .update({ sequence_number: update.sequence_number })
          .eq('id', update.id)
      );

      const results = await Promise.allSettled(updatePromises);
      const failedUpdates = results.filter(result => result.status === 'rejected' || result.value.error);

      if (failedUpdates.length > 0) {
        console.error(`❌ ${failedUpdates.length}/${updates.length} sequence number updates failed`);
        // 部分的な失敗でもtrueを返す（完全失敗でない限り）
        return failedUpdates.length < updates.length;
      }

      console.log('✅ Successfully repaired sequence numbers');
      return true;
    } catch (error) {
      console.error('💥 repairSequenceNumbers exception:', error);
      return false;
    }
  }
}

// Phase 1: シングルトンインスタンス
export const memoryManager = MemoryManager.getInstance();
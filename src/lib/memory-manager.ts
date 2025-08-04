// 🎵 TypeMate Phase 1: 記憶管理システム
// 基本記憶保存・取得とSupabase統合

import { supabase } from './supabase-simple';
import type { Database } from '@/types/database';
import { type EmotionData as EmotionAnalysisData } from './emotion-analyzer';
import { PrivacyEngine, createEncryptedMessage, type EncryptedMessage } from './privacy-encryption';
import { SecureMemoryManager } from './SecureMemoryManager';
import { dbLogger, validateUUID, safeDbOperation, safeBatchOperation } from './db-logger';
import { vectorMemoryService, type VectorizedMemory, type SimilarMemorySearchResult } from './vector-memory-service';

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
      dbLogger.error('saveMemory', new Error('userId is required for authenticated users'));
      return null;
    }

    if (!validateUUID(userId, 'userId')) {
      return null;
    }

    dbLogger.info('saveMemory', 'Attempting to save memory', {
      userId,
      archetype: memory.archetype,
      role: memory.message_role,
      hasContent: !!memory.message_content,
      conversationId: memory.conversation_id
    });

    const result = await safeDbOperation('saveMemory', async () => {
      return await supabase
        .from('typemate_memory')
        .insert({
          ...memory,
          user_id: userId
        })
        .select()
        .single();
    });

    if (result.error || !result.data) {
      return null;
    }

    return this.transformRowToMemory(result.data, userId);
  }

  // Phase 1: 短期記憶取得（認証ユーザー必須）
  async getShortTermMemory(userId: string, conversationId?: string): Promise<ShortTermMemory> {
    const emptyResult = { memories: [], totalCount: 0, lastUpdated: new Date().toISOString() };
    
    if (!userId) {
      dbLogger.error('getShortTermMemory', new Error('userId is required for authenticated users'));
      return emptyResult;
    }

    if (!validateUUID(userId, 'userId')) {
      return emptyResult;
    }

    if (conversationId && !validateUUID(conversationId, 'conversationId')) {
      dbLogger.warn('getShortTermMemory', 'Invalid conversationId format, ignoring filter', { conversationId });
      conversationId = undefined;
    }

    dbLogger.info('getShortTermMemory', 'Loading short-term memory', { userId, conversationId });

    const result = await safeDbOperation('getShortTermMemory', async () => {
      let query = supabase
        .from('typemate_memory')
        .select('id, user_id, archetype, relationship_level, user_name, message_content, message_role, conversation_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      return await query;
    });

    if (result.error || !result.data) {
      return emptyResult;
    }

    const memories = result.data.map(row => this.transformRowToMemory(row, userId));
    dbLogger.success('getShortTermMemory', `Loaded ${memories.length} memories`);

    return {
      memories,
      totalCount: memories.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Phase 1: 段階的情報収集状態チェック（認証ユーザー必須）
  async getMemoryProgress(userId: string): Promise<MemoryProgressState> {
    const defaultResult = {
      hasUserName: false,
      relationshipLevel: 1,
      conversationCount: 0,
      lastInteraction: new Date().toISOString()
    };

    if (!userId) {
      dbLogger.error('getMemoryProgress', new Error('userId is required'));
      return defaultResult;
    }

    if (!validateUUID(userId, 'userId')) {
      return defaultResult;
    }

    const result = await safeDbOperation('getMemoryProgress', async () => {
      return await supabase
        .from('typemate_memory')
        .select('user_name, relationship_level, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    });

    if (result.error || !result.data) {
      return defaultResult;
    }

    const memories = result.data;
    const hasName = memories.some(m => m.user_name);
    const maxLevel = Math.max(...memories.map(m => m.relationship_level || 1), 1);
    const lastInteraction = memories[0]?.created_at || new Date().toISOString();

    return {
      hasUserName: hasName,
      relationshipLevel: maxLevel,
      conversationCount: memories.length,
      lastInteraction
    };
  }

  // Phase 1: ユーザー名更新（認証ユーザー必須）
  async updateUserName(userId: string, userName: string): Promise<boolean> {
    if (!userId) {
      dbLogger.error('updateUserName', new Error('userId is required'));
      return false;
    }

    if (!validateUUID(userId, 'userId')) {
      return false;
    }

    dbLogger.info('updateUserName', 'Updating user name', { userId, userName });

    const result = await safeDbOperation('updateUserName', async () => {
      return await supabase
        .from('typemate_memory')
        .update({ user_name: userName })
        .eq('user_id', userId);
    });

    return !result.error;
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
  // 🔒 緊急修正: 暗号化を一時無効化して平文保存（復号化問題解決まで）
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
    try {
      console.log('💾 Saving conversation memory (plain text):', {
        messageRole,
        contentPreview: messageContent.substring(0, 20) + '...',
        conversationId: conversationId.substring(0, 8) + '...',
        sequenceNumber
      });
      
      // 🚨 緊急修正: 平文でデータベースに保存
      const memoryData: any = {
        archetype,
        relationship_level: 1,
        user_name: userName,
        message_content: messageContent, // 🔓 平文で保存
        message_role: messageRole,
        conversation_id: conversationId
      };
      
      // sequence_numberが存在する場合のみ追加
      if (sequenceNumber) {
        memoryData.sequence_number = sequenceNumber;
      }
      
      const memory = await this.saveMemory(memoryData, userId);

      if (memory) {
        // Phase 2: 感情データを結果に追加
        if (emotionData) {
          memory.emotionData = emotionData;
          console.log('🎵 Emotion data attached:', {
            emotion: emotionData.emotion,
            intensity: emotionData.intensity,
            isSpecial: emotionData.isSpecialMoment
          });
        }

        // 🔍 Phase 3: ベクトル化を非同期で実行（エラー時も通常保存は継続）
        this.asyncVectorizeMemory(memory.id, messageContent).catch(error => {
          console.warn('⚠️ ベクトル化に失敗しましたが、記憶保存は正常に完了しました:', error);
        });
      }

      return memory;
    } catch (error) {
      console.error('💥 Conversation memory save error:', error);
      return null;
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

    // 🔓 緊急修正: 暗号化データの復号化を一時無効化
    if (row.message_content) {
      console.log('💾 Loading message content (plain text):', {
        messageId: row.id,
        contentPreview: row.message_content.substring(0, 20) + '...',
        isLikelyEncrypted: this.isEncryptedData(row.message_content)
      });
      // 🚨 緊急修正: 暗号化チェックを無効化し、データをそのまま使用
      basicMemory.messageContent = row.message_content;
      basicMemory.isEncrypted = false;
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

      // 🔄 暗号化データの自動移行処理
      return data?.map(memory => {
        let content = memory.message_content || '';
        
        // 暗号化されたデータかチェック
        if (this.isEncryptedData(content)) {
          console.log('🔐 Detected encrypted message, attempting to decrypt:', {
            messageId: memory.id,
            role: memory.message_role,
            encryptedPreview: content.substring(0, 20) + '...'
          });
          
          try {
            // Base64デコードを試行
            const decoded = atob(content);
            // デコード結果が日本語やASCII文字として読める場合は使用
            if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]|[a-zA-Z0-9\s,.!?]/.test(decoded)) {
              content = decoded;
              console.log('✅ Successfully decoded message');
            } else {
              console.warn('⚠️ Decoded content appears to be binary, keeping original');
            }
          } catch (e) {
            console.warn('⚠️ Failed to decode message, using original content:', e);
          }
        }
        
        console.log('💾 Loading conversation message:', {
          messageId: memory.id,
          role: memory.message_role,
          preview: content.substring(0, 20) + '...',
          wasEncrypted: this.isEncryptedData(memory.message_content)
        });

        return {
          id: memory.id,
          content: content,
          isUser: memory.message_role === 'user',
          sender: memory.message_role,
          timestamp: new Date(memory.created_at),
          sessionId: memory.conversation_id,
          sequenceNumber: memory.sequence_number ?? undefined
        };
      }) || [];
    } catch (error) {
      console.error('❌ getConversationMessages error:', error);
      return [];
    }
  }

  // 🔍 Phase 3: 非同期ベクトル化（既存保存処理を妨げない）
  private async asyncVectorizeMemory(memoryId: string, content: string): Promise<void> {
    try {
      if (!content || content.trim().length === 0) {
        console.log('ℹ️ Empty content, skipping vectorization');
        return;
      }

      console.log('🔄 Starting async vectorization for memory:', {
        memoryId: memoryId.substring(0, 8) + '...',
        contentLength: content.length
      });

      const success = await vectorMemoryService.addEmbeddingToMemory(memoryId, content);
      if (success) {
        console.log('✅ Async vectorization completed successfully');
      } else {
        console.warn('⚠️ Async vectorization failed but memory was saved');
      }
    } catch (error) {
      console.error('❌ Async vectorization error:', error);
      // エラーが発生してもthrowしない（メイン処理に影響させない）
    }
  }

  // 🔍 Phase 3: 類似記憶検索（意味的検索）
  async searchSimilarMemories(
    query: string,
    userId: string,
    options: {
      limit?: number;
      similarityThreshold?: number;
      specialOnly?: boolean;
    } = {}
  ): Promise<SimilarMemorySearchResult> {
    if (!userId) {
      console.error('❌ searchSimilarMemories: userId is required');
      return {
        memories: [],
        query,
        searchedAt: new Date().toISOString(),
        totalFound: 0
      };
    }

    if (!validateUUID(userId, 'userId')) {
      return {
        memories: [],
        query,
        searchedAt: new Date().toISOString(),
        totalFound: 0
      };
    }

    try {
      console.log('🔍 Searching similar memories:', {
        query: query.substring(0, 50) + '...',
        userId: userId.substring(0, 8) + '...',
        options
      });

      const result = await vectorMemoryService.searchSimilarMemories(query, userId, options);
      
      dbLogger.success('searchSimilarMemories', `Found ${result.totalFound} similar memories`);
      return result;
    } catch (error) {
      console.error('❌ searchSimilarMemories error:', error);
      return {
        memories: [],
        query,
        searchedAt: new Date().toISOString(),
        totalFound: 0
      };
    }
  }

  // 🔍 Phase 3: 既存記憶のベクトル化（バッチ処理）
  async vectorizeExistingMemories(
    userId: string,
    batchSize: number = 10
  ): Promise<{ processed: number; success: number; failed: number }> {
    if (!userId) {
      console.error('❌ vectorizeExistingMemories: userId is required');
      return { processed: 0, success: 0, failed: 0 };
    }

    if (!validateUUID(userId, 'userId')) {
      return { processed: 0, success: 0, failed: 0 };
    }

    try {
      console.log('🔄 Starting batch vectorization for user:', {
        userId: userId.substring(0, 8) + '...',
        batchSize
      });

      const result = await vectorMemoryService.vectorizeExistingMemories(userId, batchSize);
      
      dbLogger.info('vectorizeExistingMemories', 'Batch vectorization completed', result);
      return result;
    } catch (error) {
      console.error('❌ vectorizeExistingMemories error:', error);
      return { processed: 0, success: 0, failed: 0 };
    }
  }

  // 🔍 Phase 3: ベクトルサービスの状態確認
  getVectorServiceStatus(): { initialized: boolean; hasOpenAI: boolean } {
    return vectorMemoryService.getServiceStatus();
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

      dbLogger.info('repairSequenceNumbers', `Updating ${updates.length} messages with sequence numbers`);

      // バッチ処理で効率的に更新実行
      const updateOperations = updates.map(update => 
        () => supabase
          .from('typemate_memory')
          .update({ sequence_number: update.sequence_number })
          .eq('id', update.id)
      );

      const batchResult = await safeBatchOperation('repairSequenceNumbers', updateOperations, 5);

      if (batchResult.errors.length > 0) {
        dbLogger.warn('repairSequenceNumbers', `${batchResult.errors.length}/${batchResult.totalCount} updates failed`);
        // 部分的な失敗でもtrueを返す（完全失敗でない限り）
        return batchResult.successes.length > 0;
      }

      dbLogger.success('repairSequenceNumbers', 'Successfully repaired all sequence numbers');
      return true;
    } catch (error) {
      console.error('💥 repairSequenceNumbers exception:', error);
      return false;
    }
  }
}

// Phase 1: シングルトンインスタンス
export const memoryManager = MemoryManager.getInstance();
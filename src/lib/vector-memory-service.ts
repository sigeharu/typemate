// 🎵 TypeMate ベクトル記憶サービス
// OpenAI Embeddings + pgvector統合による意味的記憶検索

import { OpenAI } from 'openai';
import { supabase } from './supabase-simple';
import { dbLogger, safeDbOperation } from './db-logger';

// ベクトル化された記憶の結果型
export interface VectorizedMemory {
  id: string;
  message_content: string;
  message_role: 'user' | 'ai';
  emotion_label?: string;
  similarity: number;
  created_at: string;
  conversation_id?: string;
  is_special_moment: boolean;
}

// 類似記憶検索結果型
export interface SimilarMemorySearchResult {
  memories: VectorizedMemory[];
  query: string;
  searchedAt: string;
  totalFound: number;
}

export class VectorMemoryService {
  private static instance: VectorMemoryService;
  private openai: OpenAI | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeOpenAI();
  }

  static getInstance(): VectorMemoryService {
    if (!VectorMemoryService.instance) {
      VectorMemoryService.instance = new VectorMemoryService();
    }
    return VectorMemoryService.instance;
  }

  private initializeOpenAI(): void {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('⚠️ OPENAI_API_KEY not found - vector search will be disabled');
        return;
      }

      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.isInitialized = true;
      console.log('✅ OpenAI initialized for vector memory service');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
      this.openai = null;
      this.isInitialized = false;
    }
  }

  // テキストをベクトル化（OpenAI embeddings）
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.isInitialized || !this.openai) {
      console.warn('⚠️ OpenAI not initialized - skipping embedding generation');
      return null;
    }

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided for embedding');
      return null;
    }

    try {
      // テキストを安全な長さに制限（8000文字 ≈ 8191トークン制限）
      const safeText = text.slice(0, 8000);
      
      console.log('🔄 Generating embedding for text:', {
        originalLength: text.length,
        safeLength: safeText.length,
        preview: safeText.substring(0, 50) + '...'
      });

      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small", // コスト効率最高、1536次元
        input: safeText,
      });

      const embedding = response.data[0]?.embedding;
      if (!embedding) {
        console.error('❌ No embedding returned from OpenAI');
        return null;
      }

      console.log('✅ Embedding generated successfully:', {
        dimensions: embedding.length,
        model: 'text-embedding-3-small'
      });

      return embedding;
    } catch (error: any) {
      // レート制限や一時的なエラーをログに記録するが、処理は継続
      console.error('❌ Embedding generation failed:', {
        error: error.message,
        type: error.type,
        code: error.code
      });
      return null;
    }
  }

  // 記憶にベクトル埋め込みを非同期で追加（既存保存処理を妨げない）
  async addEmbeddingToMemory(memoryId: string, content: string): Promise<boolean> {
    if (!memoryId || !content) {
      console.warn('⚠️ Invalid parameters for addEmbeddingToMemory');
      return false;
    }

    try {
      // 1. ベクトル生成
      const embedding = await this.generateEmbedding(content);
      if (!embedding) {
        console.warn('⚠️ Could not generate embedding, skipping vector save');
        return false;
      }

      // 2. PostgreSQL/Supabaseにベクトルを保存
      const result = await safeDbOperation('addEmbeddingToMemory', async () => {
        // pgvector形式に変換
        const vectorString = `[${embedding.join(',')}]`;
        
        return await supabase
          .from('typemate_memory')
          .update({
            embedding: vectorString,
            embedding_model: 'text-embedding-3-small',
            embedding_created_at: new Date().toISOString()
          })
          .eq('id', memoryId);
      });

      if (result.error) {
        console.error('❌ Failed to save embedding to database:', result.error);
        return false;
      }

      console.log('✅ Embedding saved successfully for memory:', memoryId);
      return true;
    } catch (error) {
      console.error('❌ addEmbeddingToMemory failed:', error);
      return false;
    }
  }

  // 類似記憶を検索（意味的検索）
  async searchSimilarMemories(
    query: string,
    userId: string,
    options: {
      limit?: number;
      similarityThreshold?: number;
      specialOnly?: boolean;
    } = {}
  ): Promise<SimilarMemorySearchResult> {
    const defaultResult: SimilarMemorySearchResult = {
      memories: [],
      query,
      searchedAt: new Date().toISOString(),
      totalFound: 0
    };

    if (!query || !userId) {
      console.warn('⚠️ Invalid parameters for searchSimilarMemories');
      return defaultResult;
    }

    try {
      // 1. クエリテキストをベクトル化
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) {
        console.warn('⚠️ Could not generate query embedding, returning empty results');
        return defaultResult;
      }

      // 2. PostgreSQL関数で類似検索実行
      const functionName = options.specialOnly ? 'search_special_memories' : 'search_similar_memories';
      const vectorString = `[${queryEmbedding.join(',')}]`;

      const result = await safeDbOperation('searchSimilarMemories', async () => {
        return await supabase.rpc(functionName, {
          query_embedding: vectorString,
          target_user_id: userId,
          match_count: options.limit || 5,
          similarity_threshold: options.similarityThreshold || 0.7
        });
      });

      if (result.error || !result.data) {
        console.error('❌ Vector search failed:', result.error);
        return defaultResult;
      }

      // 3. 結果をフォーマット
      const memories: VectorizedMemory[] = result.data.map((row: any) => ({
        id: row.id,
        message_content: row.message_content,
        message_role: row.message_role,
        emotion_label: row.emotion_label,
        similarity: Math.round(row.similarity * 100) / 100, // 小数点2桁に丸める
        created_at: row.created_at,
        conversation_id: row.conversation_id,
        is_special_moment: row.is_special_moment || false
      }));

      console.log('✅ Vector search completed:', {
        query: query.substring(0, 50) + '...',
        userId: userId.substring(0, 8) + '...',
        resultsFound: memories.length,
        specialOnly: options.specialOnly
      });

      return {
        memories,
        query,
        searchedAt: new Date().toISOString(),
        totalFound: memories.length
      };
    } catch (error) {
      console.error('❌ searchSimilarMemories failed:', error);
      return defaultResult;
    }
  }

  // バッチ処理で既存の記憶をベクトル化（マイグレーション用）
  async vectorizeExistingMemories(
    userId: string,
    batchSize: number = 10
  ): Promise<{ processed: number; success: number; failed: number }> {
    const stats = { processed: 0, success: 0, failed: 0 };

    if (!userId) {
      console.error('❌ userId required for vectorizeExistingMemories');
      return stats;
    }

    try {
      // ベクトル化されていない記憶を取得
      const { data: memories, error } = await supabase
        .from('typemate_memory')
        .select('id, message_content')
        .eq('user_id', userId)
        .is('embedding', null)
        .not('message_content', 'is', null)
        .limit(batchSize);

      if (error) {
        console.error('❌ Failed to fetch memories for vectorization:', error);
        return stats;
      }

      if (!memories || memories.length === 0) {
        console.log('ℹ️ No memories found for vectorization');
        return stats;
      }

      console.log(`🔄 Starting vectorization of ${memories.length} memories`);

      // 順次処理（レート制限対応）
      for (const memory of memories) {
        stats.processed++;
        
        try {
          const success = await this.addEmbeddingToMemory(memory.id, memory.message_content);
          if (success) {
            stats.success++;
          } else {
            stats.failed++;
          }

          // レート制限回避のため短い待機
          if (stats.processed % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Failed to vectorize memory ${memory.id}:`, error);
          stats.failed++;
        }
      }

      console.log('✅ Vectorization batch completed:', stats);
      return stats;
    } catch (error) {
      console.error('❌ vectorizeExistingMemories failed:', error);
      return stats;
    }
  }

  // サービスの状態確認
  getServiceStatus(): { initialized: boolean; hasOpenAI: boolean } {
    return {
      initialized: this.isInitialized,
      hasOpenAI: this.openai !== null
    };
  }
}

// シングルトンインスタンス
export const vectorMemoryService = VectorMemoryService.getInstance();
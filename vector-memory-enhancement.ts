// 🎵 TypeMate Vector Enhancement - 既存システム非破壊的拡張
// 目的: 既存のmemory-manager.tsにベクトル化機能を安全に追加

import { OpenAI } from 'openai';
import pgvector from 'pgvector';

// 🎯 MemoryManagerクラスに追加するメソッド群

export class VectorMemoryEnhancement {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }

  // 🌟 Phase 1: テキストのベクトル化（非破壊的）
  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      if (!text || text.trim().length === 0) {
        console.warn('⚠️ Empty text provided for embedding');
        return null;
      }

      // テキストを8000文字に制限（OpenAI制限対応）
      const truncatedText = text.slice(0, 8000);
      
      console.log('🧮 Generating embedding for text:', {
        originalLength: text.length,
        truncatedLength: truncatedText.length,
        preview: truncatedText.substring(0, 50) + '...'
      });

      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small", // 1536次元
        input: truncatedText,
      });

      console.log('✅ Embedding generated successfully:', {
        dimensions: response.data[0].embedding.length,
        usage: response.usage
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      // 🛡️ エラーでも正常な記憶保存は継続
      return null;
    }
  }

  // 🚀 Phase 2: 記憶データのベクトル化（非破壊的追加）
  async addEmbeddingToMemory(memoryId: string, messageContent: string): Promise<boolean> {
    try {
      console.log('💾 Adding embedding to memory:', memoryId);

      // ベクトル生成
      const embedding = await this.generateEmbedding(messageContent);
      if (!embedding) {
        console.warn('⚠️ Failed to generate embedding, skipping vector update');
        return false;
      }

      // データベース更新（既存レコードにembeddingカラムを追加）
      const { error } = await supabase
        .from('typemate_memory')
        .update({
          embedding: pgvector.toSql(embedding),
          embedding_model: 'text-embedding-3-small',
          embedding_created_at: new Date().toISOString()
        })
        .eq('id', memoryId);

      if (error) {
        console.error('❌ Failed to save embedding to database:', error);
        return false;
      }

      console.log('✅ Embedding added to memory successfully');
      return true;
    } catch (error) {
      console.error('💥 addEmbeddingToMemory exception:', error);
      return false;
    }
  }

  // 🔍 Phase 3: ベクトル検索（非破壊的新機能）
  async searchSimilarMemories(
    queryText: string,
    userId: string,
    options: {
      limit?: number;
      specialOnly?: boolean;
      minSimilarity?: number;
    } = {}
  ): Promise<any[]> {
    try {
      const { limit = 5, specialOnly = false, minSimilarity = 0.7 } = options;

      console.log('🔍 Searching similar memories:', {
        queryPreview: queryText.substring(0, 50) + '...',
        userId: userId.substring(0, 8) + '...',
        limit,
        specialOnly
      });

      // クエリテキストをベクトル化
      const queryEmbedding = await this.generateEmbedding(queryText);
      if (!queryEmbedding) {
        console.warn('⚠️ Failed to generate query embedding');
        return [];
      }

      // ベクトル検索実行
      const { data, error } = await supabase.rpc('search_memories', {
        query_embedding: pgvector.toSql(queryEmbedding),
        target_user_id: userId,
        match_count: limit,
        special_only: specialOnly
      });

      if (error) {
        console.error('❌ Vector search failed:', error);
        return [];
      }

      // 類似度フィルタリング
      const results = (data || []).filter((result: any) => 
        result.similarity >= minSimilarity
      );

      console.log('✅ Vector search completed:', {
        totalResults: data?.length || 0,
        filteredResults: results.length,
        topSimilarity: results[0]?.similarity || 0
      });

      return results;
    } catch (error) {
      console.error('💥 searchSimilarMemories exception:', error);
      return [];
    }
  }

  // 🔄 Phase 4: 既存データの段階的ベクトル化（バックグラウンド処理）
  async vectorizeExistingMemories(
    userId: string,
    batchSize: number = 5
  ): Promise<{ success: number; failed: number; total: number }> {
    try {
      console.log('🔄 Starting vectorization of existing memories for user:', userId);

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
        return { success: 0, failed: 0, total: 0 };
      }

      if (!memories || memories.length === 0) {
        console.log('ℹ️ No memories found for vectorization');
        return { success: 0, failed: 0, total: 0 };
      }

      console.log(`📊 Found ${memories.length} memories to vectorize`);

      let success = 0;
      let failed = 0;

      // バッチ処理で段階的にベクトル化
      for (const memory of memories) {
        try {
          const result = await this.addEmbeddingToMemory(
            memory.id,
            memory.message_content || ''
          );
          
          if (result) {
            success++;
          } else {
            failed++;
          }

          // API制限対策: 少し待機
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to vectorize memory ${memory.id}:`, error);
          failed++;
        }
      }

      console.log('📊 Vectorization batch completed:', {
        success,
        failed,
        total: memories.length
      });

      return { success, failed, total: memories.length };
    } catch (error) {
      console.error('💥 vectorizeExistingMemories exception:', error);
      return { success: 0, failed: 0, total: 0 };
    }
  }
}

// 🎵 使用例: 既存のMemoryManagerクラスとの統合方法

/*
// memory-manager.tsのMemoryManagerクラスに追加するメソッド:

export class MemoryManager {
  private vectorEnhancement = new VectorMemoryEnhancement();

  // 既存のsaveConversationMemoryメソッドを拡張
  async saveConversationMemory(
    messageContent: string,
    messageRole: 'user' | 'ai',
    archetype: string,
    conversationId: string,
    userId: string,
    userName?: string,
    emotionData?: EmotionData,
    sequenceNumber?: number
  ): Promise<BasicMemory | null> {
    // 既存の保存処理は変更なし
    const memory = await this.saveMemory(memoryData, userId);
    
    // 🌟 新機能: 非同期でベクトル化追加（エラーでも保存は成功）
    if (memory && messageContent) {
      // 非同期でベクトル化（await不要、失敗してもOK）
      this.vectorEnhancement.addEmbeddingToMemory(memory.id, messageContent)
        .catch(error => console.warn('⚠️ Vector enhancement failed:', error));
    }
    
    return memory;
  }

  // 🔍 新機能: メモリ検索強化
  async enhancedMemorySearch(query: string, userId: string) {
    return await this.vectorEnhancement.searchSimilarMemories(query, userId);
  }

  // 🔄 新機能: バックグラウンド改善
  async improveMemorySystem(userId: string) {
    return await this.vectorEnhancement.vectorizeExistingMemories(userId);
  }
}
*/
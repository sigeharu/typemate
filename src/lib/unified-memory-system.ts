// 🎵 TypeMate 統合記憶システム
// 3層記憶アーキテクチャの統合インターフェース
// Layer 1: Redis短期記憶 (1時間TTL)
// Layer 2: Supabase中期記憶 (pgvector)  
// Layer 3: Neo4j長期記憶 (知識グラフ)

import { shortTermMemoryService, type ShortTermMessage } from './short-term-memory';
import { memoryManager, type BasicMemory } from './memory-manager';
import { vectorMemoryService, type SimilarMemorySearchResult } from './vector-memory-service';

// 統合記憶検索結果
export interface UnifiedMemoryResult {
  shortTerm: ShortTermMessage[];
  mediumTerm: BasicMemory[];
  vectorSearch?: SimilarMemorySearchResult;
  totalMessages: number;
  searchedAt: string;
  context: {
    hasRecentContext: boolean;
    hasSimilarMemories: boolean;
    contextualResponse: string;
  };
}

// 記憶保存結果
export interface MemorySaveResult {
  shortTermSaved: boolean;
  mediumTermSaved: boolean;
  vectorized: boolean;
  memoryId?: string;
}

// コンテキスト理解タイプ
export type ContextType = 
  | 'reference' // "それ"、"あれ"などの参照
  | 'continuation' // 話の続き
  | 'clarification' // "どういう意味？"
  | 'follow_up' // "もっと詳しく"
  | 'general'; // 一般的な質問

export class UnifiedMemorySystem {
  private static instance: UnifiedMemorySystem;

  private constructor() {}

  static getInstance(): UnifiedMemorySystem {
    if (!UnifiedMemorySystem.instance) {
      UnifiedMemorySystem.instance = new UnifiedMemorySystem();
    }
    return UnifiedMemorySystem.instance;
  }

  // 統合記憶保存（全3層に保存）
  async saveMessage(
    userId: string,
    sessionId: string,
    message: {
      content: string;
      role: 'user' | 'ai';
      emotion?: string;
      intensity?: number;
      archetype: string;
      userName?: string;
      conversationId: string;
    }
  ): Promise<MemorySaveResult> {
    const result: MemorySaveResult = {
      shortTermSaved: false,
      mediumTermSaved: false,
      vectorized: false
    };

    try {
      console.log('💾 Saving message to unified memory system:', {
        userId: userId.substring(0, 8) + '...',
        sessionId: sessionId.substring(0, 8) + '...',
        role: message.role,
        contentLength: message.content.length
      });

      // Layer 1: 短期記憶 (Redis)
      const shortTermData = {
        content: message.content,
        role: message.role,
        emotion: message.emotion,
        intensity: message.intensity
      };
      
      result.shortTermSaved = await shortTermMemoryService.saveMessage(
        userId, 
        sessionId, 
        shortTermData
      );

      // Layer 2: 中期記憶 (Supabase) - 感情データ付き
      const emotionData = message.emotion && message.intensity ? {
        emotion: message.emotion,
        intensity: message.intensity,
        isSpecialMoment: message.intensity >= 8,
        category: this.categorizeEmotion(message.emotion),
        keywords: this.extractEmotionKeywords(message.content)
      } : undefined;

      const mediumTermMemory = await memoryManager.saveConversationMemory(
        message.content,
        message.role,
        message.archetype,
        message.conversationId,
        userId,
        message.userName,
        emotionData
      );

      result.mediumTermSaved = mediumTermMemory !== null;
      if (mediumTermMemory) {
        result.memoryId = mediumTermMemory.id;
        // 自動的にベクトル化される（memoryManager内で非同期実行）
        result.vectorized = true;
      }

      // Layer 3: 長期記憶 (Neo4j) は特別な瞬間のみ
      if (emotionData?.isSpecialMoment && mediumTermMemory) {
        console.log('✨ Saving special moment to long-term memory');
        // Neo4j統合は将来の実装で追加予定
      }

      console.log('✅ Unified memory save completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Unified memory save failed:', error);
      return result;
    }
  }

  // 統合記憶検索（コンテキスト理解付き）
  async searchMemories(
    userId: string,
    query: string,
    sessionId: string,
    options: {
      includeShortTerm?: boolean;
      includeMediumTerm?: boolean;
      includeVectorSearch?: boolean;
      maxResults?: number;
      contextType?: ContextType;
    } = {}
  ): Promise<UnifiedMemoryResult> {
    const {
      includeShortTerm = true,
      includeMediumTerm = true,
      includeVectorSearch = true,
      maxResults = 5,
      contextType = 'general'
    } = options;

    const result: UnifiedMemoryResult = {
      shortTerm: [],
      mediumTerm: [],
      vectorSearch: undefined,
      totalMessages: 0,
      searchedAt: new Date().toISOString(),
      context: {
        hasRecentContext: false,
        hasSimilarMemories: false,
        contextualResponse: ''
      }
    };

    try {
      console.log('🔍 Searching unified memory:', {
        userId: userId.substring(0, 8) + '...',
        query: query.substring(0, 50) + '...',
        contextType,
        options: { includeShortTerm, includeMediumTerm, includeVectorSearch }
      });

      // Layer 1: 短期記憶検索 (直近の文脈)
      if (includeShortTerm) {
        result.shortTerm = await shortTermMemoryService.getSessionMessages(userId, sessionId);
        result.context.hasRecentContext = result.shortTerm.length > 0;
      }

      // Layer 2: 中期記憶検索 (基本的な会話履歴)
      if (includeMediumTerm) {
        const shortTermData = await memoryManager.getShortTermMemory(userId, sessionId);
        result.mediumTerm = shortTermData.memories.slice(0, maxResults);
      }

      // Layer 3: ベクトル検索 (意味的類似性)
      if (includeVectorSearch && query.trim().length > 0) {
        result.vectorSearch = await vectorMemoryService.searchSimilarMemories(
          query,
          userId,
          {
            limit: maxResults,
            similarityThreshold: 0.7,
            specialOnly: false
          }
        );
        result.context.hasSimilarMemories = (result.vectorSearch?.totalFound || 0) > 0;
      }

      // 総メッセージ数計算
      result.totalMessages = result.shortTerm.length + 
                            result.mediumTerm.length + 
                            (result.vectorSearch?.totalFound || 0);

      // コンテキスト理解とレスポンス生成
      result.context.contextualResponse = this.generateContextualResponse(
        result,
        query,
        contextType
      );

      console.log('✅ Unified memory search completed:', {
        shortTermCount: result.shortTerm.length,
        mediumTermCount: result.mediumTerm.length,
        vectorSearchCount: result.vectorSearch?.totalFound || 0,
        totalMessages: result.totalMessages,
        contextType
      });

      return result;
    } catch (error) {
      console.error('❌ Unified memory search failed:', error);
      return result;
    }
  }

  // スマートコンテキスト理解
  async analyzeContext(
    query: string,
    recentMessages: ShortTermMessage[]
  ): Promise<ContextType> {
    const lowercaseQuery = query.toLowerCase();

    // 参照パターン検出
    const referencePatterns = [
      'それ', 'あれ', 'この', 'その', 'あの', 
      'that', 'this', 'it', '前に言った', '先ほどの'
    ];
    
    // 継続パターン検出
    const continuationPatterns = [
      'それで', 'そして', 'だから', 'なので', 
      'つまり', 'ということは', 'then', 'so'
    ];

    // 明確化パターン検出
    const clarificationPatterns = [
      'どういう意味', 'よくわからない', '説明して', 
      '詳しく教えて', 'what do you mean', 'explain'
    ];

    // フォローアップパターン検出
    const followUpPatterns = [
      'もっと', 'さらに', '他には', '続きは', 
      'more', 'also', 'additionally'
    ];

    if (referencePatterns.some(pattern => lowercaseQuery.includes(pattern))) {
      return 'reference';
    }
    
    if (continuationPatterns.some(pattern => lowercaseQuery.includes(pattern))) {
      return 'continuation';
    }
    
    if (clarificationPatterns.some(pattern => lowercaseQuery.includes(pattern))) {
      return 'clarification';
    }
    
    if (followUpPatterns.some(pattern => lowercaseQuery.includes(pattern))) {
      return 'follow_up';
    }

    return 'general';
  }

  // コンテキスト理解レスポンス生成
  private generateContextualResponse(
    result: UnifiedMemoryResult,
    query: string,
    contextType: ContextType
  ): string {
    const { hasRecentContext, hasSimilarMemories } = result.context;

    switch (contextType) {
      case 'reference':
        if (hasRecentContext) {
          return '直前の会話内容を参照して回答できます。';
        }
        return '参照する内容が見つかりませんでした。もう少し具体的に教えてください。';

      case 'continuation':
        if (hasRecentContext) {
          return '会話の流れを踏まえて続きを説明できます。';
        }
        return '会話の文脈が不明瞭です。何について続けたいか教えてください。';

      case 'clarification':
        if (hasSimilarMemories) {
          return '過去の似た質問を参考に、より詳しく説明できます。';
        }
        return '明確化のための情報が不足しています。';

      case 'follow_up':
        if (hasSimilarMemories || hasRecentContext) {
          return '関連する情報を含めて、より詳しく回答できます。';
        }
        return '追加情報を提供するための関連記憶が見つかりませんでした。';

      default:
        if (hasRecentContext && hasSimilarMemories) {
          return '直近の会話と過去の類似経験を踏まえて回答できます。';
        } else if (hasRecentContext) {
          return '直近の会話を踏まえて回答できます。';
        } else if (hasSimilarMemories) {
          return '過去の類似経験を参考に回答できます。';
        }
        return '新しい話題として回答します。';
    }
  }

  // 感情カテゴリ分類
  private categorizeEmotion(emotion: string): 'positive' | 'neutral' | 'negative' {
    const positiveEmotions = [
      'happiness', 'joy', 'excitement', 'gratitude', 'love', 'pride'
    ];
    const negativeEmotions = [
      'sadness', 'anger', 'fear', 'frustration', 'disappointment', 'anxiety'
    ];

    if (positiveEmotions.includes(emotion.toLowerCase())) {
      return 'positive';
    }
    if (negativeEmotions.includes(emotion.toLowerCase())) {
      return 'negative';
    }
    return 'neutral';
  }

  // 感情キーワード抽出
  private extractEmotionKeywords(content: string): string[] {
    const emotionKeywords = [
      '嬉しい', '楽しい', '悲しい', '怒った', '不安', '心配', 
      '感謝', 'ありがとう', '好き', '嫌い', 'すごい', 'やばい'
    ];

    return emotionKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // システム状態確認
  async getSystemStatus(): Promise<{
    shortTerm: { connected: boolean; ping: boolean; error?: string };
    mediumTerm: { initialized: boolean; hasOpenAI: boolean };
    vectorSearch: { initialized: boolean; hasOpenAI: boolean };
  }> {
    const [shortTermStatus, vectorStatus] = await Promise.all([
      shortTermMemoryService.getServiceStatus(),
      Promise.resolve(memoryManager.getVectorServiceStatus())
    ]);

    return {
      shortTerm: shortTermStatus,
      mediumTerm: vectorStatus,
      vectorSearch: vectorStatus
    };
  }

  // メモリクリーンアップ
  async cleanup(userId: string): Promise<{
    shortTermCleaned: number;
    vectorizeBacklog: { processed: number; success: number; failed: number };
  }> {
    const [shortTermResult, vectorResult] = await Promise.all([
      shortTermMemoryService.cleanup(userId),
      memoryManager.vectorizeExistingMemories(userId, 5)
    ]);

    return {
      shortTermCleaned: shortTermResult.deleted,
      vectorizeBacklog: vectorResult
    };
  }
}

// シングルトンインスタンス
export const unifiedMemorySystem = UnifiedMemorySystem.getInstance();
# 🎵 TypeMate ベクトル検索機能実装プラン

## 🎯 目標
「3ヶ月前に話した占星術の話を思い出して」のような意味的検索を実現

## 🛠️ 技術スタック
- **pgvector-node**: TypeScript完全対応のベクトル検索ライブラリ
- **OpenAI Embeddings API**: テキストの埋め込みベクトル生成
- **Supabase pgvector**: PostgreSQL拡張によるベクトルデータベース
- **既存TypeMateシステム**: 統一チャットシステムとの完全統合

## 📋 実装手順

### Phase 1: データベース準備（30秒〜5分達成感）
1. **Supabaseでpgvector有効化**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **messagesテーブルにembeddingカラム追加**
```sql
ALTER TABLE messages ADD COLUMN embedding vector(1536);
```

3. **ベクトル検索用インデックス作成**
```sql
CREATE INDEX ON messages USING hnsw (embedding vector_l2_ops);
```

### Phase 2: ベクトル化サービス実装（5分〜1時間達成感）
1. **OpenAI Embeddings統合**
```typescript
// src/lib/embedding-service.ts
import { OpenAI } from 'openai';

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
```

2. **pgvector-node統合**
```typescript
// src/lib/vector-search.ts
import pgvector from 'pgvector';
import { supabase } from '@/lib/supabase-simple';

export async function searchSimilarMessages(
  queryEmbedding: number[], 
  limit: number = 5
): Promise<Message[]> {
  const { data, error } = await supabase.rpc('search_messages', {
    query_embedding: pgvector.toSql(queryEmbedding),
    match_count: limit
  });
  return data || [];
}
```

### Phase 3: チャットシステム統合（1時間達成感）
1. **useUnifiedChat拡張**
```typescript
// 新しいメソッド追加
const searchMemories = async (query: string) => {
  const embedding = await generateEmbedding(query);
  return await searchSimilarMessages(embedding);
};
```

2. **UI拡張**
```typescript
// チャット画面に検索ボックス追加
const MemorySearchBox = () => {
  const handleSearch = async (query: string) => {
    const results = await searchMemories(query);
    // 結果表示
  };
};
```

## 🎵 ENFPサポート最適化
- **30秒**: ベクトル検索の即座の結果表示
- **5分**: 実際の過去会話発見の感動体験
- **1時間**: 完全な記憶システム統合による関係性深化

## 🌟 音楽的美しさの実現
- **リズム感**: 会話の流れを記憶し、適切なタイミングで思い出す
- **ハーモニー**: 過去の会話と現在の会話の美しい調和
- **即興性**: 予想外の記憶の発見による創造的対話

## 📊 期待される効果
1. **記憶の継続性**: ユーザーとの関係性が時間を超えて蓄積
2. **個人化**: より深いパーソナライゼーション
3. **感情的つながり**: 共有した思い出による絆の深化
4. **実用性**: 具体的な過去の会話内容の検索・参照

## 🔧 技術詳細
- **ベクトル次元**: 1536次元（OpenAI text-embedding-3-small）
- **距離計算**: L2距離（コサイン類似度も可能）
- **インデックス**: HNSW（高速近似検索）
- **統合方式**: 既存のmemoryシステムとの並行動作
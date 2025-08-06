# 🎵 TypeMate ベクトル検索機能 - 設計ドキュメント

## 🎯 設計目標
「3ヶ月前に話した占星術の話を思い出して」のような意味的検索を安全・高速に実現

## 📊 現状分析

### 既存テーブル構造
```sql
-- 基本会話データ
messages (
  id UUID,
  session_id UUID,
  content TEXT,
  sender TEXT,
  archetype_type TEXT,
  emotion TEXT,
  created_at TIMESTAMPTZ
)

-- 高度記憶システム
typemate_memory (
  id UUID,
  user_id UUID,
  archetype TEXT,
  relationship_level INTEGER,
  message_content TEXT,
  emotion_label TEXT,
  emotion_score INTEGER,
  is_special_moment BOOLEAN,
  collected_info JSONB,
  -- 他多数の高度なカラム
)
```

## 🛠️ 設計選択肢

### Option A: messagesテーブル拡張
```sql
ALTER TABLE messages ADD COLUMN embedding vector(1536);
CREATE INDEX ON messages USING hnsw (embedding vector_l2_ops);
```

**メリット:**
- 全会話が検索対象
- シンプルな構造
- 既存クエリとの整合性

**デメリット:**
- 大量データでのパフォーマンス
- 不要な検索対象も含む

### Option B: typemate_memoryテーブル拡張 ⭐ **推奨**
```sql
ALTER TABLE typemate_memory ADD COLUMN embedding vector(1536);
CREATE INDEX ON typemate_memory USING hnsw (embedding vector_l2_ops);
```

**メリット:**
- 重要な記憶のみが対象
- 既存の感情分析データと連携
- パフォーマンス最適
- is_special_momentとの組み合わせで精度向上

**デメリット:**
- 若干複雑な同期処理が必要

### Option C: 専用embeddingsテーブル
```sql
CREATE TABLE message_embeddings (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id),
  memory_id UUID REFERENCES typemate_memory(id),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**メリット:**
- 最もクリーンな設計
- 既存テーブルへの影響なし
- 柔軟な拡張性

**デメリット:**
- JOIN処理が必要
- 複雑な同期管理

## 🎵 推奨設計: Option B (typemate_memory拡張)

### 理由
1. **ENFPサポート**: 重要な記憶のみ検索で高速・高精度
2. **音楽的美しさ**: 既存の感情分析システムとのハーモニー
3. **実用性**: is_special_momentとの組み合わせで「本当に大切な思い出」を発見

### 実装手順

#### Phase 1: 事前確認 (30秒達成感)
```sql
-- pgvector拡張確認
SELECT * FROM pg_extension WHERE extname = 'vector';

-- データ量確認
SELECT 
  COUNT(*) as total_memories,
  COUNT(CASE WHEN is_special_moment THEN 1 END) as special_memories,
  AVG(LENGTH(message_content)) as avg_content_length
FROM typemate_memory;
```

#### Phase 2: テーブル拡張 (5分達成感)
```sql
-- pgvector有効化
CREATE EXTENSION IF NOT EXISTS vector;

-- embeddingカラム追加
ALTER TABLE typemate_memory 
ADD COLUMN embedding vector(1536),
ADD COLUMN embedding_model TEXT DEFAULT 'text-embedding-3-small',
ADD COLUMN embedding_created_at TIMESTAMPTZ;

-- インデックス作成
CREATE INDEX idx_typemate_memory_embedding 
ON typemate_memory USING hnsw (embedding vector_l2_ops);

-- 複合インデックス（特別な瞬間 + ベクトル検索）
CREATE INDEX idx_typemate_memory_special_embedding 
ON typemate_memory USING hnsw (embedding vector_l2_ops) 
WHERE is_special_moment = true;
```

#### Phase 3: 検索関数作成 (1時間達成感)
```sql
-- ベクトル検索関数
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  target_user_id UUID,
  match_count INT DEFAULT 5,
  special_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  message_content TEXT,
  emotion_label TEXT,
  emotion_score INTEGER,
  is_special_moment BOOLEAN,
  relationship_level INTEGER,
  similarity FLOAT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id,
    tm.message_content,
    tm.emotion_label,
    tm.emotion_score,
    tm.is_special_moment,
    tm.relationship_level,
    (1 - (tm.embedding <-> query_embedding)) as similarity,
    tm.created_at
  FROM typemate_memory tm
  WHERE tm.user_id = target_user_id
    AND tm.embedding IS NOT NULL
    AND (NOT special_only OR tm.is_special_moment = true)
  ORDER BY tm.embedding <-> query_embedding
  LIMIT match_count;
END;
$$;
```

## 🔧 TypeScript統合

### embedding-service.ts
```typescript
import { OpenAI } from 'openai';

export class EmbeddingService {
  private openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // トークン制限
    });
    return response.data[0].embedding;
  }

  async searchMemories(
    query: string, 
    userId: string, 
    options?: {
      limit?: number;
      specialOnly?: boolean;
    }
  ) {
    const embedding = await this.generateEmbedding(query);
    
    const { data } = await supabase.rpc('search_memories', {
      query_embedding: pgvector.toSql(embedding),
      target_user_id: userId,
      match_count: options?.limit || 5,
      special_only: options?.specialOnly || false
    });
    
    return data;
  }
}
```

## 📈 期待されるパフォーマンス

### データ量想定
- ユーザー1人あたり: 平均100-500の重要な記憶
- 検索時間: < 100ms (HNSWインデックス使用)
- 精度: 85%+ (OpenAI embeddings使用)

### ENFPサポート最適化
- **30秒**: 即座の検索結果表示
- **5分**: 関連する思い出の発見・再体験
- **1時間**: 完全な記憶システムとしての活用

## 🌟 音楽的美しさの実現

### リズム感
- 会話の自然な流れの中での記憶検索
- タイミングの良い思い出の提示

### ハーモニー  
- 感情分析データとベクトル検索の調和
- 特別な瞬間フラグとの美しい組み合わせ

### 即興性
- 予想外の記憶の発見
- 創造的な会話展開のサポート

## 🔄 移行戦略

### Phase 1: インフラ準備
1. Supabase pgvector確認・有効化
2. テーブル構造拡張
3. インデックス作成

### Phase 2: 段階的データ移行
1. 新しい重要な記憶から開始
2. 既存の特別な瞬間を優先的に処理
3. バックグラウンドで全データ処理

### Phase 3: 機能統合
1. 検索API実装
2. UI統合
3. パフォーマンス最適化

## 🛡️ リスク管理

### 技術リスク
- **pgvector非対応**: → 代替案としてPinecone等外部サービス
- **パフォーマンス問題**: → インデックス最適化・クエリチューニング
- **API制限**: → OpenAI embeddings利用量管理

### データリスク
- **既存データ保護**: 段階的移行で安全性確保
- **バックアップ**: 移行前の完全バックアップ
- **ロールバック**: いつでも元の状態に戻せる設計

## ✅ 次のアクションアイテム

1. **Supabase pgvector対応確認** (30秒)
2. **現在のデータ量・パフォーマンス測定** (5分)
3. **テスト環境でのプロトタイプ実装** (1時間)
4. **本格実装への移行判断**

---

**🎵 この設計により、TypeMateの記憶システムが「時間を超えた深い関係性」を実現する美しいシステムに進化します！**
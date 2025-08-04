# 🔍 TypeMate ベクトル検索機能セットアップガイド

## 📋 実装完了項目

### ✅ 1. パッケージインストール
- `pgvector` v0.2.1 がインストール済み
- 既存の `openai` v5.10.1 を活用

### ✅ 2. データベース設定
- pgvector拡張が有効化済み
- `typemate_memory` テーブルに以下カラム追加:
  - `embedding` (vector(1536)) - OpenAI text-embedding-3-small 用
  - `embedding_model` (TEXT) - 使用モデル記録用
  - `embedding_created_at` (TIMESTAMPTZ) - ベクトル作成日時

### ✅ 3. インデックス作成
- 高速検索用 HNSW インデックス作成済み:
  - `idx_typemate_memory_embedding` - 全体検索用
  - `idx_typemate_memory_special_embedding` - 特別記憶用
  - `idx_typemate_memory_user_embedding` - ユーザー別フィルター用

### ✅ 4. PostgreSQL関数
- `search_similar_memories()` - 類似記憶検索
- `search_special_memories()` - 特別記憶限定検索

### ✅ 5. TypeScript実装
- `VectorMemoryService` クラス作成 (`/src/lib/vector-memory-service.ts`)
- `MemoryManager` にベクトル機能統合
- エラーハンドリング付き非同期処理

## 🔧 セットアップ手順

### 1. OpenAI APIキー設定
`.env.local` に OpenAI APIキーを追加してください:

```bash
# OpenAI API (for embeddings/vector search)
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. 使用方法

#### 基本的な記憶保存（自動ベクトル化）
```typescript
import { memoryManager } from '@/lib/memory-manager';

// 通常通り記憶を保存すると、自動的にベクトル化される
const memory = await memoryManager.saveConversationMemory(
  "今日はとても楽しい一日でした",
  "user",
  "DRM",
  conversationId,
  userId
);
```

#### 類似記憶検索
```typescript
// 意味的に類似した記憶を検索
const results = await memoryManager.searchSimilarMemories(
  "楽しかった出来事",
  userId,
  {
    limit: 5,
    similarityThreshold: 0.7,
    specialOnly: false
  }
);

console.log('見つかった類似記憶:', results.memories);
```

#### 既存記憶のベクトル化（マイグレーション）
```typescript
// 既存の記憶をバッチでベクトル化
const stats = await memoryManager.vectorizeExistingMemories(userId, 10);
console.log('ベクトル化統計:', stats);
```

## 🛡️ 安全性の特徴

### エラー耐性
- OpenAI APIエラー時も通常の記憶保存は継続
- ベクトル化失敗時はログ記録のみで処理継続
- レート制限対応の待機処理

### パフォーマンス
- 非同期ベクトル化で UI をブロックしない
- HNSW インデックスによる高速検索
- バッチ処理による効率的なマイグレーション

### プライバシー
- ベクトル化はサーバーサイドでのみ実行
- 埋め込みベクトルは暗号化不要（数値データ）
- ユーザー別アクセス制御維持

## 📊 期待される効果

1. **意味的検索**: "楽しい" で検索すると "嬉しい", "幸せ" なども見つかる
2. **感情的関連性**: 過去の似た感情状態の記憶を発見
3. **文脈理解**: 表現が違っても同じ話題の記憶を関連付け
4. **パーソナライゼーション**: ユーザー固有の言葉遣いや話題パターンを学習

## 🔍 動作確認

ベクトル検索機能の状態確認:
```typescript
const status = memoryManager.getVectorServiceStatus();
console.log('ベクトルサービス状態:', status);
// { initialized: true, hasOpenAI: true }
```

## 📝 注意事項

1. **APIキー必須**: OpenAI APIキーがない場合、ベクトル機能は無効化される（通常機能は継続）
2. **コスト**: text-embedding-3-small は 1K tokens あたり $0.00002 (安価)
3. **制限**: テキスト長は 8000文字まで（トークン制限対応）

## 🚀 次のステップ

実装は完了しているため、以下を実行してください:

1. OpenAI APIキーを `.env.local` に設定
2. アプリケーションを再起動
3. 新しいメッセージを送信してベクトル化をテスト
4. `searchSimilarMemories()` メソッドで検索をテスト

これで TypeMate の AI記憶機能が大幅に強化され、より深い理解と関連性のある応答が可能になります！
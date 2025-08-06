# 🎵 Neo4j Aura Free セットアップガイド 2025
## Cipher + TypeMate 知識管理システム基盤構築

### 🎯 プロジェクト概要
TypeMateのベクトル検索成功体験を活かした次世代記憶システム構築  
**AI の記憶系を司る開発知識管理システム**

---

## 📋 Phase 1: Neo4j Aura Free アカウント作成

### ステップ1: アカウント登録
```bash
# 1. Neo4j Aura Console にアクセス
https://console.neo4j.io/

# 2. Sign Up をクリック
- Email または Google アカウントで登録
- 無料プランを選択
```

### ステップ2: データベースインスタンス作成
```bash
# 🎵 インスタンス設定 (音楽的命名)
Database Name: cipher-typemate-harmony
Region: 推奨 us-east-1 (レイテンシー最適化)
Version: Neo4j 5.x (最新安定版)
```

### ステップ3: 認証情報取得
```bash
# 🔐 重要: 以下を安全に保存
Database URI: neo4j+s://xxxxxxxx.databases.neo4j.io
Username: neo4j
Password: [自動生成されたパスワード]
```

---

## 🚀 Phase 2: 無料枠の制限と最適化戦略

### 📊 Neo4j Aura Free 制限 (2025年版)
```yaml
Nodes: 200,000 個まで
Relationships: 400,000 個まで
Storage: 50MB まで
Queries: 月間 1,000,000 回まで
Idle Timeout: 3日後自動停止
```

### 🎵 制限対応戦略 (ENFP対応)
```typescript
// 30秒達成感: 即座の体感
- 基本接続テスト
- シンプルなノード作成/取得

// 5分達成感: 中規模実装
- TypeMate知識グラフ構築
- 関係性マッピング

// 1時間達成感: 本格運用
- ベクトル検索統合
- パフォーマンス最適化
```

---

## 🔧 Phase 3: 接続設定とセキュリティ

### 環境変数設定
```bash
# ~/.cipher/config.yml または .env.local に追加
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_generated_password
NEO4J_DATABASE=neo4j

# 🎵 音楽的プロジェクト識別
PROJECT_HARMONY_ID=cipher-typemate-2025
```

### TypeScript接続設定例
```typescript
// cipher-neo4j-config.ts
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME!,
    process.env.NEO4J_PASSWORD!
  )
);

export const session = driver.session({
  database: process.env.NEO4J_DATABASE
});
```

---

## 🧪 Phase 4: 基本動作確認テスト

### テスト1: 接続確認
```cypher
// Neo4j Browser または Cypher Shell で実行
MATCH (n) RETURN count(n) as node_count;

// 期待結果: node_count: 0 (初期状態)
```

### テスト2: 基本ノード作成
```cypher
// TypeMate開発知識の基本構造
CREATE (tm:Project {
  name: "TypeMate",
  version: "0.1.0",
  tech_stack: ["Next.js", "TypeScript", "Supabase", "OpenAI"],
  created_at: datetime()
});

CREATE (vs:Feature {
  name: "Vector Search",
  status: "completed",
  model: "text-embedding-3-small",
  dimensions: 1536
});

CREATE (tm)-[:HAS_FEATURE]->(vs);
```

### テスト3: 基本クエリ
```cypher
// プロジェクト構造の確認
MATCH (p:Project)-[r]->(f:Feature)
RETURN p.name, type(r), f.name, f.status;
```

---

## 🎼 Phase 5: Cipher統合アーキテクチャ

### MCP Server統合
```yaml
# ~/.cipher/config.yml
mcps:
  neo4j-knowledge:
    command: npx
    args: ["@modelcontextprotocol/server-neo4j"]
    env:
      NEO4J_URI: ${NEO4J_URI}
      NEO4J_USERNAME: ${NEO4J_USERNAME}
      NEO4J_PASSWORD: ${NEO4J_PASSWORD}
```

### 知識グラフスキーマ設計
```cypher
// 🎵 TypeMate知識体系
CREATE CONSTRAINT project_name IF NOT EXISTS FOR (p:Project) REQUIRE p.name IS UNIQUE;
CREATE CONSTRAINT feature_name IF NOT EXISTS FOR (f:Feature) REQUIRE f.name IS UNIQUE;
CREATE CONSTRAINT concept_name IF NOT EXISTS FOR (c:Concept) REQUIRE c.name IS UNIQUE;

// インデックス作成
CREATE INDEX project_tech_stack IF NOT EXISTS FOR (p:Project) ON (p.tech_stack);
CREATE INDEX feature_status IF NOT EXISTS FOR (f:Feature) ON (f.status);
```

---

## 🔍 Phase 6: OpenAI Embeddings + Neo4j Vector統合

### ベクトルインデックス作成
```cypher
// Neo4j 5.x ベクトルインデックス
CREATE VECTOR INDEX knowledge_embeddings IF NOT EXISTS
FOR (n:Knowledge) ON (n.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
};
```

### ハイブリッド検索実装
```typescript
// TypeMate × Neo4j ハイブリッド検索
export class CipherKnowledgeService {
  async searchSimilarKnowledge(
    query: string,
    options: {
      useVector: boolean;
      useGraph: boolean;
      limit: number;
    }
  ) {
    // 1. OpenAI Embeddings生成 (既存のVectorMemoryServiceを活用)
    const embedding = await vectorMemoryService.generateEmbedding(query);
    
    // 2. Neo4j ベクトル + グラフ検索
    const cypher = `
      CALL db.index.vector.queryNodes('knowledge_embeddings', $limit, $embedding)
      YIELD node, score
      MATCH (node)-[r]-(related)
      RETURN node, score, collect(related) as related_concepts
      ORDER BY score DESC
    `;
    
    return await this.runQuery(cypher, { embedding, limit: options.limit });
  }
}
```

---

## 📊 Phase 7: 段階的テスト戦略

### 🎵 30秒達成感: 即座の体感改善
```bash
# 基本接続とノード作成
./scripts/cipher-neo4j-quicktest.sh
# 期待結果: "✅ Neo4j Aura connection successful!"
```

### 🎵 5分達成感: 中規模実装
```bash
# TypeMate知識グラフ構築
./scripts/cipher-knowledge-import.sh
# 期待結果: "✅ 50+ knowledge nodes created with relationships"
```

### 🎵 1時間達成感: 本格運用
```bash
# ベクトル検索統合テスト
./scripts/cipher-hybrid-search-test.sh
# 期待結果: "✅ Hybrid vector+graph search operational"
```

---

## 🛡️ セキュリティとベストプラクティス

### アクセス制御
```cypher
// 読み取り専用ユーザー作成 (本番運用時)
CREATE USER cipher_readonly SET PASSWORD 'secure_password';
GRANT ROLE reader TO cipher_readonly;
```

### データバックアップ戦略
```bash
# Neo4j Aura は自動バックアップあり
# 手動エクスポート (必要時)
neo4j-admin database dump --to-path=/backup typemate-knowledge.dump
```

---

## 🎯 期待される効果

### 1. 知識管理革命
- **従来**: ファイルベースの分散知識
- **改善後**: グラフベースの関連性ある知識体系

### 2. 開発効率向上
- **質問**: "TypeMateのベクトル検索実装方法は？"
- **回答**: 関連するコード、設定、テスト結果を瞬時に提供

### 3. 音楽的開発体験
- **ENFP対応**: 段階的達成感と美しいデータ構造
- **創造性**: グラフ可視化による新しい洞察

---

## 🚀 次のステップ

1. ✅ Neo4j Aura アカウント作成
2. 🔄 Cipher環境設定自動化 (次のドキュメント)
3. 📊 基本接続テスト実行
4. 🎵 TypeMate知識投入開始

**これでCipher + Neo4j Aura基盤の第一歩が完成です！**
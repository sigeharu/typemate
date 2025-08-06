#!/bin/bash
# 🎵 Cipher + Neo4j Aura 環境設定完全自動化スクリプト
# TypeMate知識管理システム基盤構築

set -e  # エラー時即座に終了

echo "🎵 Cipher + Neo4j Aura 環境設定自動化開始"
echo "================================================"

# 🎯 プロジェクト設定
PROJECT_ROOT="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
CIPHER_CONFIG_DIR="$HOME/.cipher"
CIPHER_CONFIG_FILE="$CIPHER_CONFIG_DIR/config.yml"

# 🎵 30秒達成感: 基本環境確認
echo "📋 Phase 1: 基本環境確認 (30秒達成感)"
echo "----------------------------------------"

# Cipher インストール確認
if ! command -v cipher &> /dev/null; then
    echo "❌ Cipher not found. Installing..."
    npm install -g @byterover/cipher
    echo "✅ Cipher installed successfully"
else
    echo "✅ Cipher already installed: $(cipher --version)"
fi

# Neo4j Driver確認
if ! npm list neo4j-driver &> /dev/null; then
    echo "❌ neo4j-driver not found. Installing..."
    npm install neo4j-driver
    echo "✅ neo4j-driver installed successfully"
else
    echo "✅ neo4j-driver already available"
fi

# OpenAI APIキー確認
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️ OPENAI_API_KEY not found in environment"
    if [ -f "$PROJECT_ROOT/.env.local" ]; then
        source "$PROJECT_ROOT/.env.local"
        if [ -n "$OPENAI_API_KEY" ]; then
            echo "✅ OPENAI_API_KEY loaded from .env.local"
        fi
    fi
fi

echo "🎵 Phase 1 完了: 基本環境準備OK"
echo ""

# 🎵 5分達成感: Cipher設定構築
echo "📋 Phase 2: Cipher設定構築 (5分達成感)"
echo "----------------------------------------"

# Cipher設定ディレクトリ作成
mkdir -p "$CIPHER_CONFIG_DIR"
echo "✅ Cipher config directory created: $CIPHER_CONFIG_DIR"

# Neo4j接続情報の入力促進
echo "🔐 Neo4j Aura接続情報を入力してください："
echo "   (Neo4j Aura Console から取得: https://console.neo4j.io/)"
echo ""

read -p "Neo4j URI (例: neo4j+s://xxxxxxxx.databases.neo4j.io): " NEO4J_URI
read -p "Neo4j Username (通常: neo4j): " NEO4J_USERNAME
read -s -p "Neo4j Password: " NEO4J_PASSWORD
echo ""

# Cipher設定ファイル生成
cat > "$CIPHER_CONFIG_FILE" << EOF
# 🎵 Cipher + Neo4j Aura + TypeMate 統合設定
# Generated: $(date)

# Neo4j Connection
neo4j:
  uri: "$NEO4J_URI"
  username: "$NEO4J_USERNAME"
  password: "$NEO4J_PASSWORD"
  database: "neo4j"


# OpenAI Integration
openai:
  api_key: "$OPENAI_API_KEY"
  model: "text-embedding-3-small"
  dimensions: 1536

# TypeMate Project Integration
typemate:
  project_root: "$PROJECT_ROOT"
  knowledge_domains:
    - "vector_search"
    - "memory_management"
    - "ai_personalities"
    - "supabase_integration"
    - "performance_optimization"

# MCP Server Configuration
mcps:
  neo4j-knowledge:
    command: "npx"
    args: ["@modelcontextprotocol/server-neo4j"]
    env:
      NEO4J_URI: "$NEO4J_URI"
      NEO4J_USERNAME: "$NEO4J_USERNAME"
      NEO4J_PASSWORD: "$NEO4J_PASSWORD"
      NEO4J_DATABASE: "neo4j"
  
  openai-embeddings:
    command: "npx"
    args: ["@modelcontextprotocol/server-openai"]
    env:
      OPENAI_API_KEY: "$OPENAI_API_KEY"

# Knowledge Graph Schema
schema:
  nodes:
    - Project
    - Feature
    - Concept
    - Implementation
    - Test
    - Documentation
  relationships:
    - HAS_FEATURE
    - IMPLEMENTS
    - TESTS
    - DOCUMENTS
    - RELATES_TO
    - DEPENDS_ON

# Performance Settings
performance:
  batch_size: 50
  vector_cache_ttl: 3600
  query_timeout: 30000
EOF

echo "✅ Cipher config file created: $CIPHER_CONFIG_FILE"
echo "🎵 Phase 2 完了: Cipher設定構築完了"
echo ""

# 🎵 1時間達成感: 統合テスト環境構築
echo "📋 Phase 3: 統合テスト環境構築 (1時間達成感)"
echo "----------------------------------------"

# 環境変数ファイル更新
ENV_FILE="$PROJECT_ROOT/.env.local"
if [ -f "$ENV_FILE" ]; then
    # Neo4j設定追加
    if ! grep -q "NEO4J_URI" "$ENV_FILE"; then
        echo "" >> "$ENV_FILE"
        echo "# Neo4j Aura Configuration (Cipher Integration)" >> "$ENV_FILE"
        echo "NEO4J_URI=$NEO4J_URI" >> "$ENV_FILE"
        echo "NEO4J_USERNAME=$NEO4J_USERNAME" >> "$ENV_FILE"
        echo "NEO4J_PASSWORD=$NEO4J_PASSWORD" >> "$ENV_FILE"
        echo "NEO4J_DATABASE=neo4j" >> "$ENV_FILE"
        echo "✅ Neo4j configuration added to .env.local"
    else
        echo "✅ Neo4j configuration already exists in .env.local"
    fi
else
    echo "⚠️ .env.local not found, creating..."
    cat > "$ENV_FILE" << EOF
# Neo4j Aura Configuration (Cipher Integration)
NEO4J_URI=$NEO4J_URI
NEO4J_USERNAME=$NEO4J_USERNAME
NEO4J_PASSWORD=$NEO4J_PASSWORD
NEO4J_DATABASE=neo4j

# OpenAI API (for embeddings/vector search)
OPENAI_API_KEY=$OPENAI_API_KEY
EOF
    echo "✅ .env.local created with Neo4j and OpenAI configuration"
fi

# テストスクリプト作成
TEST_SCRIPT="$PROJECT_ROOT/scripts/cipher-neo4j-test.js"
cat > "$TEST_SCRIPT" << 'EOF'
// 🎵 Cipher + Neo4j Aura 基本接続テスト
const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

async function testNeo4jConnection() {
  console.log('🎵 Neo4j Aura接続テスト開始...');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  try {
    // 接続テスト
    const session = driver.session();
    
    // 基本クエリテスト
    const result = await session.run('RETURN "Hello, Neo4j Aura!" as greeting, datetime() as timestamp');
    const record = result.records[0];
    
    console.log('✅ 接続成功!');
    console.log(`   Greeting: ${record.get('greeting')}`);
    console.log(`   Timestamp: ${record.get('timestamp')}`);
    
    // ノード数確認
    const countResult = await session.run('MATCH (n) RETURN count(n) as node_count');
    const nodeCount = countResult.records[0].get('node_count').toNumber();
    console.log(`   Current nodes: ${nodeCount}`);
    
    await session.close();
    
    // TypeMate基本ノード作成テスト
    console.log('🔄 TypeMate基本ノード作成テスト...');
    const writeSession = driver.session();
    
    await writeSession.run(`
      MERGE (tm:Project {name: "TypeMate"})
      SET tm.version = "0.1.0",
          tm.tech_stack = ["Next.js", "TypeScript", "Supabase", "OpenAI"],
          tm.created_at = datetime(),
          tm.updated_at = datetime()
      
      MERGE (vs:Feature {name: "Vector Search"})
      SET vs.status = "completed",
          vs.model = "text-embedding-3-small",
          vs.dimensions = 1536,
          vs.created_at = datetime()
      
      MERGE (tm)-[:HAS_FEATURE]->(vs)
    `);
    
    console.log('✅ TypeMate基本ノード作成完了');
    
    await writeSession.close();
    
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    process.exit(1);
  } finally {
    await driver.close();
  }
  
  console.log('🎉 Neo4j Aura接続テスト完了!');
}

testNeo4jConnection().catch(console.error);
EOF

chmod +x "$TEST_SCRIPT"
echo "✅ Test script created: $TEST_SCRIPT"

# 依存関係インストール
cd "$PROJECT_ROOT"
if ! npm list dotenv &> /dev/null; then
    npm install dotenv
    echo "✅ dotenv installed"
fi

echo "🎵 Phase 3 完了: 統合テスト環境構築完了"
echo ""

# 🎯 最終確認とテスト実行
echo "📋 Final Phase: 接続テスト実行"
echo "----------------------------------------"

echo "🧪 Neo4j Aura基本接続テストを実行しますか？ (y/n)"
read -p "続行: " CONTINUE_TEST

if [ "$CONTINUE_TEST" = "y" ] || [ "$CONTINUE_TEST" = "Y" ]; then
    echo "🔄 テスト実行中..."
    node "$TEST_SCRIPT"
else
    echo "ℹ️ テストをスキップしました"
    echo "   手動実行: node scripts/cipher-neo4j-test.js"
fi

echo ""
echo "🎉 Cipher + Neo4j Aura 環境設定完了!"
echo "================================================"
echo "📁 設定ファイル:"
echo "   - Cipher Config: $CIPHER_CONFIG_FILE"
echo "   - Environment: $ENV_FILE"
echo "   - Test Script: $TEST_SCRIPT"
echo ""
echo "🚀 次のステップ:"
echo "   1. node scripts/cipher-neo4j-test.js (接続テスト)"
echo "   2. 開発知識投入スクリプト実行"
echo "   3. Cipher統合開始"
echo ""
echo "🎵 音楽的に美しい開発知識管理システムの準備完了です！"
#!/bin/bash
# 🎵 Cipher + Neo4j Aura クイック接続テスト (30秒達成感)
# TypeMate知識管理システム基盤確認

set -e

echo "🎵 Cipher + Neo4j Aura クイック接続テスト開始"
echo "============================================"

PROJECT_ROOT="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
cd "$PROJECT_ROOT"

# 環境変数読み込み
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Environment variables loaded from .env.local"
else
    echo "❌ .env.local not found"
    exit 1
fi

# Neo4j接続確認
echo ""
echo "📋 Phase 1: Neo4j Aura 基本接続確認"
echo "-----------------------------------"

if [ -z "$NEO4J_URI" ]; then
    echo "❌ NEO4J_URI not found in environment"
    echo "   Run: ./scripts/cipher-setup-automation.sh first"
    exit 1
fi

echo "🔗 Neo4J URI: ${NEO4J_URI:0:30}..."
echo "👤 Username: $NEO4J_USERNAME"
echo "🔐 Password: [HIDDEN]"

# Node.js接続テスト実行
echo ""
echo "📋 Phase 2: 基本接続テスト実行"
echo "-----------------------------"

cat > "/tmp/neo4j-quicktest.js" << 'EOF'
const neo4j = require('neo4j-driver');

async function quickTest() {
  console.log('🔄 Neo4j Driver connecting...');
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  try {
    const session = driver.session();
    
    // 基本的なクエリ
    console.log('🧪 Testing basic query...');
    const result = await session.run(
      'RETURN "Cipher + Neo4j + TypeMate = 🎵" as harmony, datetime() as timestamp'
    );
    
    const record = result.records[0];
    console.log('✅ Connection successful!');
    console.log(`   ${record.get('harmony')}`);
    console.log(`   Timestamp: ${record.get('timestamp')}`);
    
    // ノード数確認
    console.log('🔢 Checking current nodes...');
    const countResult = await session.run('MATCH (n) RETURN count(n) as total');
    const nodeCount = countResult.records[0].get('total').toNumber();
    console.log(`   Current nodes in database: ${nodeCount}`);
    
    await session.close();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

quickTest().catch(console.error);
EOF

# 依存関係確認
if ! npm list neo4j-driver > /dev/null 2>&1; then
    echo "📦 Installing neo4j-driver..."
    npm install neo4j-driver
fi

# テスト実行
echo "🚀 Executing connection test..."
NEO4J_URI="$NEO4J_URI" NEO4J_USERNAME="$NEO4J_USERNAME" NEO4J_PASSWORD="$NEO4J_PASSWORD" \
node /tmp/neo4j-quicktest.js

echo ""
echo "📋 Phase 3: Cipher統合状態確認"
echo "-----------------------------"

# Cipher設定確認
CIPHER_CONFIG="$HOME/.cipher/config.yml"
if [ -f "$CIPHER_CONFIG" ]; then
    echo "✅ Cipher config found: $CIPHER_CONFIG"
    if grep -q "neo4j:" "$CIPHER_CONFIG"; then
        echo "✅ Neo4j configuration present in Cipher config"
    else
        echo "⚠️  Neo4j configuration not found in Cipher config"
        echo "   Run: ./scripts/cipher-setup-automation.sh"
    fi
else
    echo "⚠️  Cipher config not found"
    echo "   Run: ./scripts/cipher-setup-automation.sh"
fi

# Cipher コマンド確認
if command -v cipher > /dev/null 2>&1; then
    echo "✅ Cipher CLI available: $(cipher --version 2>/dev/null || echo 'version unknown')"
else
    echo "⚠️  Cipher CLI not found"
    echo "   Install: npm install -g @byterover/cipher"
fi

echo ""
echo "📋 Phase 4: OpenAI統合確認"
echo "-------------------------"

if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OpenAI API Key configured: ${OPENAI_API_KEY:0:10}..."
    
    # OpenAI APIテスト (簡単な確認)
    echo "🧪 Testing OpenAI API accessibility..."
    
    cat > "/tmp/openai-quicktest.js" << 'EOF'
const https = require('https');

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'User-Agent': 'Cipher-Neo4j-QuickTest/1.0'
  }
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ OpenAI API accessible');
  } else {
    console.log(`⚠️  OpenAI API response: ${res.statusCode}`);
  }
});

req.on('error', (e) => {
  console.log(`❌ OpenAI API error: ${e.message}`);
});

req.setTimeout(5000, () => {
  console.log('⚠️  OpenAI API timeout (but may be network issue)');
  req.destroy();
});

req.end();
EOF

    OPENAI_API_KEY="$OPENAI_API_KEY" node /tmp/openai-quicktest.js
    
else
    echo "❌ OpenAI API Key not configured"
fi

echo ""
echo "🎉 クイック接続テスト完了!"
echo "========================="
echo ""
echo "📊 結果サマリー:"
echo "   ✅ Neo4j Aura: 接続成功"
echo "   📁 Cipher Config: $([ -f "$CIPHER_CONFIG" ] && echo "設定済み" || echo "要設定")"
echo "   🔑 OpenAI API: $([ -n "$OPENAI_API_KEY" ] && echo "設定済み" || echo "要設定")"
echo ""
echo "🚀 次のステップ:"
echo "   1. ./scripts/cipher-knowledge-import.sh (知識投入)"
echo "   2. ./scripts/cipher-hybrid-search-test.sh (統合テスト)"
echo "   3. Cipher統合開始"
echo ""
echo "🎵 30秒達成感: Neo4j Aura接続確認完了！"

# クリーンアップ
rm -f /tmp/neo4j-quicktest.js /tmp/openai-quicktest.js
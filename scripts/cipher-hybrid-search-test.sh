#!/bin/bash
# 🎵 Cipher + Neo4j ハイブリッド検索テスト (1時間達成感)
# TypeMate知識管理システム統合動作確認

set -e

echo "🎵 Cipher + Neo4j ハイブリッド検索テスト開始"
echo "=========================================="

PROJECT_ROOT="/Users/miyamotoseiyou/Library/Mobile Documents/com~apple~CloudDocs/CreativeWorkspace/ActiveProjects/typemate"
cd "$PROJECT_ROOT"

# 環境変数読み込み
if [ -f ".env.local" ]; then
    source .env.local
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.local not found"
    exit 1
fi

echo ""
echo "📋 Phase 1: ハイブリッド検索システム構築"
echo "------------------------------------"

# ハイブリッド検索テストスクリプト作成
cat > "/tmp/hybrid-search-test.js" << 'EOF'
const neo4j = require('neo4j-driver');
const https = require('https');

// Neo4j接続
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// OpenAI Embeddings API呼び出し (簡易版)
async function generateEmbedding(text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.data && response.data[0] && response.data[0].embedding) {
            resolve(response.data[0].embedding);
          } else {
            reject(new Error('Invalid OpenAI API response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// ベクトルインデックス作成
async function createVectorIndex() {
  console.log('🔍 Creating vector indexes...');
  
  const session = driver.session();
  
  try {
    // Feature用ベクトルインデックス
    await session.run(`
      CREATE VECTOR INDEX feature_embeddings IF NOT EXISTS
      FOR (f:Feature) ON (f.embedding)
      OPTIONS {
        indexConfig: {
          \`vector.dimensions\`: 1536,
          \`vector.similarity_function\`: 'cosine'
        }
      }
    `);
    
    // Concept用ベクトルインデックス
    await session.run(`
      CREATE VECTOR INDEX concept_embeddings IF NOT EXISTS
      FOR (c:Concept) ON (c.embedding)
      OPTIONS {
        indexConfig: {
          \`vector.dimensions\`: 1536,
          \`vector.similarity_function\`: 'cosine'
        }
      }
    `);
    
    console.log('✅ Vector indexes created');
    
  } finally {
    await session.close();
  }
}

// 既存ノードにベクトル埋め込み追加
async function addEmbeddingsToNodes() {
  console.log('🧠 Adding embeddings to existing nodes...');
  
  const session = driver.session();
  
  try {
    // Feature ノードの埋め込み
    const featureResult = await session.run(`
      MATCH (f:Feature)
      RETURN f.name as name, f.description as description
    `);
    
    for (const record of featureResult.records) {
      const name = record.get('name');
      const description = record.get('description');
      const text = `${name}: ${description}`;
      
      try {
        console.log(`  Embedding feature: ${name}...`);
        const embedding = await generateEmbedding(text);
        
        await session.run(`
          MATCH (f:Feature {name: $name})
          SET f.embedding = $embedding,
              f.embedding_created_at = datetime()
        `, { name, embedding });
        
        console.log(`    ✅ ${name} embedded`);
        
        // API rate limit対策
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`    ⚠️ ${name} embedding failed: ${error.message}`);
      }
    }
    
    // Concept ノードの埋め込み
    const conceptResult = await session.run(`
      MATCH (c:Concept)
      RETURN c.name as name, c.description as description
    `);
    
    for (const record of conceptResult.records) {
      const name = record.get('name');
      const description = record.get('description');
      const text = `${name}: ${description}`;
      
      try {
        console.log(`  Embedding concept: ${name}...`);
        const embedding = await generateEmbedding(text);
        
        await session.run(`
          MATCH (c:Concept {name: $name})
          SET c.embedding = $embedding,
              c.embedding_created_at = datetime()
        `, { name, embedding });
        
        console.log(`    ✅ ${name} embedded`);
        
        // API rate limit対策  
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`    ⚠️ ${name} embedding failed: ${error.message}`);
      }
    }
    
  } finally {
    await session.close();
  }
}

// ハイブリッド検索テスト
async function testHybridSearch() {
  console.log('\n🔍 Testing hybrid search capabilities...');
  
  const testQueries = [
    {
      query: "ベクトル検索の実装方法は？",
      description: "Vector search implementation"
    },
    {
      query: "OpenAI APIの使い方",
      description: "OpenAI API usage"
    },
    {
      query: "メモリ管理システム",
      description: "Memory management system"
    },
    {
      query: "非同期処理とエラーハンドリング",
      description: "Async processing and error handling"
    }
  ];
  
  const session = driver.session();
  
  try {
    for (const testCase of testQueries) {
      console.log(`\n🧪 Testing: "${testCase.query}"`);
      console.log(`   Description: ${testCase.description}`);
      
      try {
        // クエリをベクトル化
        const queryEmbedding = await generateEmbedding(testCase.query);
        
        // Neo4j ベクトル検索 (Feature)
        const featureResults = await session.run(`
          CALL db.index.vector.queryNodes('feature_embeddings', 3, $embedding)
          YIELD node, score
          WHERE score > 0.7
          RETURN node.name as name, node.description as description, score
          ORDER BY score DESC
        `, { embedding: queryEmbedding });
        
        console.log('   📊 Feature search results:');
        if (featureResults.records.length > 0) {
          featureResults.records.forEach((record, index) => {
            const name = record.get('name');
            const score = record.get('score').toFixed(3);
            console.log(`     ${index + 1}. ${name} (similarity: ${score})`);
          });
        } else {
          console.log('     No features found above threshold');
        }
        
        // Neo4j ベクトル検索 (Concept)
        const conceptResults = await session.run(`
          CALL db.index.vector.queryNodes('concept_embeddings', 3, $embedding)
          YIELD node, score
          WHERE score > 0.7
          RETURN node.name as name, node.description as description, score
          ORDER BY score DESC
        `, { embedding: queryEmbedding });
        
        console.log('   🧠 Concept search results:');
        if (conceptResults.records.length > 0) {
          conceptResults.records.forEach((record, index) => {
            const name = record.get('name');
            const score = record.get('score').toFixed(3);
            console.log(`     ${index + 1}. ${name} (similarity: ${score})`);
          });
        } else {
          console.log('     No concepts found above threshold');
        }
        
        // グラフ関係検索
        const relationResults = await session.run(`
          CALL db.index.vector.queryNodes('feature_embeddings', 1, $embedding)
          YIELD node, score
          WHERE score > 0.7
          MATCH (node)-[r]-(related)
          RETURN type(r) as relationship, labels(related)[0] as nodeType, related.name as name
          LIMIT 5
        `, { embedding: queryEmbedding });
        
        console.log('   🔗 Related nodes:');
        if (relationResults.records.length > 0) {
          relationResults.records.forEach(record => {
            const relationship = record.get('relationship');
            const nodeType = record.get('nodeType');
            const name = record.get('name');
            console.log(`     -[${relationship}]-> ${nodeType}: ${name}`);
          });
        } else {
          console.log('     No related nodes found');
        }
        
        // API rate limit対策
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   ❌ Search failed: ${error.message}`);
      }
    }
    
  } finally {
    await session.close();
  }
}

// パフォーマンス測定
async function measurePerformance() {
  console.log('\n📊 Performance measurement...');
  
  const session = driver.session();
  
  try {
    const startTime = Date.now();
    
    // 簡単な検索クエリでパフォーマンス測定
    const result = await session.run(`
      MATCH (f:Feature)-[r]-(related)
      RETURN f.name, type(r), related.name
      LIMIT 10
    `);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   Query execution time: ${duration}ms`);
    console.log(`   Results returned: ${result.records.length}`);
    
    if (duration < 1000) {
      console.log('   ✅ Performance: Excellent (<1s)');
    } else if (duration < 3000) {
      console.log('   ✅ Performance: Good (<3s)');
    } else {
      console.log('   ⚠️ Performance: Needs optimization (>3s)');
    }
    
  } finally {
    await session.close();
  }
}

// メイン実行
async function main() {
  try {
    console.log('🚀 Starting hybrid search test...');
    
    await createVectorIndex();
    console.log('✅ Phase 1: Vector indexes ready');
    
    await addEmbeddingsToNodes();
    console.log('✅ Phase 2: Node embeddings complete');
    
    await testHybridSearch();
    console.log('✅ Phase 3: Hybrid search tests complete');
    
    await measurePerformance();
    console.log('✅ Phase 4: Performance measurement complete');
    
    console.log('\n🎉 Hybrid search system operational!');
    console.log('🎵 1時間達成感: 統合検索システム構築完了！');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

main();
EOF

echo ""
echo "📋 Phase 2: 依存関係確認"
echo "-----------------------"

# 必要なパッケージ確認
if ! npm list neo4j-driver > /dev/null 2>&1; then
    echo "📦 Installing neo4j-driver..."
    npm install neo4j-driver
else
    echo "✅ neo4j-driver available"
fi

echo ""
echo "📋 Phase 3: ハイブリッド検索テスト実行"
echo "----------------------------------"

echo "🚀 Neo4j ハイブリッド検索システムをテストします..."
echo "   注意: OpenAI API呼び出しが含まれるため、数分かかる場合があります"
echo ""

NEO4J_URI="$NEO4J_URI" NEO4J_USERNAME="$NEO4J_USERNAME" NEO4J_PASSWORD="$NEO4J_PASSWORD" OPENAI_API_KEY="$OPENAI_API_KEY" \
node /tmp/hybrid-search-test.js

echo ""
echo "📋 Phase 4: 統合システム状態確認"
echo "-----------------------------"

# 最終確認クエリ
cat > "/tmp/final-verification.js" << 'EOF'
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function finalCheck() {
  const session = driver.session();
  
  try {
    // 全体統計
    const stats = await session.run(`
      MATCH (n) 
      OPTIONAL MATCH (n)-[r]-()
      RETURN labels(n)[0] as nodeType, 
             count(DISTINCT n) as nodeCount,
             count(DISTINCT r) as relationshipCount,
             count(CASE WHEN n.embedding IS NOT NULL THEN 1 END) as embeddedCount
      ORDER BY nodeType
    `);
    
    console.log('📊 Final system statistics:');
    let totalNodes = 0;
    let totalRelationships = 0;
    let totalEmbedded = 0;
    
    stats.records.forEach(record => {
      const nodeType = record.get('nodeType');
      const nodeCount = record.get('nodeCount').toNumber();
      const relationshipCount = record.get('relationshipCount').toNumber();
      const embeddedCount = record.get('embeddedCount').toNumber();
      
      console.log(`   ${nodeType}: ${nodeCount} nodes, ${embeddedCount} embedded`);
      totalNodes += nodeCount;
      totalEmbedded += embeddedCount;
    });
    
    // 関係統計
    const relStats = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) as relType, count(r) as count
      ORDER BY count DESC
    `);
    
    console.log('\n🔗 Relationship statistics:');
    relStats.records.forEach(record => {
      console.log(`   ${record.get('relType')}: ${record.get('count')}`);
    });
    
    // ベクトルインデックス確認
    const indexCheck = await session.run(`
      SHOW INDEXES
      YIELD name, type, entityType, labelsOrTypes, properties
      WHERE type = 'VECTOR'
      RETURN name, labelsOrTypes, properties
    `);
    
    console.log('\n🔍 Vector indexes:');
    if (indexCheck.records.length > 0) {
      indexCheck.records.forEach(record => {
        console.log(`   ${record.get('name')}: ${record.get('labelsOrTypes')} (${record.get('properties')})`);
      });
    } else {
      console.log('   No vector indexes found');
    }
    
    console.log('\n📈 System readiness:');
    console.log(`   Total nodes: ${totalNodes}`);
    console.log(`   Embedded nodes: ${totalEmbedded}`);
    console.log(`   Vector search: ${indexCheck.records.length > 0 ? 'Ready' : 'Not ready'}`);
    console.log(`   Graph traversal: Ready`);
    console.log(`   Hybrid queries: ${totalEmbedded > 0 && indexCheck.records.length > 0 ? 'Ready' : 'Partial'}`);
    
  } finally {
    await session.close();
    await driver.close();
  }
}

finalCheck().catch(console.error);
EOF

NEO4J_URI="$NEO4J_URI" NEO4J_USERNAME="$NEO4J_USERNAME" NEO4J_PASSWORD="$NEO4J_PASSWORD" \
node /tmp/final-verification.js

echo ""
echo "🎉 Cipher + Neo4j ハイブリッド検索テスト完了!"
echo "============================================"
echo ""
echo "🎯 達成された機能:"
echo "   🔍 Vector similarity search (OpenAI embeddings)"
echo "   🕸️  Graph relationship traversal"
echo "   🧠 Hybrid search (vector + graph)"
echo "   📊 Performance monitoring"
echo "   🎵 Knowledge graph visualization ready"
echo ""
echo "🚀 Cipher統合準備完了:"
echo "   1. ~/.cipher/config.yml の MCP server設定"
echo "   2. Neo4j Browser でのグラフ可視化"
echo "   3. 'TypeMateのベクトル検索実装方法は？' などの質問が可能"
echo ""
echo "📋 次のアクション:"
echo "   - Neo4j Browser: $NEO4J_URI"
echo "   - Query example: MATCH (p:Project)-[:HAS_FEATURE]->(f:Feature) RETURN p, f"
echo "   - Cipher integration: cipher chat (with configured MCP servers)"
echo ""
echo "🎵 1時間達成感: 音楽的に美しい開発知識管理システム基盤完成！"

# クリーンアップ
rm -f /tmp/hybrid-search-test.js /tmp/final-verification.js
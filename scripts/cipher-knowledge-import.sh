#!/bin/bash
# 🎵 TypeMate開発知識 Neo4j投入スクリプト (5分達成感)
# Cipher知識管理システム基盤データ構築

set -e

echo "🎵 TypeMate開発知識をNeo4jに投入開始"
echo "===================================="

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
echo "📋 Phase 1: TypeMate知識抽出・分析"
echo "-------------------------------"

# TypeMate知識投入スクリプト生成
cat > "/tmp/typemate-knowledge-import.js" << 'EOF'
const neo4j = require('neo4j-driver');
const fs = require('fs').promises;
const path = require('path');

// Neo4j接続
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// TypeMate知識定義
const typeMateKnowledge = {
  project: {
    name: "TypeMate",
    version: "0.1.0",
    description: "AI personality-based chat application with vector memory",
    tech_stack: ["Next.js 15.4.2", "React 19.1.0", "TypeScript", "Supabase", "OpenAI", "pgvector"],
    repository: "https://github.com/sigeharu/typemate",
    created_at: "2024-12",
    status: "active_development"
  },
  
  features: [
    {
      name: "Vector Search",
      description: "OpenAI embeddings + pgvector による意味的検索機能",
      status: "completed",
      implementation_files: ["src/lib/vector-memory-service.ts", "src/lib/memory-manager.ts"],
      model: "text-embedding-3-small",
      dimensions: 1536,
      test_success_rate: "100% (5/5)",
      domain: "memory_management"
    },
    {
      name: "Memory Management", 
      description: "暗号化対応の記憶管理システム",
      status: "completed",
      implementation_files: ["src/lib/memory-manager.ts", "src/lib/SecureMemoryManager.ts"],
      features: ["暗号化", "非同期処理", "エラー耐性"],
      domain: "memory_management"
    },
    {
      name: "AI Personalities",
      description: "64タイプの性格診断ベースAIキャラクター",
      status: "completed", 
      implementation_files: ["src/lib/harmonic-ai-service.ts", "src/app/chat/page.tsx"],
      personalities: ["DRM", "SLI", "IEE", "LSI"],
      domain: "ai_personalities"
    },
    {
      name: "Supabase Integration",
      description: "PostgreSQL + Auth + Real-time 統合",
      status: "completed",
      implementation_files: ["src/lib/supabase-simple.ts"],
      services: ["Database", "Auth", "Storage"],
      domain: "database"
    }
  ],
  
  concepts: [
    {
      name: "OpenAI Embeddings",
      description: "テキストをベクトル表現に変換するAI技術",
      model: "text-embedding-3-small",
      cost: "$0.00002 per 1K tokens",
      dimensions: 1536,
      use_cases: ["類似検索", "意味的関連性発見"]
    },
    {
      name: "pgvector",
      description: "PostgreSQL用ベクトル検索拡張",
      version: "0.2.1",
      index_type: "HNSW",
      similarity_function: "cosine",
      use_cases: ["高速ベクトル検索", "大規模データ処理"]
    },
    {
      name: "非同期ベクトル化",
      description: "メイン処理を妨げない背景処理でベクトル生成",
      benefits: ["UI応答性維持", "エラー耐性", "スケーラビリティ"],
      pattern: "fire-and-forget"
    }
  ],

  implementations: [
    {
      name: "VectorMemoryService",
      file: "src/lib/vector-memory-service.ts",
      description: "OpenAI埋め込みとベクトル検索の統合サービス",
      key_methods: ["generateEmbedding", "addEmbeddingToMemory", "searchSimilarMemories"],
      error_handling: "graceful degradation",
      performance: "non-blocking async"
    },
    {
      name: "MemoryManager Integration",
      file: "src/lib/memory-manager.ts",
      description: "記憶管理システムへのベクトル機能統合",
      integration_point: "saveConversationMemory",
      strategy: "transparent enhancement"
    }
  ],

  tests: [
    {
      name: "Vector Search Integration Test",
      file: "src/pages/api/test-vector.ts",
      coverage: ["Service initialization", "Memory vectorization", "Similarity search", "Error handling"],  
      success_rate: "100% (5/5 tests)",
      execution_time: "< 30 seconds"
    }
  ],

  documentation: [
    {
      name: "Vector Search Setup Guide",
      file: "docs/VECTOR_SEARCH_SETUP.md", 
      content: "Complete setup and usage documentation",
      audience: "developers"
    },
    {
      name: "Vector Test Report",
      file: "VECTOR_TEST_REPORT.md",
      content: "Comprehensive test results and performance analysis",
      audience: "technical review"
    }
  ]
};

async function importKnowledge() {
  console.log('🎵 TypeMate知識のNeo4j投入開始...');
  
  const session = driver.session();
  
  try {
    // スキーマ制約作成
    console.log('📋 Creating schema constraints...');
    await session.run(`
      CREATE CONSTRAINT project_name_unique IF NOT EXISTS 
      FOR (p:Project) REQUIRE p.name IS UNIQUE
    `);
    
    await session.run(`
      CREATE CONSTRAINT feature_name_unique IF NOT EXISTS 
      FOR (f:Feature) REQUIRE f.name IS UNIQUE
    `);
    
    await session.run(`
      CREATE CONSTRAINT concept_name_unique IF NOT EXISTS 
      FOR (c:Concept) REQUIRE c.name IS UNIQUE
    `);

    // プロジェクトノード作成
    console.log('🏗️  Creating project node...');
    await session.run(`
      MERGE (p:Project {name: $name})
      SET p.version = $version,
          p.description = $description, 
          p.tech_stack = $tech_stack,
          p.repository = $repository,
          p.created_at = datetime($created_at),
          p.status = $status,
          p.updated_at = datetime()
    `, typeMateKnowledge.project);

    // フィーチャーノード作成
    console.log('⚡ Creating feature nodes...');
    for (const feature of typeMateKnowledge.features) {
      await session.run(`
        MERGE (f:Feature {name: $name})
        SET f.description = $description,
            f.status = $status,
            f.implementation_files = $implementation_files,
            f.domain = $domain,
            f.created_at = datetime(),
            f.updated_at = datetime()
      `, feature);
      
      // プロジェクト-フィーチャー関係
      await session.run(`
        MATCH (p:Project {name: "TypeMate"})
        MATCH (f:Feature {name: $featureName})
        MERGE (p)-[:HAS_FEATURE]->(f)
      `, { featureName: feature.name });
    }

    // コンセプトノード作成
    console.log('🧠 Creating concept nodes...');
    for (const concept of typeMateKnowledge.concepts) {
      await session.run(`
        MERGE (c:Concept {name: $name})
        SET c.description = $description,
            c.created_at = datetime(),
            c.updated_at = datetime()
      `, concept);
    }

    // 実装ノード作成
    console.log('💻 Creating implementation nodes...');
    for (const impl of typeMateKnowledge.implementations) {
      await session.run(`
        MERGE (i:Implementation {name: $name})
        SET i.file = $file,
            i.description = $description,
            i.key_methods = $key_methods,
            i.created_at = datetime()
      `, impl);
    }

    // テストノード作成
    console.log('🧪 Creating test nodes...');
    for (const test of typeMateKnowledge.tests) {
      await session.run(`
        MERGE (t:Test {name: $name})
        SET t.file = $file,
            t.coverage = $coverage,
            t.success_rate = $success_rate,
            t.execution_time = $execution_time,
            t.created_at = datetime()
      `, test);
    }

    // ドキュメントノード作成
    console.log('📚 Creating documentation nodes...');
    for (const doc of typeMateKnowledge.documentation) {
      await session.run(`
        MERGE (d:Documentation {name: $name})
        SET d.file = $file,
            d.content = $content,
            d.audience = $audience,
            d.created_at = datetime()
      `, doc);
    }

    // 関係性構築
    console.log('🔗 Building relationships...');
    
    // Vector Search の詳細関係
    await session.run(`
      MATCH (f:Feature {name: "Vector Search"})
      MATCH (c1:Concept {name: "OpenAI Embeddings"})
      MATCH (c2:Concept {name: "pgvector"})
      MATCH (c3:Concept {name: "非同期ベクトル化"})
      MERGE (f)-[:IMPLEMENTS]->(c1)
      MERGE (f)-[:IMPLEMENTS]->(c2)
      MERGE (f)-[:IMPLEMENTS]->(c3)
    `);

    await session.run(`
      MATCH (f:Feature {name: "Vector Search"})
      MATCH (i:Implementation {name: "VectorMemoryService"})
      MATCH (t:Test {name: "Vector Search Integration Test"})
      MATCH (d:Documentation {name: "Vector Search Setup Guide"})
      MERGE (f)-[:IMPLEMENTED_BY]->(i)
      MERGE (f)-[:TESTED_BY]->(t)
      MERGE (f)-[:DOCUMENTED_BY]->(d)
    `);

    // Memory Management の関係
    await session.run(`
      MATCH (f:Feature {name: "Memory Management"})
      MATCH (i:Implementation {name: "MemoryManager Integration"})
      MERGE (f)-[:IMPLEMENTED_BY]->(i)
    `);

    // コンセプト間の関係
    await session.run(`
      MATCH (c1:Concept {name: "OpenAI Embeddings"})
      MATCH (c2:Concept {name: "pgvector"})
      MATCH (c3:Concept {name: "非同期ベクトル化"})
      MERGE (c1)-[:WORKS_WITH]->(c2)
      MERGE (c1)-[:ENHANCED_BY]->(c3)
    `);

    console.log('✅ TypeMate知識投入完了!');
    
    // 結果確認
    const result = await session.run(`
      MATCH (n) 
      RETURN labels(n)[0] as nodeType, count(n) as count
      ORDER BY nodeType
    `);
    
    console.log('\n📊 投入結果:');
    result.records.forEach(record => {
      console.log(`   ${record.get('nodeType')}: ${record.get('count')} nodes`);
    });

  } catch (error) {
    console.error('❌ Knowledge import failed:', error);
    throw error;
  } finally {
    await session.close();
  }
}

async function verifyKnowledge() {
  console.log('\n🔍 知識グラフ構造確認...');
  
  const session = driver.session();
  
  try {
    // 基本構造確認
    const result = await session.run(`
      MATCH (p:Project)-[r]->(f:Feature)
      RETURN p.name as project, type(r) as relationship, f.name as feature, f.status as status
    `);
    
    console.log('\n🏗️  プロジェクト構造:');
    result.records.forEach(record => {
      console.log(`   ${record.get('project')} -[${record.get('relationship')}]-> ${record.get('feature')} (${record.get('status')})`);
    });

    // Vector Search の詳細確認
    const vectorResult = await session.run(`
      MATCH (f:Feature {name: "Vector Search"})-[r]-(related)
      RETURN type(r) as relationship, labels(related)[0] as nodeType, related.name as name
      ORDER BY relationship, nodeType
    `);
    
    console.log('\n🔍 Vector Search 関係:');
    vectorResult.records.forEach(record => {
      console.log(`   Vector Search -[${record.get('relationship')}]-> ${record.get('nodeType')}: ${record.get('name')}`);
    });

  } finally {
    await session.close();
  }
}

// メイン実行
async function main() {
  try {
    await importKnowledge();
    await verifyKnowledge();
    console.log('\n🎉 TypeMate知識グラフ構築完了!');
    console.log('🎵 5分達成感: 基盤知識投入成功！');
  } catch (error) {
    console.error('💥 Error:', error);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

main();
EOF

echo ""
echo "📋 Phase 2: Neo4j依存関係確認"
echo "----------------------------"

# neo4j-driver確認・インストール
if ! npm list neo4j-driver > /dev/null 2>&1; then
    echo "📦 Installing neo4j-driver..."
    npm install neo4j-driver
else
    echo "✅ neo4j-driver available"
fi

echo ""
echo "📋 Phase 3: 知識投入実行"
echo "-----------------------"

echo "🚀 TypeMate開発知識をNeo4jに投入します..."
NEO4J_URI="$NEO4J_URI" NEO4J_USERNAME="$NEO4J_USERNAME" NEO4J_PASSWORD="$NEO4J_PASSWORD" \
node /tmp/typemate-knowledge-import.js

echo ""
echo "📋 Phase 4: 投入結果確認"
echo "-----------------------"

# 簡単な確認クエリ実行
cat > "/tmp/verify-knowledge.js" << 'EOF'
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function verify() {
  const session = driver.session();
  
  try {
    // 全体統計
    const totalResult = await session.run('MATCH (n) RETURN count(n) as total');
    const total = totalResult.records[0].get('total').toNumber();
    
    // 関係数
    const relResult = await session.run('MATCH ()-[r]->() RETURN count(r) as relationships');
    const relationships = relResult.records[0].get('relationships').toNumber();
    
    console.log('📊 投入結果統計:');
    console.log(`   Total nodes: ${total}`);
    console.log(`   Total relationships: ${relationships}`);
    
    // TypeMateプロジェクト確認
    const projectResult = await session.run(`
      MATCH (p:Project {name: "TypeMate"})
      RETURN p.version as version, p.status as status, size(p.tech_stack) as tech_count
    `);
    
    if (projectResult.records.length > 0) {
      const record = projectResult.records[0];
      console.log(`   TypeMate v${record.get('version')} (${record.get('status')})`);
      console.log(`   Technologies: ${record.get('tech_count')} items`);
      console.log('✅ TypeMate project node verified');
    }

  } finally {
    await session.close();
    await driver.close();
  }
}

verify().catch(console.error);
EOF

NEO4J_URI="$NEO4J_URI" NEO4J_USERNAME="$NEO4J_USERNAME" NEO4J_PASSWORD="$NEO4J_PASSWORD" \
node /tmp/verify-knowledge.js

echo ""
echo "🎉 TypeMate開発知識投入完了!"
echo "============================"
echo ""
echo "📊 投入された知識:"
echo "   🏗️  Project: TypeMate (v0.1.0)"
echo "   ⚡ Features: Vector Search, Memory Management, AI Personalities, Supabase Integration"
echo "   🧠 Concepts: OpenAI Embeddings, pgvector, 非同期ベクトル化"
echo "   💻 Implementations: VectorMemoryService, MemoryManager Integration"
echo "   🧪 Tests: Vector Search Integration Test"
echo "   📚 Documentation: Setup Guide, Test Report"
echo ""
echo "🚀 次のステップ:"
echo "   1. ./scripts/cipher-hybrid-search-test.sh (検索テスト)"
echo "   2. Neo4j Browser で知識グラフ可視化"
echo "   3. Cipher統合による質問応答テスト"
echo ""
echo "🎵 5分達成感: TypeMate知識グラフ構築完了！"

# クリーンアップ
rm -f /tmp/typemate-knowledge-import.js /tmp/verify-knowledge.js
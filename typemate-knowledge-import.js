// 🎵 TypeMate開発知識のNeo4j投入
const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

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
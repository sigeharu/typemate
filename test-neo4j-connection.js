// 🎵 Neo4j Aura直接接続テスト
const neo4j = require('neo4j-driver');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🎵 Neo4j Aura接続テスト開始...');
  console.log('URI:', process.env.NEO4J_URI);
  console.log('Username:', process.env.NEO4J_USERNAME);
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  try {
    const session = driver.session();
    
    console.log('🧪 Testing basic query...');
    const result = await session.run(
      'RETURN "Cipher + Neo4j + TypeMate = 🎵" as harmony, datetime() as timestamp'
    );
    
    const record = result.records[0];
    console.log('✅ Connection successful!');
    console.log(`   ${record.get('harmony')}`);
    console.log(`   Timestamp: ${record.get('timestamp')}`);
    
    // ノード数確認
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
  
  console.log('🎉 Neo4j Aura接続テスト完了!');
  console.log('🎵 30秒達成感: 基本接続確認成功！');
}

testConnection().catch(console.error);
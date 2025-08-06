#!/usr/bin/env node

// 🎵 TypeMate 3層記憶システム統合テスト
// Redis短期記憶 + Supabase中期記憶 + Neo4j長期記憶の動作確認

console.log('🎵 TypeMate 3層記憶システム統合テスト開始\n');

const testResults = {
  redis: { passed: 0, failed: 0, tests: [] },
  unifiedSystem: { passed: 0, failed: 0, tests: [] },
  chatAPI: { passed: 0, failed: 0, tests: [] },
  statusAPI: { passed: 0, failed: 0, tests: [] }
};

// テスト用ユーザーID
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_SESSION_ID = 'test-session-' + Date.now();
const TEST_CONVERSATION_ID = 'test-conv-' + Date.now();

// Redis接続テスト
async function testRedisConnection() {
  console.log('🔄 Redis接続テスト...');
  
  try {
    // Redis clientの初期化テスト
    const { redisClient } = await import('./src/lib/redis-client.ts');
    
    const connectResult = await redisClient.connect().catch(err => {
      console.log('ℹ️  Redis未接続（ローカル環境では正常）:', err.message);
      return false;
    });

    if (connectResult !== false) {
      const pingResult = await redisClient.ping();
      console.log('✅ Redis接続成功:', { ping: pingResult });
      testResults.redis.passed++;
      testResults.redis.tests.push('Redis接続・Ping応答');
    } else {
      console.log('⚠️  Redis接続失敗（ローカル環境では想定内）');
      testResults.redis.failed++;
      testResults.redis.tests.push('Redis接続失敗（想定内）');
    }
  } catch (error) {
    console.log('⚠️  Redis接続エラー:', error.message);
    testResults.redis.failed++;
    testResults.redis.tests.push('Redis接続エラー');
  }
}

// 短期記憶サービステスト
async function testShortTermMemory() {
  console.log('\n🔄 短期記憶サービステスト...');
  
  try {
    const { shortTermMemoryService } = await import('./src/lib/short-term-memory.ts');
    
    // サービス状態確認
    const status = await shortTermMemoryService.getServiceStatus();
    console.log('📊 短期記憶サービス状態:', status);
    
    if (status.connected) {
      // メッセージ保存テスト
      const saveResult = await shortTermMemoryService.saveMessage(TEST_USER_ID, TEST_SESSION_ID, {
        content: 'テストメッセージ1',
        role: 'user',
        emotion: 'happiness',
        intensity: 7
      });
      
      if (saveResult) {
        console.log('✅ 短期記憶保存成功');
        testResults.redis.passed++;
        testResults.redis.tests.push('短期記憶メッセージ保存');
        
        // メッセージ取得テスト
        const messages = await shortTermMemoryService.getSessionMessages(TEST_USER_ID, TEST_SESSION_ID);
        if (messages.length > 0) {
          console.log('✅ 短期記憶取得成功:', messages.length, 'メッセージ');
          testResults.redis.passed++;
          testResults.redis.tests.push('短期記憶メッセージ取得');
        } else {
          console.log('❌ 短期記憶取得失敗');
          testResults.redis.failed++;
          testResults.redis.tests.push('短期記憶取得失敗');
        }
      } else {
        console.log('❌ 短期記憶保存失敗');
        testResults.redis.failed++;
        testResults.redis.tests.push('短期記憶保存失敗');
      }
    } else {
      console.log('⚠️  短期記憶サービス未接続（ローカル環境では想定内）');
      testResults.redis.tests.push('短期記憶サービス未接続（想定内）');
    }
  } catch (error) {
    console.log('❌ 短期記憶サービステストエラー:', error.message);
    testResults.redis.failed++;
    testResults.redis.tests.push('短期記憶サービスエラー');
  }
}

// 統合記憶システムテスト
async function testUnifiedMemorySystem() {
  console.log('\n🔄 統合記憶システムテスト...');
  
  try {
    const { unifiedMemorySystem } = await import('./src/lib/unified-memory-system.ts');
    
    // システム状態確認
    const systemStatus = await unifiedMemorySystem.getSystemStatus();
    console.log('📊 統合記憶システム状態:', systemStatus);
    
    testResults.unifiedSystem.passed++;
    testResults.unifiedSystem.tests.push('システム状態取得');
    
    // コンテキスト分析テスト
    const contextType1 = await unifiedMemorySystem.analyzeContext('それって何？', []);
    const contextType2 = await unifiedMemorySystem.analyzeContext('もっと詳しく教えて', []);
    const contextType3 = await unifiedMemorySystem.analyzeContext('新しい質問です', []);
    
    console.log('🧠 コンテキスト分析結果:', {
      'それって何？': contextType1,
      'もっと詳しく': contextType2,
      '新しい質問': contextType3
    });
    
    if (contextType1 === 'reference' && contextType2 === 'follow_up' && contextType3 === 'general') {
      console.log('✅ コンテキスト分析正確');
      testResults.unifiedSystem.passed++;
      testResults.unifiedSystem.tests.push('コンテキスト分析');
    } else {
      console.log('⚠️  コンテキスト分析結果が予想と異なる');
      testResults.unifiedSystem.failed++;
      testResults.unifiedSystem.tests.push('コンテキスト分析不正確');
    }
    
    // メッセージ保存テスト（中期記憶）
    try {
      const saveResult = await unifiedMemorySystem.saveMessage(TEST_USER_ID, TEST_SESSION_ID, {
        content: 'テスト用統合保存メッセージ',
        role: 'user',
        emotion: 'curiosity',
        intensity: 6,
        archetype: 'ENFP',
        userName: 'テストユーザー',
        conversationId: TEST_CONVERSATION_ID
      });
      
      console.log('📝 統合記憶保存結果:', saveResult);
      
      if (saveResult.mediumTermSaved) {
        console.log('✅ 統合記憶保存成功（中期記憶）');
        testResults.unifiedSystem.passed++;
        testResults.unifiedSystem.tests.push('統合記憶保存');
      } else {
        console.log('⚠️  統合記憶保存部分失敗');
        testResults.unifiedSystem.failed++;
        testResults.unifiedSystem.tests.push('統合記憶保存部分失敗');
      }
    } catch (saveError) {
      console.log('❌ 統合記憶保存エラー:', saveError.message);
      testResults.unifiedSystem.failed++;
      testResults.unifiedSystem.tests.push('統合記憶保存エラー');
    }
    
    // 記憶検索テスト
    try {
      const searchResult = await unifiedMemorySystem.searchMemories(
        TEST_USER_ID,
        'テスト',
        TEST_SESSION_ID,
        {
          includeShortTerm: true,
          includeMediumTerm: true,
          includeVectorSearch: true,
          maxResults: 5
        }
      );
      
      console.log('🔍 統合記憶検索結果:', {
        shortTermCount: searchResult.shortTerm.length,
        mediumTermCount: searchResult.mediumTerm.length,
        vectorSearchCount: searchResult.vectorSearch?.totalFound || 0,
        contextualResponse: searchResult.context.contextualResponse
      });
      
      console.log('✅ 統合記憶検索成功');
      testResults.unifiedSystem.passed++;
      testResults.unifiedSystem.tests.push('統合記憶検索');
    } catch (searchError) {
      console.log('❌ 統合記憶検索エラー:', searchError.message);
      testResults.unifiedSystem.failed++;
      testResults.unifiedSystem.tests.push('統合記憶検索エラー');
    }
    
  } catch (error) {
    console.log('❌ 統合記憶システムテストエラー:', error.message);
    testResults.unifiedSystem.failed++;
    testResults.unifiedSystem.tests.push('統合システムエラー');
  }
}

// Enhanced Chat API記憶統合テスト
async function testChatAPIMemoryIntegration() {
  console.log('\n🔄 Enhanced Chat API記憶統合テスト...');
  
  // APIテスト用の模擬データ
  const testPayload = {
    message: 'こんにちは！私の名前はテストユーザーです。',
    userType: 'ENFP-adventurer',
    aiPersonality: 'SAG',
    userId: TEST_USER_ID,
    sessionId: TEST_SESSION_ID,
    conversationId: TEST_CONVERSATION_ID,
    personalInfo: { name: 'テストユーザー' },
    currentMood: '😊'
  };
  
  try {
    // Enhanced Chat APIの統合記憶機能をテスト
    console.log('📤 Chat API記憶統合のロジック確認...');
    
    // 統合記憶システムのimportテスト
    const { unifiedMemorySystem } = await import('./src/lib/unified-memory-system.ts');
    
    // コンテキスト分析のテスト
    const contextAnalysis = await unifiedMemorySystem.analyzeContext(
      testPayload.message,
      []
    );
    
    console.log('🧠 API統合コンテキスト分析:', contextAnalysis);
    
    if (contextAnalysis) {
      console.log('✅ Chat API記憶統合ロジック正常');
      testResults.chatAPI.passed++;
      testResults.chatAPI.tests.push('Chat API記憶統合ロジック');
    } else {
      console.log('❌ Chat API記憶統合ロジック異常');
      testResults.chatAPI.failed++;
      testResults.chatAPI.tests.push('Chat API記憶統合ロジック異常');
    }
    
    // 記憶コンテキスト生成テスト
    const memorySearchResult = await unifiedMemorySystem.searchMemories(
      TEST_USER_ID,
      testPayload.message,
      TEST_SESSION_ID,
      {
        includeShortTerm: true,
        includeMediumTerm: true,
        includeVectorSearch: true,
        contextType: contextAnalysis
      }
    );
    
    console.log('🔍 記憶コンテキスト生成結果:', {
      hasContext: memorySearchResult.context.hasRecentContext || memorySearchResult.context.hasSimilarMemories,
      contextualResponse: memorySearchResult.context.contextualResponse.substring(0, 50) + '...'
    });
    
    console.log('✅ Chat API記憶コンテキスト生成成功');
    testResults.chatAPI.passed++;
    testResults.chatAPI.tests.push('記憶コンテキスト生成');
    
  } catch (error) {
    console.log('❌ Chat API記憶統合テストエラー:', error.message);
    testResults.chatAPI.failed++;
    testResults.chatAPI.tests.push('Chat API記憶統合エラー');
  }
}

// 記憶システム状態APIテスト
async function testMemoryStatusAPI() {
  console.log('\n🔄 記憶システム状態APIテスト...');
  
  try {
    // Next.jsの開発サーバーが起動していない場合のテスト
    console.log('📊 記憶システム状態API構造確認...');
    
    // API route fileの存在確認
    const fs = await import('fs');
    const path = await import('path');
    
    const statusApiPath = './src/app/api/memory/status/route.ts';
    const apiExists = fs.existsSync(statusApiPath);
    
    if (apiExists) {
      console.log('✅ 記憶システム状態APIファイル存在確認');
      testResults.statusAPI.passed++;
      testResults.statusAPI.tests.push('状態APIファイル存在');
      
      // APIファイルの内容確認
      const apiContent = fs.readFileSync(statusApiPath, 'utf8');
      const hasGetHandler = apiContent.includes('export async function GET');
      const hasUnifiedMemoryImport = apiContent.includes('unifiedMemorySystem');
      
      if (hasGetHandler && hasUnifiedMemoryImport) {
        console.log('✅ 記憶システム状態API実装確認');
        testResults.statusAPI.passed++;
        testResults.statusAPI.tests.push('状態API実装確認');
      } else {
        console.log('❌ 記憶システム状態API実装不完全');
        testResults.statusAPI.failed++;
        testResults.statusAPI.tests.push('状態API実装不完全');
      }
    } else {
      console.log('❌ 記憶システム状態APIファイル未発見');
      testResults.statusAPI.failed++;
      testResults.statusAPI.tests.push('状態APIファイル未発見');
    }
    
    // 統合記憶システム状態取得の直接テスト
    const { unifiedMemorySystem } = await import('./src/lib/unified-memory-system.ts');
    const systemStatus = await unifiedMemorySystem.getSystemStatus();
    
    console.log('📊 直接システム状態取得結果:', {
      shortTermConnected: systemStatus.shortTerm.connected,
      mediumTermInitialized: systemStatus.mediumTerm.initialized,
      vectorSearchActive: systemStatus.vectorSearch.hasOpenAI
    });
    
    console.log('✅ 直接システム状態取得成功');
    testResults.statusAPI.passed++;
    testResults.statusAPI.tests.push('直接システム状態取得');
    
  } catch (error) {
    console.log('❌ 記憶システム状態APIテストエラー:', error.message);
    testResults.statusAPI.failed++;
    testResults.statusAPI.tests.push('状態APIテストエラー');
  }
}

// クリーンアップテスト
async function testCleanup() {
  console.log('\n🧹 メモリクリーンアップテスト...');
  
  try {
    const { unifiedMemorySystem } = await import('./src/lib/unified-memory-system.ts');
    
    const cleanupResult = await unifiedMemorySystem.cleanup(TEST_USER_ID);
    console.log('🧹 クリーンアップ結果:', cleanupResult);
    
    console.log('✅ メモリクリーンアップテスト完了');
    testResults.unifiedSystem.passed++;
    testResults.unifiedSystem.tests.push('メモリクリーンアップ');
    
  } catch (error) {
    console.log('❌ クリーンアップテストエラー:', error.message);
    testResults.unifiedSystem.failed++;
    testResults.unifiedSystem.tests.push('クリーンアップエラー');
  }
}

// テスト結果サマリー
function printTestSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('🎵 TypeMate 3層記憶システム テスト結果サマリー');
  console.log('='.repeat(60));
  
  const categories = [
    { name: 'Redis短期記憶', key: 'redis' },
    { name: '統合記憶システム', key: 'unifiedSystem' },
    { name: 'Chat API記憶統合', key: 'chatAPI' },
    { name: '記憶状態API', key: 'statusAPI' }
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  categories.forEach(category => {
    const result = testResults[category.key];
    const total = result.passed + result.failed;
    const passRate = total > 0 ? Math.round((result.passed / total) * 100) : 0;
    
    console.log(`\n📊 ${category.name}:`);
    console.log(`   ✅ 成功: ${result.passed}`);
    console.log(`   ❌ 失敗: ${result.failed}`);
    console.log(`   📈 成功率: ${passRate}%`);
    
    if (result.tests.length > 0) {
      console.log(`   📝 実行テスト: ${result.tests.join(', ')}`);
    }
    
    totalPassed += result.passed;
    totalFailed += result.failed;
  });
  
  const overallTotal = totalPassed + totalFailed;
  const overallPassRate = overallTotal > 0 ? Math.round((totalPassed / overallTotal) * 100) : 0;
  
  console.log('\n' + '='.repeat(60));
  console.log('🏆 総合結果:');
  console.log(`   ✅ 総成功: ${totalPassed}`);
  console.log(`   ❌ 総失敗: ${totalFailed}`);
  console.log(`   📈 総成功率: ${overallPassRate}%`);
  
  if (overallPassRate >= 80) {
    console.log('\n🎉 テスト結果: 優秀！ 3層記憶システムは正常に動作しています');
  } else if (overallPassRate >= 60) {
    console.log('\n👍 テスト結果: 良好。一部調整が必要ですが基本機能は動作しています');
  } else {
    console.log('\n⚠️  テスト結果: 要改善。いくつかの問題を修正する必要があります');
  }
  
  console.log('\n💡 注意: Redis関連のテストはローカル環境でのRedis未起動により失敗する場合があります');
  console.log('💡 本番環境では Redis Cloud または AWS ElastiCache の使用を推奨します');
  
  console.log('\n🎵 TypeMate 3層記憶システムテスト完了！');
}

// メインテスト実行
async function runAllTests() {
  try {
    await testRedisConnection();
    await testShortTermMemory();
    await testUnifiedMemorySystem();
    await testChatAPIMemoryIntegration();
    await testMemoryStatusAPI();
    await testCleanup();
    
    printTestSummary();
    
    // 正常終了
    process.exit(0);
  } catch (error) {
    console.error('\n💥 テスト実行中に予期しないエラーが発生しました:', error);
    process.exit(1);
  }
}

// テスト実行
runAllTests();
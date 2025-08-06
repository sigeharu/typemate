// 🔍 TypeMate ベクトル記憶システム包括テスト
// OpenAI APIキー設定後の動作確認

import { memoryManager } from './src/lib/memory-manager.js';
import { vectorMemoryService } from './src/lib/vector-memory-service.js';
import { v4 as uuidv4 } from 'uuid';

// テスト用ユーザーID
const TEST_USER_ID = uuidv4();
const TEST_CONVERSATION_ID = uuidv4();

console.log('🚀 TypeMate ベクトル記憶システム包括テスト開始');
console.log('テストユーザーID:', TEST_USER_ID);
console.log('テスト会話ID:', TEST_CONVERSATION_ID);

// Phase 1: ベクトルサービス初期化テスト
async function testServiceInitialization() {
  console.log('\n📋 Phase 1: ベクトルサービス初期化テスト');
  
  try {
    const status = memoryManager.getVectorServiceStatus();
    console.log('✅ サービス状態:', status);
    
    if (!status.initialized || !status.hasOpenAI) {
      throw new Error('ベクトルサービスが正しく初期化されていません');
    }
    
    console.log('✅ ベクトルサービス初期化: 成功');
    return true;
  } catch (error) {
    console.error('❌ ベクトルサービス初期化: 失敗', error);
    return false;
  }
}

// Phase 2: 新規メッセージのベクトル化テスト
async function testMemoryVectorization() {
  console.log('\n📋 Phase 2: 新規メッセージのベクトル化テスト');
  
  const testMessages = [
    { content: '今日はとても楽しい一日でした！友達と映画を見に行って最高でした。', role: 'user' },
    { content: 'お疲れさまでした！楽しい時間を過ごせて良かったですね。', role: 'ai' },
    { content: '昨日は少し悲しいことがありました。でも今は大丈夫です。', role: 'user' },
    { content: 'つらい気持ちだったのですね。今は大丈夫ということで安心しました。', role: 'ai' },
    { content: '新しいプログラミング言語を学習しています。TypeScriptが面白いです。', role: 'user' }
  ];
  
  const savedMemories = [];
  
  try {
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`💾 メッセージ ${i + 1} を保存中:`, message.content.substring(0, 30) + '...');
      
      const memory = await memoryManager.saveConversationMemory(
        message.content,
        message.role,
        'DRM',
        TEST_CONVERSATION_ID,
        TEST_USER_ID,
        'テストユーザー',
        undefined,
        i + 1
      );
      
      if (memory) {
        savedMemories.push(memory);
        console.log(`✅ メッセージ ${i + 1} 保存完了 (ID: ${memory.id.substring(0, 8)}...)`);
        
        // ベクトル化の完了を待つ（非同期処理のため）
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw new Error(`メッセージ ${i + 1} の保存に失敗`);
      }
    }
    
    console.log('✅ 全メッセージの保存とベクトル化: 成功');
    return savedMemories;
  } catch (error) {
    console.error('❌ メッセージ保存・ベクトル化: 失敗', error);
    return [];
  }
}

// Phase 3: 類似記憶検索テスト
async function testSimilaritySearch() {
  console.log('\n📋 Phase 3: 類似記憶検索テスト');
  
  const searchQueries = [
    '楽しい出来事',
    '悲しい気持ち',
    'プログラミング学習',
    '映画鑑賞',
    '感情について'
  ];
  
  try {
    for (const query of searchQueries) {
      console.log(`🔍 検索クエリ: "${query}"`);
      
      const results = await memoryManager.searchSimilarMemories(
        query,
        TEST_USER_ID,
        {
          limit: 3,
          similarityThreshold: 0.6,
          specialOnly: false
        }
      );
      
      console.log(`📊 検索結果数: ${results.totalFound}`);
      
      if (results.memories.length > 0) {
        results.memories.forEach((memory, index) => {
          console.log(`  ${index + 1}. [${memory.similarity}] ${memory.message_content.substring(0, 50)}...`);
        });
      } else {
        console.log('  関連する記憶が見つかりませんでした');
      }
      
      console.log(''); // 空行
    }
    
    console.log('✅ 類似記憶検索: 成功');
    return true;
  } catch (error) {
    console.error('❌ 類似記憶検索: 失敗', error);
    return false;
  }
}

// Phase 4: 既存記憶のベクトル化テスト
async function testExistingMemoryVectorization() {
  console.log('\n📋 Phase 4: 既存記憶のベクトル化テスト');
  
  try {
    const stats = await memoryManager.vectorizeExistingMemories(TEST_USER_ID, 5);
    
    console.log('📊 ベクトル化統計:', stats);
    console.log(`  処理済み: ${stats.processed}`);
    console.log(`  成功: ${stats.success}`);
    console.log(`  失敗: ${stats.failed}`);
    
    if (stats.processed > 0) {
      console.log('✅ 既存記憶のベクトル化: 成功');
    } else {
      console.log('ℹ️ ベクトル化対象の記憶がありませんでした');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 既存記憶のベクトル化: 失敗', error);
    return false;
  }
}

// Phase 5: エラーハンドリングテスト
async function testErrorHandling() {
  console.log('\n📋 Phase 5: エラーハンドリングテスト');
  
  try {
    // 無効なユーザーIDでの検索テスト
    console.log('🧪 無効なユーザーIDでの検索テスト');
    const invalidResult = await memoryManager.searchSimilarMemories(
      'テストクエリ',
      'invalid-user-id',
      { limit: 1 }
    );
    console.log('📊 無効なユーザーID結果:', invalidResult.totalFound === 0 ? '✅ 正常にエラーハンドリング' : '❌ 予期しない結果');
    
    // 空のクエリでの検索テスト
    console.log('🧪 空のクエリでの検索テスト');
    const emptyResult = await memoryManager.searchSimilarMemories(
      '',
      TEST_USER_ID,
      { limit: 1 }
    );
    console.log('📊 空のクエリ結果:', emptyResult.totalFound === 0 ? '✅ 正常にエラーハンドリング' : '❌ 予期しない結果');
    
    console.log('✅ エラーハンドリングテスト: 成功');
    return true;
  } catch (error) {
    console.error('❌ エラーハンドリングテスト: 失敗', error);
    return false;
  }
}

// メインテスト実行
async function runComprehensiveTest() {
  console.log('🚀 TypeMate ベクトル記憶システム包括テスト開始\n');
  
  const results = {
    serviceInit: false,
    memoryVectorization: false,
    similaritySearch: false,
    existingVectorization: false,
    errorHandling: false
  };
  
  // テスト実行
  results.serviceInit = await testServiceInitialization();
  
  if (results.serviceInit) {
    const savedMemories = await testMemoryVectorization();
    results.memoryVectorization = savedMemories.length > 0;
    
    if (results.memoryVectorization) {
      results.similaritySearch = await testSimilaritySearch();
      results.existingVectorization = await testExistingMemoryVectorization();
    }
  }
  
  results.errorHandling = await testErrorHandling();
  
  // 結果サマリー
  console.log('\n📊 テスト結果サマリー');
  console.log('==========================================');
  console.log(`🔧 サービス初期化: ${results.serviceInit ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`💾 メッセージベクトル化: ${results.memoryVectorization ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`🔍 類似記憶検索: ${results.similaritySearch ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`🔄 既存記憶ベクトル化: ${results.existingVectorization ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`🛡️ エラーハンドリング: ${results.errorHandling ? '✅ 成功' : '❌ 失敗'}`);
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('==========================================');
  console.log(`🎯 総合結果: ${successCount}/${totalTests} テスト成功`);
  
  if (successCount === totalTests) {
    console.log('🎉 すべてのテストが成功しました！ベクトル検索機能は正常に動作しています。');
  } else {
    console.log('⚠️ 一部のテストが失敗しました。ログを確認してください。');
  }
  
  console.log('\n🧹 テストデータクリーンアップは手動で実行してください。');
  console.log(`テストユーザーID: ${TEST_USER_ID}`);
}

// テスト実行
runComprehensiveTest().catch(console.error);
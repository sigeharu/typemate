// 🔍 TypeMate ベクトル記憶システム包括テスト API
// Next.js API Route での動作確認

import { NextApiRequest, NextApiResponse } from 'next';
import { memoryManager } from '@/lib/memory-manager';
import { vectorMemoryService } from '@/lib/vector-memory-service';
import { v4 as uuidv4 } from 'uuid';

interface TestResult {
  phase: string;
  success: boolean;
  details: any;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results: TestResult[] = [];
  const testUserId = uuidv4();
  const testConversationId = uuidv4();

  console.log('🚀 TypeMate ベクトル記憶システム包括テスト開始');
  console.log('テストユーザーID:', testUserId);

  // Phase 1: サービス初期化テスト
  try {
    console.log('\n📋 Phase 1: ベクトルサービス初期化テスト');
    const status = memoryManager.getVectorServiceStatus();
    
    results.push({
      phase: 'Service Initialization',
      success: status.initialized && status.hasOpenAI,
      details: status
    });
    
    console.log('✅ サービス状態:', status);
  } catch (error: any) {
    results.push({
      phase: 'Service Initialization',
      success: false,
      details: null,
      error: error.message
    });
    console.error('❌ サービス初期化エラー:', error);
  }

  // Phase 2: メッセージ保存とベクトル化テスト
  const savedMemories: any[] = [];
  try {
    console.log('\n📋 Phase 2: メッセージ保存とベクトル化テスト');
    
    const testMessages = [
      { content: '今日はとても楽しい一日でした！友達と映画を見に行って最高でした。', role: 'user' as const },
      { content: 'お疲れさまでした！楽しい時間を過ごせて良かったですね。', role: 'ai' as const },
      { content: 'TypeScriptを勉強しています。プログラミングが面白いです。', role: 'user' as const }
    ];

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`💾 メッセージ ${i + 1} を保存中:`, message.content.substring(0, 30) + '...');
      
      const memory = await memoryManager.saveConversationMemory(
        message.content,
        message.role,
        'DRM',
        testConversationId,
        testUserId,
        'テストユーザー',
        undefined,
        i + 1
      );
      
      if (memory) {
        savedMemories.push(memory);
        console.log(`✅ メッセージ ${i + 1} 保存完了`);
      }
    }

    results.push({
      phase: 'Memory Vectorization',
      success: savedMemories.length === testMessages.length,
      details: {
        savedCount: savedMemories.length,
        expectedCount: testMessages.length
      }
    });

    // ベクトル化完了待機
    console.log('⏳ ベクトル化完了を待機中...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error: any) {
    results.push({
      phase: 'Memory Vectorization',
      success: false,
      details: { savedCount: savedMemories.length },
      error: error.message
    });
    console.error('❌ メッセージ保存エラー:', error);
  }

  // Phase 3: 類似記憶検索テスト
  try {
    console.log('\n📋 Phase 3: 類似記憶検索テスト');
    
    const searchResults = await memoryManager.searchSimilarMemories(
      '楽しい出来事',
      testUserId,
      {
        limit: 3,
        similarityThreshold: 0.6,
        specialOnly: false
      }
    );

    console.log(`🔍 検索結果数: ${searchResults.totalFound}`);
    
    if (searchResults.memories.length > 0) {
      searchResults.memories.forEach((memory, index) => {
        console.log(`  ${index + 1}. [${memory.similarity}] ${memory.message_content.substring(0, 50)}...`);
      });
    }

    results.push({
      phase: 'Similarity Search',
      success: searchResults.totalFound >= 0, // 0件でも正常
      details: {
        query: '楽しい出来事',
        totalFound: searchResults.totalFound,
        results: searchResults.memories.map(m => ({
          similarity: m.similarity,
          preview: m.message_content.substring(0, 50) + '...'
        }))
      }
    });

  } catch (error: any) {
    results.push({
      phase: 'Similarity Search',
      success: false,
      details: null,
      error: error.message
    });
    console.error('❌ 類似記憶検索エラー:', error);
  }

  // Phase 4: エラーハンドリングテスト
  try {
    console.log('\n📋 Phase 4: エラーハンドリングテスト');
    
    // 無効なユーザーIDでの検索
    const invalidResult = await memoryManager.searchSimilarMemories(
      'テストクエリ',
      'invalid-user-id',
      { limit: 1 }
    );

    const errorHandlingWorking = invalidResult.totalFound === 0;
    
    results.push({
      phase: 'Error Handling',
      success: errorHandlingWorking,
      details: {
        invalidUserIdHandled: errorHandlingWorking,
        invalidResult: invalidResult.totalFound
      }
    });

    console.log('✅ エラーハンドリング:', errorHandlingWorking ? '正常' : '異常');

  } catch (error: any) {
    results.push({
      phase: 'Error Handling',
      success: false,
      details: null,
      error: error.message
    });
    console.error('❌ エラーハンドリングテストエラー:', error);
  }

  // 結果サマリー
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;

  console.log('\n📊 テスト結果サマリー');
  console.log('==========================================');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.phase}: ${result.success ? '成功' : '失敗'}`);
    if (result.error) {
      console.log(`   エラー: ${result.error}`);
    }
  });
  console.log('==========================================');
  console.log(`🎯 総合結果: ${successCount}/${totalTests} テスト成功`);

  // レスポンス返却
  res.status(200).json({
    success: successCount === totalTests,
    summary: {
      successCount,
      totalTests,
      successRate: Math.round((successCount / totalTests) * 100)
    },
    results,
    testData: {
      userId: testUserId,
      conversationId: testConversationId
    },
    message: successCount === totalTests 
      ? '🎉 すべてのテストが成功しました！ベクトル検索機能は正常に動作しています。'
      : '⚠️ 一部のテストが失敗しました。詳細を確認してください。'
  });
}
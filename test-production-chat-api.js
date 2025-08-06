#!/usr/bin/env node

// 🎵 TypeMate 本番環境 Chat API テスト
// Enhanced Chat APIの動作確認とエラー診断

console.log('🎵 TypeMate 本番環境 Chat API テスト開始\n');

const PROD_BASE_URL = 'https://typemate-zeta.vercel.app';
const TEST_USER_ID = 'test-user-' + Date.now();

// テスト用ペイロード
const testChatPayload = {
  message: 'こんにちは！私の名前はテストユーザーです。',
  userType: 'ENFP-adventurer',
  aiPersonality: 'SAG',
  userId: TEST_USER_ID,
  relationshipType: 'friend',
  messageHistory: [],
  conversationTurn: 1,
  currentMood: '😊',
  moodContext: 'テスト中です',
  personalInfo: { name: 'テストユーザー' },
  chatCount: 1,
  sessionId: 'test-session-' + Date.now(),
  conversationId: 'test-conv-' + Date.now()
};

async function testChatAPIEndpoint() {
  console.log('🔄 Enhanced Chat API テスト...');
  
  try {
    const response = await fetch(`${PROD_BASE_URL}/api/chat/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TypeMate-Test-Client/1.0'
      },
      body: JSON.stringify(testChatPayload)
    });
    
    console.log('📊 レスポンス情報:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    console.log('📝 レスポンス内容 (最初の500文字):');
    console.log(responseText.substring(0, 500));
    console.log('...\n');
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Chat API 成功:', {
          hasContent: !!data.content,
          hasEmotion: !!data.emotion,
          hasMemoryContext: !!data.memoryContext,
          tokensUsed: data.tokens_used
        });
        
        if (data.memoryContext) {
          console.log('🧠 メモリコンテキスト:', {
            contextualResponse: data.memoryContext.contextualResponse?.substring(0, 100) + '...',
            hasMemoryContext: data.memoryContext.hasMemoryContext,
            sessionId: data.memoryContext.sessionId?.substring(0, 15) + '...'
          });
        }
        
        return { success: true, data };
      } catch (parseError) {
        console.log('❌ JSON解析エラー:', parseError.message);
        return { success: false, error: 'JSON解析失敗', response: responseText };
      }
    } else {
      console.log('❌ Chat API エラー:', {
        status: response.status,
        response: responseText
      });
      return { success: false, error: `HTTP ${response.status}`, response: responseText };
    }
  } catch (error) {
    console.log('❌ ネットワークエラー:', error.message);
    return { success: false, error: 'ネットワークエラー', details: error.message };
  }
}

async function testMemoryStatusAPI() {
  console.log('\n🔄 Memory Status API テスト...');
  
  try {
    const response = await fetch(`${PROD_BASE_URL}/api/memory/status`, {
      method: 'GET',
      headers: {
        'User-Agent': 'TypeMate-Test-Client/1.0'
      }
    });
    
    console.log('📊 Memory Status レスポンス:', {
      status: response.status,
      statusText: response.statusText
    });
    
    const responseText = await response.text();
    console.log('📝 Memory Status内容:', responseText.substring(0, 300));
    
    if (response.status === 403) {
      console.log('ℹ️  セキュリティ検証により403エラー（想定内）');
      return { success: true, note: 'セキュリティ検証により正常にブロック' };
    } else {
      return { success: response.ok, response: responseText };
    }
  } catch (error) {
    console.log('❌ Memory Status API エラー:', error.message);
    return { success: false, error: error.message };
  }
}

async function testBasicChatAPI() {
  console.log('\n🔄 Basic Chat API テスト...');
  
  const basicPayload = {
    message: 'Hello',
    userId: TEST_USER_ID,
    archetype: 'SAG'
  };
  
  try {
    const response = await fetch(`${PROD_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TypeMate-Test-Client/1.0'
      },
      body: JSON.stringify(basicPayload)
    });
    
    console.log('📊 Basic Chat レスポンス:', {
      status: response.status,
      statusText: response.statusText
    });
    
    const responseText = await response.text();
    console.log('📝 Basic Chat内容:', responseText.substring(0, 300));
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        return { success: true, data };
      } catch (parseError) {
        return { success: false, error: 'JSON解析失敗', response: responseText };
      }
    } else {
      return { success: false, error: `HTTP ${response.status}`, response: responseText };
    }
  } catch (error) {
    console.log('❌ Basic Chat API エラー:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔄 環境変数テスト（間接的）...');
  
  // API応答からサービス状態を推測
  const services = {
    claude: false,
    openai: false,
    redis: false,
    supabase: false
  };
  
  try {
    // Enhanced Chat APIを通じてサービス状態を確認
    const chatResult = await testChatAPIEndpoint();
    
    if (chatResult.success) {
      if (chatResult.data.content) {
        services.claude = true;
        console.log('✅ Claude API: 動作中');
      }
      if (chatResult.data.memoryContext) {
        services.supabase = true;
        console.log('✅ Supabase: 動作中');
        
        if (chatResult.data.memoryContext.sessionId) {
          services.redis = true;
          console.log('✅ Redis: 動作中（セッションID生成）');
        }
      }
    }
    
    return services;
  } catch (error) {
    console.log('❌ 環境変数テストエラー:', error.message);
    return services;
  }
}

async function runDiagnostics() {
  console.log('🔍 詳細診断実行中...\n');
  
  const results = {
    enhancedChat: await testChatAPIEndpoint(),
    basicChat: await testBasicChatAPI(),
    memoryStatus: await testMemoryStatusAPI(),
    services: await testEnvironmentVariables()
  };
  
  // 診断結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('🎵 TypeMate 本番環境診断結果');
  console.log('='.repeat(60));
  
  console.log('\n📊 API エンドポイント状況:');
  console.log(`   Enhanced Chat API: ${results.enhancedChat.success ? '✅ 正常' : '❌ エラー'}`);
  console.log(`   Basic Chat API: ${results.basicChat.success ? '✅ 正常' : '❌ エラー'}`);
  console.log(`   Memory Status API: ${results.memoryStatus.success ? '✅ 正常' : '❌ エラー'}`);
  
  console.log('\n🔧 サービス状況:');
  console.log(`   Claude API: ${results.services.claude ? '✅ 動作中' : '❌ 問題有'}`);
  console.log(`   Supabase DB: ${results.services.supabase ? '✅ 動作中' : '❌ 問題有'}`);
  console.log(`   Redis Memory: ${results.services.redis ? '✅ 動作中' : '❌ 問題有'}`);
  
  // 問題分析
  const issues = [];
  if (!results.enhancedChat.success) {
    issues.push('Enhanced Chat API に問題があります');
    if (results.enhancedChat.error) {
      console.log(`   エラー詳細: ${results.enhancedChat.error}`);
    }
  }
  
  if (!results.services.claude) {
    issues.push('Claude APIキーまたは接続に問題がある可能性があります');
  }
  
  if (!results.services.supabase) {
    issues.push('Supabaseデータベース接続に問題がある可能性があります');
  }
  
  if (!results.services.redis) {
    issues.push('Redis短期記憶システムに問題がある可能性があります');
  }
  
  console.log('\n🚨 発見された問題:');
  if (issues.length === 0) {
    console.log('   問題は検出されませんでした！🎉');
  } else {
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  // 推奨対応
  console.log('\n💡 推奨対応:');
  if (issues.length === 0) {
    console.log('   🎵 TypeMateは正常に動作しています！');
    console.log('   ユーザーインターフェースの問題を確認してください。');
  } else {
    console.log('   1. Vercelダッシュボードで環境変数設定を確認');
    console.log('   2. デプロイメントログでエラーを確認');
    console.log('   3. API キーの有効性を確認');
    console.log('   4. データベース接続状況を確認');
  }
  
  console.log('\n🎵 TypeMate 本番環境診断完了！');
  
  return results;
}

// メイン実行
runDiagnostics().catch(error => {
  console.error('💥 診断実行エラー:', error);
  process.exit(1);
});
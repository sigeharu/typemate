const { chromium } = require('playwright');

async function debugProductionHarmonicAPI() {
  console.log('🔍 本番環境ハーモニックAPI詳細デバッグ開始');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // レスポンス監視設定
    const apiCalls = [];
    const errorDetails = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/chat')) {
        const responseData = {
          url,
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        };
        
        // レスポンスボディを取得（エラーの場合）
        if (response.status() >= 400) {
          try {
            const body = await response.text();
            responseData.body = body;
            errorDetails.push(responseData);
            console.log(`❌ API Error: ${response.status()} ${url}`);
            console.log(`Error Body: ${body}`);
          } catch (e) {
            console.log(`❌ API Error: ${response.status()} ${url} (body読み取り失敗)`);
          }
        }
        
        apiCalls.push(responseData);
      }
    });
    
    // コンソールログ監視
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('🎼') || text.includes('❌') || text.includes('Enhanced Chat')) {
        console.log(`🎵 Frontend Log: ${text}`);
      }
    });
    
    // 1. 本番環境にアクセス
    console.log('🌐 本番環境アクセス中...');
    await page.goto('https://typemate-zeta.vercel.app/chat');
    await page.waitForLoadState('networkidle');
    
    // 2. 認証情報設定
    console.log('🔐 認証情報設定中...');
    await page.evaluate(() => {
      localStorage.setItem('user_id', 'debug-user-harmonic-test-123');
      localStorage.setItem('user_type', 'ARC-COOPERATIVESTABLE');
      localStorage.setItem('selected_ai_personality', 'DRM');
      localStorage.setItem('relationship_type', 'friend');
    });
    
    // 3. ページリロードして設定反映
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 4. ハーモニックAI統合チャットテスト
    console.log('🎼 ハーモニックAI統合チャットテスト開始...');
    
    try {
      // メッセージ入力を試行
      const messageInput = await page.locator('input[type="text"], textarea').first();
      if (await messageInput.isVisible()) {
        await messageInput.fill('ハーモニックAIの同期テストメッセージです');
        
        // 送信ボタンクリック
        const sendButton = await page.locator('button').filter({ hasText: /送信|Send/ }).first();
        if (await sendButton.isVisible()) {
          console.log('📤 メッセージ送信実行...');
          await sendButton.click();
          
          // API レスポンス待機（最大30秒）
          console.log('⏳ API レスポンス待機中...');
          await page.waitForTimeout(30000);
        } else {
          console.log('⚠️ 送信ボタンが見つかりません');
        }
      } else {
        console.log('⚠️ メッセージ入力欄が見つかりません');
      }
    } catch (chatError) {
      console.log(`⚠️ チャットUI操作エラー: ${chatError.message}`);
    }
    
    // 5. 結果分析
    console.log('\n📊 API呼び出し結果分析:');
    console.log(`Total API calls: ${apiCalls.length}`);
    
    const enhancedAPICalls = apiCalls.filter(call => call.url.includes('/enhanced'));
    const basicAPICalls = apiCalls.filter(call => call.url.includes('/chat') && !call.url.includes('/enhanced'));
    
    console.log(`Enhanced API calls: ${enhancedAPICalls.length}`);
    console.log(`Basic API calls: ${basicAPICalls.length}`);
    
    if (enhancedAPICalls.length > 0) {
      console.log('\n🎼 Enhanced API詳細:');
      enhancedAPICalls.forEach((call, index) => {
        console.log(`  ${index + 1}. Status: ${call.status}, Time: ${call.timestamp}`);
        if (call.body) {
          console.log(`     Error: ${call.body}`);
        }
      });
    }
    
    if (errorDetails.length > 0) {
      console.log('\n❌ エラー詳細分析:');
      errorDetails.forEach((error, index) => {
        console.log(`Error ${index + 1}:`);
        console.log(`  URL: ${error.url}`);
        console.log(`  Status: ${error.status} ${error.statusText}`);
        console.log(`  Time: ${error.timestamp}`);
        if (error.body) {
          console.log(`  Body: ${error.body}`);
        }
      });
    }
    
    // 6. 本番ログ確認（可能であれば）
    console.log('\n📋 本番環境で期待される動作:');
    console.log('1. ハーモニックプロファイル取得成功');
    console.log('2. コズミックガイダンス生成成功');
    console.log('3. Enhanced Chat API 成功（現在500エラー）');
    console.log('4. フォールバック動作確認');
    
    return {
      success: errorDetails.length === 0,
      enhancedAPICalls,
      basicAPICalls,
      errorDetails,
      totalAPICalls: apiCalls.length
    };
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 実行
debugProductionHarmonicAPI().then(result => {
  console.log('\n🏁 テスト完了:');
  console.log(`Success: ${result.success}`);
  console.log(`Enhanced API calls: ${result.enhancedAPICalls?.length || 0}`);
  console.log(`Error count: ${result.errorDetails?.length || 0}`);
  
  if (!result.success) {
    console.log('\n🎯 次のアクション:');
    console.log('1. サーバーログでStep詳細確認');
    console.log('2. 型不整合の再確認');
    console.log('3. 環境変数確認');
  }
  
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
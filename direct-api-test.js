// 直接APIテスト - Enhanced Chat API の詳細デバッグ

async function testEnhancedChatAPI() {
  console.log('🎼 Enhanced Chat API 直接テスト開始');
  
  const testPayload = {
    message: "ハーモニックAIの同期状況を教えて",
    userType: "ARC-COOPERATIVESTABLE",
    aiPersonality: "DRM",
    userId: "debug-test-user-123",
    relationshipType: "friend",
    messageHistory: [],
    conversationTurn: 0,
    currentMood: "😊",
    moodContext: "",
    personalInfo: {},
    chatCount: 1
  };
  
  try {
    console.log('📤 APIリクエスト送信中...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('https://typemate-zeta.vercel.app/api/chat/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📄 Response Body:');
    console.log(responseText);
    
    if (response.status === 500) {
      console.log('\n❌ 500エラー詳細分析:');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error Object:', errorData);
        if (errorData.details) {
          console.log('Error Details:', errorData.details);
        }
      } catch (parseError) {
        console.log('Raw error response:', responseText);
      }
    }
    
    return {
      status: response.status,
      body: responseText,
      success: response.status === 200
    };
    
  } catch (error) {
    console.error('❌ リクエストエラー:', error);
    return {
      status: 'NETWORK_ERROR',
      error: error.message,
      success: false
    };
  }
}

// 基本APIもテスト
async function testBasicChatAPI() {
  console.log('\n🎵 Basic Chat API テスト開始');
  
  const testPayload = {
    message: "基本APIのテストメッセージです",
    userType: "ARC-COOPERATIVESTABLE",
    aiPersonality: "DRM",
    relationshipType: "friend",
    messageHistory: [],
    conversationTurn: 0,
    currentMood: "😊",
    moodContext: "",
    personalInfo: {},
    chatCount: 1
  };
  
  try {
    const response = await fetch('https://typemate-zeta.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Basic API Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ 基本APIは正常動作');
    } else {
      const errorText = await response.text();
      console.log('❌ 基本APIエラー:', errorText);
    }
    
    return response.status === 200;
    
  } catch (error) {
    console.error('❌ 基本APIエラー:', error);
    return false;
  }
}

// 実行
async function runAllTests() {
  console.log('🔍 TypeMate API総合テスト開始\n');
  
  // Enhanced API テスト
  const enhancedResult = await testEnhancedChatAPI();
  
  // Basic API テスト
  const basicResult = await testBasicChatAPI();
  
  console.log('\n📋 テスト結果サマリー:');
  console.log(`Enhanced API: ${enhancedResult.success ? '✅ 成功' : '❌ 失敗'} (Status: ${enhancedResult.status})`);
  console.log(`Basic API: ${basicResult ? '✅ 成功' : '❌ 失敗'}`);
  
  if (!enhancedResult.success && enhancedResult.status === 500) {
    console.log('\n🎯 第2楽章API修正が必要:');
    console.log('1. サーバーログで詳細エラー確認');
    console.log('2. generateDailyHarmonicGuidance関数の問題調査');
    console.log('3. TodayCosmicGuidance型の完全確認');
  }
  
  return enhancedResult;
}

// Node.js環境で実行
if (typeof require !== 'undefined') {
  runAllTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
} else {
  // ブラウザ環境での実行
  runAllTests();
}
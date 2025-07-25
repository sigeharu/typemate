// 🧪 Supabase API接続テスト
// ブラウザのコンソールで実行してください

// 現在のAPIキーをテスト
const testSupabaseConnection = async () => {
  const supabaseUrl = 'https://ypwvkihattwxushbwsig.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraGF0dHd4dXNoYndzaWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1Mjk4MzQzNSwiZXhwIjoyMDY4NTU5NDM1fQ.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/typemate_memory?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ API接続成功!', response.status);
      const data = await response.json();
      console.log('データ:', data);
    } else {
      console.error('❌ API接続失敗:', response.status, response.statusText);
      const error = await response.text();
      console.error('エラー詳細:', error);
    }
  } catch (error) {
    console.error('💥 接続エラー:', error);
  }
};

// 実行
testSupabaseConnection();
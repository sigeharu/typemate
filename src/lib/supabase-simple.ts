// 🎵 TypeMate Simple Supabase Client
// エラー回避のためのシンプルなSupabaseクライアント

import { createClient } from '@supabase/supabase-js';

// 🛡️ 環境変数フォールバック実装（本番環境での確実な動作を保証）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://ypwvkihattwxushbwsig.supabase.co';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraWhhdHR3eHVzaGJ3c2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODM0MzUsImV4cCI6MjA2ODU1OTQzNX0.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';

// 環境変数使用状況のログ（開発環境のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔐 Supabase Configuration:', {
    usingEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    usingEnvKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url: supabaseUrl.substring(0, 30) + '...'
  });
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-typemate-client': 'simple',
      'x-client-version': '2.0'
    }
  }
});
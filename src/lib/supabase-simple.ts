// 🎵 TypeMate Simple Supabase Client
// エラー回避のためのシンプルなSupabaseクライアント

import { createClient } from '@supabase/supabase-js';

// 🚨 DNS問題緊急修正: 完全ハードコード（正しいURL強制）
const supabaseUrl = 'https://ypwvkihattwxushbwsig.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraWhhdHR3eHVzaGJ3c2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODM0MzUsImV4cCI6MjA2ODU1OTQzNX0.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';

// 🚨 DNS問題デバッグ用：どのURLが使用されているか確認
if (typeof window !== 'undefined') {
  console.log('🔐 Supabase Configuration DEBUG:', {
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    fallbackUrl: 'https://ypwvkihattwxushbwsig.supabase.co',
    finalUrl: supabaseUrl,
    hasCorrectI: supabaseUrl.includes('ypwvkihattwxushbwsig'),
    hasWrongH: supabaseUrl.includes('ypwvkhattwxushbwsig'),
    environment: process.env.NODE_ENV
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
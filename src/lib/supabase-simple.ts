// 🎵 TypeMate Simple Supabase Client
// エラー回避のためのシンプルなSupabaseクライアント

import { createClient } from '@supabase/supabase-js';

// 🛡️ 安全な環境変数設定（フォールバック付き）
const getSupabaseUrl = (): string => {
  // 環境変数を優先、但し検証を実施
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fallbackUrl = 'https://ypwvkihattwxushbwsig.supabase.co';
  
  // 環境変数が設定されている場合
  if (envUrl && envUrl.trim() !== '') {
    // URL形式の検証
    try {
      const url = new URL(envUrl);
      
      // Supabase URLの形式チェック
      const isSupabaseUrl = url.hostname.endsWith('.supabase.co');
      const hasValidProtocol = url.protocol === 'https:';
      
      if (isSupabaseUrl && hasValidProtocol) {
        // 開発環境でのみ詳細ログ
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Using environment variable for Supabase URL:', envUrl);
        }
        return envUrl;
      } else {
        console.warn('⚠️ Invalid Supabase URL format in environment variable, using fallback');
      }
    } catch (error) {
      console.warn('⚠️ Invalid URL format in NEXT_PUBLIC_SUPABASE_URL, using fallback');
    }
  }
  
  // フォールバック使用時の警告（本番環境では重要）
  if (process.env.NODE_ENV === 'production') {
    console.warn('🚨 Using hardcoded Supabase URL in production. Please set NEXT_PUBLIC_SUPABASE_URL');
  } else {
    console.log('🔧 Using fallback Supabase URL for development');
  }
  
  return fallbackUrl;
};

const supabaseUrl = getSupabaseUrl();

// 🛡️ 安全なAPIキー設定（フォールバック付き）
const getSupabaseKey = (): string => {
  // 環境変数を優先、但し検証を実施
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraWhhdHR3eHVzaGJ3c2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODM0MzUsImV4cCI6MjA2ODU1OTQzNX0.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';
  
  // 環境変数が設定されている場合
  if (envKey && envKey.trim() !== '') {
    // JWT形式の基本的な検証
    const jwtPattern = /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/;
    
    if (jwtPattern.test(envKey)) {
      // 開発環境でのみ詳細ログ（キーの一部のみ表示）
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Using environment variable for Supabase API key:', envKey.substring(0, 20) + '...');
      }
      return envKey;
    } else {
      console.warn('⚠️ Invalid API key format in environment variable, using fallback');
    }
  }
  
  // フォールバック使用時の警告（本番環境では重要）
  if (process.env.NODE_ENV === 'production') {
    console.warn('🚨 Using hardcoded Supabase API key in production. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
  } else {
    console.log('🔧 Using fallback Supabase API key for development');
  }
  
  return fallbackKey;
};

const supabaseKey = getSupabaseKey();

// 🛡️ 設定確認用デバッグ（開発環境のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔐 Supabase Configuration Summary:', {
    usingEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    usingEnvKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    finalUrl: supabaseUrl,
    hasCorrectDomain: supabaseUrl.includes('ypwvkihattwxushbwsig'),
    isValidUrl: supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co'),
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
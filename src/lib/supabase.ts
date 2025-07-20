// 🎵 TypeMate Supabase Client
// クラウドデータベース接続とサーバーサイド管理

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// 環境変数の検証
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// クライアントサイド用（メイン）
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// サーバーサイド用（API routes）
export const supabaseAdmin = supabaseServiceKey ? createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

// 公開クライアント（匿名アクセス用）
export const supabasePublic = supabase;
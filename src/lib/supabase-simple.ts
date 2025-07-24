// 🎵 TypeMate Simple Supabase Client
// エラー回避のためのシンプルなSupabaseクライアント

import { createClient } from '@supabase/supabase-js';

// 直接環境変数を使用
const supabaseUrl = 'https://ypwvkihattwxushbwsig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraGF0dHd4dXNoYndzaWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1Mjk4MzQzNSwiZXhwIjoyMDY4NTU5NDM1fQ.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
// 🎵 TypeMate Auth Callback
// OAuth認証完了後のリダイレクト処理

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-simple';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          // 認証成功 - チャットページにリダイレクト
          router.push('/chat?auth=success');
        } else {
          // セッションなし - ホームページにリダイレクト
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/?error=unexpected');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-spin">
          ✨
        </div>
        <p className="text-slate-600">認証を完了しています...</p>
      </div>
    </div>
  );
}
// 🎵 TypeMate Auth Callback
// OAuth認証完了後のリダイレクト処理

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-simple';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle Supabase OAuth callback
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          searchParams.get('code') || ''
        );
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          // 認証成功 - 診断ページにリダイレクト（NextAuthと同じ動作）
          router.push('/diagnosis');
        } else {
          // セッションなし - ホームページにリダイレクト
          router.push('/');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/?error=unexpected');
      }
    };

    // URLにコードパラメータがある場合のみ実行
    if (searchParams.get('code')) {
      handleAuthCallback();
    } else {
      // コードがない場合は直接セッション確認
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.push('/diagnosis');
        } else {
          router.push('/');
        }
      });
    }
  }, [router, searchParams]);

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-spin">
            ✨
          </div>
          <p className="text-slate-600">認証を完了しています...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
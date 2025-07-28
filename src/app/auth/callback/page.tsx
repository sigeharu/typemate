// 🎵 TypeMate Auth Callback
// OAuth認証完了後のリダイレクト処理（AuthProvider統合版）

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      console.log('🔄 Callback: AuthProviderに認証処理を委譲');
      handleAuthCallback(code);
    } else {
      console.log('❌ Callback: 認証コードが見つからない');
      // コードがない場合はホームページにリダイレクト
      window.location.href = '/';
    }
  }, [searchParams, handleAuthCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-spin">
          🎵
        </div>
        <p className="text-slate-600">認証を完了しています...</p>
        <p className="text-xs text-slate-500 mt-2">しばらくお待ちください</p>
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
            🎵
          </div>
          <p className="text-slate-600">認証を完了しています...</p>
          <p className="text-xs text-slate-500 mt-2">読み込み中...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
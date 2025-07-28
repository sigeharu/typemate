// 🎵 TypeMate Auth Callback
// OAuth認証完了後のリダイレクト処理

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-simple';
import { diagnosisService } from '@/lib/diagnosis-service';

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
          console.log('✅ 認証成功 - 診断状況確認開始:', data.session.user.id);
          
          // 🎯 セッション確立を確実にするため少し待機
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 🎯 根本修正: 診断状況をチェックしてからリダイレクト
          try {
            const diagnosisStatus = await diagnosisService.getDiagnosisStatus(data.session.user.id);
            console.log('🔍 認証後診断状況:', diagnosisStatus);
            
            if (diagnosisStatus.hasDiagnosis) {
              console.log('✅ 診断済みユーザー - チャットへリダイレクト');
              router.push('/chat');
            } else {
              console.log('❓ 未診断ユーザー - 診断ページへリダイレクト');
              router.push('/diagnosis');
            }
          } catch (error) {
            console.error('❌ 診断状況確認エラー:', error);
            // エラー時は安全のため診断ページへ
            router.push('/diagnosis');
          }
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
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session) {
          console.log('✅ 既存セッション確認 - 診断状況確認開始:', data.session.user.id);
          
          try {
            const diagnosisStatus = await diagnosisService.getDiagnosisStatus(data.session.user.id);
            console.log('🔍 既存セッション診断状況:', diagnosisStatus);
            
            if (diagnosisStatus.hasDiagnosis) {
              console.log('✅ 診断済みユーザー - チャットへリダイレクト');
              router.push('/chat');
            } else {
              console.log('❓ 未診断ユーザー - 診断ページへリダイレクト');
              router.push('/diagnosis');
            }
          } catch (error) {
            console.error('❌ 診断状況確認エラー:', error);
            router.push('/diagnosis');
          }
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
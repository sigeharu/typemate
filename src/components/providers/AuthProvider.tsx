// 🎵 TypeMate Auth Provider
// Supabase認証状態のグローバル管理とOAuth統合処理

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-simple';
import { diagnosisService } from '@/lib/diagnosis-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  handleAuthCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  handleAuthCallback: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      try {
        console.log('🔄 AuthProvider: 初期セッション取得開始');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider: セッション取得エラー:', error);
        } else if (session) {
          console.log('✅ AuthProvider: 既存セッション復元:', session.user.id);
        } else {
          console.log('ℹ️ AuthProvider: セッションなし');
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('❌ AuthProvider: 初期セッション取得で予期しないエラー:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // 🔧 認証状態変更時のロギング強化
        if (event === 'SIGNED_IN') {
          console.log('✅ AuthProvider: User signed in - session updated');
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 AuthProvider: User signed out - session cleared');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AuthProvider: Token refreshed - session maintained');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 🔧 OAuth callback統合処理
  const handleAuthCallback = async (code: string) => {
    try {
      console.log('🔄 AuthProvider: OAuth callback処理開始');
      setLoading(true);
      
      // Handle Supabase OAuth callback
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ AuthProvider: Auth callback error:', error);
        router.push('/?error=auth_failed');
        return;
      }

      if (data.session) {
        console.log('✅ AuthProvider: 認証成功 - 診断状況確認開始:', data.session.user.id);
        setUser(data.session.user);
        
        // 🎯 診断状況をチェックしてからリダイレクト
        try {
          const diagnosisStatus = await diagnosisService.getDiagnosisStatus(data.session.user.id);
          console.log('🔍 AuthProvider: 認証後診断状況:', diagnosisStatus);
          
          if (diagnosisStatus.hasDiagnosis) {
            console.log('✅ AuthProvider: 診断済みユーザー - チャットへリダイレクト');
            router.push('/chat');
          } else {
            console.log('❓ AuthProvider: 未診断ユーザー - 診断ページへリダイレクト');
            router.push('/diagnosis');
          }
        } catch (error) {
          console.error('❌ AuthProvider: 診断状況確認エラー:', error);
          // エラー時は安全のため診断ページへ
          router.push('/diagnosis');
        }
      } else {
        // セッションなし - ホームページにリダイレクト
        router.push('/');
      }
    } catch (error) {
      console.error('❌ AuthProvider: Unexpected error:', error);
      router.push('/?error=unexpected');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, handleAuthCallback }}>
      {children}
    </AuthContext.Provider>
  );
}
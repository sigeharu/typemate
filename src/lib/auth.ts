// 🎵 TypeMate Authentication Library
// Supabase認証・セッション管理ヘルパー関数

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'

// サーバーサイド用Supabaseクライアント作成
function createSupabaseServerClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component中では設定できない場合がある
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component中では設定できない場合がある
          }
        },
      },
    }
  )
}

// TypeMate認証セッション型定義
export interface TypeMateSession {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    provider?: string
  }
  accessToken?: string
}

// サーバーサイドでセッションを取得
export async function getAuthSession(): Promise<TypeMateSession | null> {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        image: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        provider: 'google'
      },
      accessToken: user.access_token
    }
  } catch (error) {
    console.error('Auth session error:', error)
    return null
  }
}

// ユーザーが認証済みかチェック
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession()
  return !!session?.user
}

// 認証が必要なページでの認証チェック
export async function requireAuth(): Promise<TypeMateSession> {
  const session = await getAuthSession()
  if (!session) {
    throw new Error('認証が必要です')
  }
  return session
}

// ユーザー情報を安全に取得
export async function getCurrentUser() {
  const session = await getAuthSession()
  return session?.user || null
}

// サーバーサイド用Supabaseクライアントを取得
export function getSupabaseServer() {
  return createSupabaseServerClient()
}

// 🔬 診断状況チェック - ユーザーが診断済みかどうか確認
export async function getUserDiagnosisStatus(userId?: string): Promise<{
  hasDiagnosis: boolean;
  userType?: string;
  shouldRedirectToDiagnosis: boolean;
  shouldRedirectToChat: boolean;
}> {
  try {
    const supabase = createSupabaseServerClient()
    
    // ユーザーID取得
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        return {
          hasDiagnosis: false,
          shouldRedirectToDiagnosis: false,
          shouldRedirectToChat: false
        }
      }
      targetUserId = user.id
    }

    // user_profilesテーブルから診断状況確認
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('user_type, created_at')
      .eq('user_id', targetUserId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.warn('診断状況確認エラー:', error)
      return {
        hasDiagnosis: false,
        shouldRedirectToDiagnosis: true,
        shouldRedirectToChat: false
      }
    }

    // 診断済みの場合
    if (profile && profile.user_type) {
      return {
        hasDiagnosis: true,
        userType: profile.user_type,
        shouldRedirectToDiagnosis: false,
        shouldRedirectToChat: true
      }
    }

    // 未診断の場合
    return {
      hasDiagnosis: false,
      shouldRedirectToDiagnosis: true,
      shouldRedirectToChat: false
    }

  } catch (error) {
    console.error('診断状況確認エラー:', error)
    return {
      hasDiagnosis: false,
      shouldRedirectToDiagnosis: true,
      shouldRedirectToChat: false
    }
  }
}

// 🔬 認証ユーザーの診断要求チェック - 認証後のルーティング決定
export async function getPostAuthRedirect(): Promise<'/diagnosis' | '/chat' | null> {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return null // 未認証の場合はリダイレクトしない
    }

    const diagnosisStatus = await getUserDiagnosisStatus(session.user.id)
    
    if (diagnosisStatus.hasDiagnosis) {
      return '/chat' // 診断済み → チャット画面
    } else {
      return '/diagnosis' // 未診断 → 診断画面
    }
  } catch (error) {
    console.error('認証後リダイレクト決定エラー:', error)
    return '/diagnosis' // エラー時は診断画面へ
  }
}
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
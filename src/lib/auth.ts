// 🎵 TypeMate Authentication Library
// セッション管理・認証ヘルパー関数

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { Session } from 'next-auth'

export { authOptions }

// サーバーサイドでセッションを取得
export async function getAuthSession(): Promise<Session | null> {
  return await getServerSession(authOptions)
}

// ユーザーが認証済みかチェック
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession()
  return !!session?.user
}

// 認証が必要なページでの認証チェック
export async function requireAuth(): Promise<Session> {
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

// TypeMateユーザー用の拡張セッション型定義
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    provider?: string
  }
}
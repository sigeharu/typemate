// 🎵 TypeMate NextAuth.js API Route
// Google OAuth認証設定

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初回ログイン時にアカウント情報を保存
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      // セッションにトークン情報を含める
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      return session
    },
    async signIn({ user, account, profile }) {
      // サインイン成功後の処理
      if (account?.provider === "google") {
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {
      // ログイン後のリダイレクト先
      // 診断完了済みかチェックして適切な画面に誘導
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/diagnosis"
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
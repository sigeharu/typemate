// 🎵 TypeMate NextAuth Provider
// NextAuth.js SessionProvider のラッパー

'use client'

import { SessionProvider } from 'next-auth/react'

interface NextAuthProviderProps {
  children: React.ReactNode
}

export function NextAuthProvider({ children }: NextAuthProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
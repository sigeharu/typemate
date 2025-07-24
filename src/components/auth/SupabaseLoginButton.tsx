// 🎵 TypeMate Supabase Login Button Component
// shadcn/ui統一デザインのGoogle OAuth認証ボタン（Supabase版）

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase-simple'

interface SupabaseLoginButtonProps {
  /** ボタンのバリエーション */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** サイズ */
  size?: 'default' | 'sm' | 'lg'
  /** カード形式で表示するか */
  showCard?: boolean
  /** クラス名の追加 */
  className?: string
}

export const SupabaseLoginButton = ({ 
  variant = 'default',
  size = 'default',
  showCard = false,
  className
}: SupabaseLoginButtonProps) => {
  const { user, loading, signOut } = useAuth()

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/diagnosis`
        }
      })
      
      if (error) {
        console.error('Sign in error:', error)
      }
    } catch (error) {
      console.error('Sign in exception:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to home page after sign out
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // ローディング状態
  if (loading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        読み込み中...
      </Button>
    )
  }

  // ログイン済み状態
  if (user) {
    if (showCard) {
      return (
        <Card className={className}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url || undefined} 
                    alt={user.user_metadata?.full_name || 'ユーザー'} 
                  />
                  <AvatarFallback>
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {user.user_metadata?.full_name || 'ユーザー'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut size={16} className="mr-1" />
                ログアウト
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={handleSignOut}
        className={className}
      >
        <LogOut size={16} className="mr-2" />
        ログアウト
      </Button>
    )
  }

  // 未ログイン状態
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleSignIn}
      className={className}
    >
      <LogIn size={16} className="mr-2" />
      Googleでログイン
    </Button>
  )
}

// シンプル版のログイン状態表示
export const SupabaseUserInfo = () => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage 
          src={user.user_metadata?.avatar_url || undefined} 
          alt={user.user_metadata?.full_name || 'ユーザー'} 
        />
        <AvatarFallback className="text-xs">
          <User size={14} />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {user.user_metadata?.full_name || 'ユーザー'}
      </span>
    </div>
  )
}
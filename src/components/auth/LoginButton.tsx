// 🎵 TypeMate Login Button Component
// shadcn/ui統一デザインのGoogle OAuth認証ボタン

'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, LogOut, User } from 'lucide-react'

interface LoginButtonProps {
  /** ボタンのバリエーション */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** サイズ */
  size?: 'default' | 'sm' | 'lg'
  /** カード形式で表示するか */
  showCard?: boolean
  /** クラス名の追加 */
  className?: string
}

export const LoginButton = ({ 
  variant = 'default',
  size = 'default',
  showCard = false,
  className
}: LoginButtonProps) => {
  const { data: session, status } = useSession()

  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/diagnosis' })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // ローディング状態
  if (status === 'loading') {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        読み込み中...
      </Button>
    )
  }

  // ログイン済み状態
  if (session?.user) {
    if (showCard) {
      return (
        <Card className={className}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={session.user.image || undefined} 
                    alt={session.user.name || 'ユーザー'} 
                  />
                  <AvatarFallback>
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {session.user.name || 'ユーザー'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.email}
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
export const UserInfo = () => {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarImage 
          src={session.user.image || undefined} 
          alt={session.user.name || 'ユーザー'} 
        />
        <AvatarFallback className="text-xs">
          <User size={14} />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {session.user.name || 'ユーザー'}
      </span>
    </div>
  )
}
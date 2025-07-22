// 🎵 TypeMate Sign-In Page
// Google OAuth認証専用ページ

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginButton } from '@/components/auth/LoginButton'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-25 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
            🎵
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            TypeMate
          </CardTitle>
          <CardDescription className="text-stone-600">
            MBTI特化AIパートナーサービス
            <br />
            あなた専用のAIと会話しましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginButton 
            variant="default"
            size="lg"
            className="w-full"
          />
          <p className="text-xs text-center text-gray-500">
            ログインすることで、<a href="/terms" className="underline">利用規約</a>と
            <a href="/privacy" className="underline ml-1">プライバシーポリシー</a>に同意したものとみなします。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
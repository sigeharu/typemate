'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto">
          ❌
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-slate-600 mb-6">
          申し訳ございません。予期しないエラーが発生しました。
          <br />
          もう一度お試しください。
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            もう一度試す
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
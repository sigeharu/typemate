'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto">
              🚨
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              システムエラー
            </h2>
            <p className="text-slate-600 mb-6">
              システムレベルのエラーが発生しました。
              <br />
              ページを再読み込みしてください。
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                リトライ
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
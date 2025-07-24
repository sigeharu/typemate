import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6 mx-auto">
          404
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-slate-600 mb-6">
          お探しのページは存在しないか、
          <br />
          移動または削除された可能性があります。
        </p>
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              ホームに戻る
            </Button>
          </Link>
          <Link href="/diagnosis">
            <Button variant="outline" className="w-full">
              診断ページへ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
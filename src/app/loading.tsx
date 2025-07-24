export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-pulse">
          🎵
        </div>
        <p className="text-slate-600 animate-pulse">読み込み中...</p>
      </div>
    </div>
  )
}
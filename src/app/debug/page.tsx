// デバッグページ - 環境変数確認用

'use client';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">TypeMate Debug Info</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </div>
            <div>
              <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not found'}
            </div>
            <div>
              <strong>Key (first 20 chars):</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'Not found'}...
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Runtime Check</h2>
          <button 
            onClick={() => {
              try {
                console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
                console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
                alert('Check browser console for details');
              } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Log Environment Variables
          </button>
        </div>
      </div>
    </div>
  );
}
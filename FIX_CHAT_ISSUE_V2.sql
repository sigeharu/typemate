-- 🚨 TypeMate チャット送信問題緊急修正 (修正版)
-- diagnostic_resultsテーブル作成とRLS設定

-- 1. diagnostic_resultsテーブル作成（存在しない場合）
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS有効化
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- 3. 既存ポリシー削除（安全のため）
DROP POLICY IF EXISTS "auth_users_view_diagnostic_results" ON diagnostic_results;
DROP POLICY IF EXISTS "auth_users_insert_diagnostic_results" ON diagnostic_results;
DROP POLICY IF EXISTS "auth_users_update_diagnostic_results" ON diagnostic_results;
DROP POLICY IF EXISTS "auth_users_delete_diagnostic_results" ON diagnostic_results;

-- 4. RLSポリシー作成
CREATE POLICY "Users can view own diagnostic results" ON diagnostic_results
  FOR SELECT 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own diagnostic results" ON diagnostic_results
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own diagnostic results" ON diagnostic_results
  FOR UPDATE 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own diagnostic results" ON diagnostic_results
  FOR DELETE 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 5. インデックス作成
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user_id ON diagnostic_results(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_created_at ON diagnostic_results(created_at DESC);

-- 6. 既存user_profilesデータをdiagnostic_resultsに移行
INSERT INTO diagnostic_results (user_id, user_type, answers, is_guest, created_at)
SELECT 
  user_id,
  user_type,
  COALESCE(preferences, '{}'),
  false,
  created_at
FROM user_profiles 
WHERE user_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- 7. 確認
SELECT 
  'diagnostic_results' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN user_id = auth.uid() THEN 1 END) as my_records
FROM diagnostic_results;

-- 8. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '🚨 チャット送信問題修正完了!';
  RAISE NOTICE '✅ diagnostic_resultsテーブル作成';
  RAISE NOTICE '✅ RLSポリシー設定';
  RAISE NOTICE '✅ 既存データ移行';
  RAISE NOTICE '🎵 チャット機能復旧完了';
END $$;
-- 🔧 user_profiles RLSポリシー修正
-- 406エラーを解決するためのRLS設定

-- 既存のポリシーを一旦削除
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- RLSを有効化（すでに有効な場合はスキップ）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 新しいポリシーを作成
-- 1. 認証ユーザーは自分のプロファイルを読み取れる
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- 2. 認証ユーザーは自分のプロファイルを挿入できる
CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. 認証ユーザーは自分のプロファイルを更新できる
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. 認証ユーザーは自分のプロファイルを削除できる（必要に応じて）
CREATE POLICY "Users can delete own profile" 
ON user_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- テーブルの列が存在することを確認
-- （既存のテーブルなので、これはチェックのみ）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('id', 'user_id', 'selected_ai_personality', 'user_type', 'display_name', 'birth_date')
ORDER BY ordinal_position;

-- 権限の確認
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE tablename = 'user_profiles';

-- RLSポリシーの確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
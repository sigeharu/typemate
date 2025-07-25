-- 🔐 TypeMate: 認証ユーザー限定RLSポリシー（簡素化版）
-- Supabase SQL Editorで実行してください

-- 1. 既存のゲストユーザー用ポリシーを削除
DROP POLICY IF EXISTS "Guest users can insert memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can view memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can update memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can delete memories" ON typemate_memory;

-- 2. 既存の認証ユーザー用ポリシーを確認（そのまま維持）
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'typemate_memory'
ORDER BY policyname;

-- 現在のポリシー（認証ユーザーのみ）:
-- - "Users can view own memories" (SELECT): auth.uid() = user_id
-- - "Users can insert own memories" (INSERT): auth.uid() = user_id  
-- - "Users can update own memories" (UPDATE): auth.uid() = user_id
-- - "Users can delete own memories" (DELETE): auth.uid() = user_id

-- 3. テスト用: 認証ユーザーとしてデータ挿入テスト
-- INSERT INTO typemate_memory (archetype, relationship_level, message_content, message_role, conversation_id)
-- VALUES ('DRM', 1, 'Test authenticated message', 'user', 'test-session-auth-123');

-- 4. テスト用: 認証ユーザーのデータ確認
-- SELECT * FROM typemate_memory WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 5;

-- ✅ 簡素化完了:
-- - ゲストユーザーポリシー削除
-- - 認証ユーザーのみがアクセス可能
-- - user_id IS NULL のレコードは存在しない前提
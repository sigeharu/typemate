-- 🎵 TypeMate: ゲストユーザー用RLSポリシー追加
-- Supabase SQL Editorで実行してください

-- 現在のRLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'typemate_memory';

-- ゲストユーザー用のRLSポリシーを追加

-- 1. ゲストユーザーのデータ挿入を許可
CREATE POLICY "Guest users can insert memories" ON typemate_memory
  FOR INSERT WITH CHECK (user_id IS NULL);

-- 2. ゲストユーザーのデータ閲覧を許可
CREATE POLICY "Guest users can view memories" ON typemate_memory
  FOR SELECT USING (user_id IS NULL);

-- 3. ゲストユーザーのデータ更新を許可
CREATE POLICY "Guest users can update memories" ON typemate_memory
  FOR UPDATE USING (user_id IS NULL) WITH CHECK (user_id IS NULL);

-- 4. ゲストユーザーのデータ削除を許可
CREATE POLICY "Guest users can delete memories" ON typemate_memory
  FOR DELETE USING (user_id IS NULL);

-- ポリシー追加後の確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'typemate_memory'
ORDER BY policyname;

-- テスト用: ゲストユーザーとしてデータ挿入テスト
-- INSERT INTO typemate_memory (archetype, relationship_level, message_content, message_role, conversation_id)
-- VALUES ('DRM', 1, 'Test message', 'user', 'test-session-123');

-- テスト用: ゲストユーザーのデータ確認
-- SELECT * FROM typemate_memory WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 5;
-- 🔐 TypeMate ゲストアクセス完全削除SQL
-- 目的: 全テーブルからゲストアクセスを完全に削除し、認証ユーザー限定システムに移行
-- 実行タイミング: TYPEMATE_SECURITY_FIX.sql実行後（オプション）

-- ==========================================
-- 注意事項
-- ==========================================

-- ⚠️ 重要: このスクリプトはゲストユーザー機能を完全に削除します
-- ⚠️ 実行前にバックアップを推奨します
-- ⚠️ 実行後はゲストユーザーでのアクセスが完全に不可能になります

-- ==========================================
-- Phase 1: ゲスト関連データの確認
-- ==========================================

-- 1. 現在のゲストデータ数確認
SELECT 
    'chat_sessions' as table_name,
    COUNT(*) as guest_records
FROM chat_sessions 
WHERE user_id IS NULL;

SELECT 
    'diagnostic_results' as table_name,
    COUNT(*) as guest_records
FROM diagnostic_results 
WHERE user_id IS NULL;

-- 2. ゲスト関連ポリシーの確認
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE qual LIKE '%is_guest%' OR qual LIKE '%user_id IS NULL%'
ORDER BY tablename, policyname;

-- ==========================================
-- Phase 2: ゲストデータの退避（オプション）
-- ==========================================

-- 3. ゲストデータのバックアップテーブル作成（必要に応じて）
/*
CREATE TABLE IF NOT EXISTS guest_chat_sessions_backup AS
SELECT * FROM chat_sessions WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS guest_diagnostic_results_backup AS
SELECT * FROM diagnostic_results WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS guest_messages_backup AS
SELECT m.* FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
WHERE cs.user_id IS NULL;
*/

-- ==========================================
-- Phase 3: ゲストデータの削除
-- ==========================================

-- 4. ゲストメッセージの削除（外部キー制約のため先に削除）
DELETE FROM messages 
WHERE session_id IN (
    SELECT id FROM chat_sessions WHERE user_id IS NULL
);

-- 5. ゲストチャットセッションの削除
DELETE FROM chat_sessions WHERE user_id IS NULL;

-- 6. ゲスト診断結果の削除
DELETE FROM diagnostic_results WHERE user_id IS NULL;

-- ==========================================
-- Phase 4: ゲスト関連カラムの削除
-- ==========================================

-- 7. is_guestカラムの削除（存在する場合）
ALTER TABLE chat_sessions DROP COLUMN IF EXISTS is_guest;
ALTER TABLE diagnostic_results DROP COLUMN IF EXISTS is_guest;

-- 8. user_idカラムにNOT NULL制約を追加
-- 注意: 既存データにNULLがないことを確認してから実行
/*
ALTER TABLE chat_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE diagnostic_results ALTER COLUMN user_id SET NOT NULL;
*/

-- ==========================================
-- Phase 5: ゲスト関連ポリシーの完全削除
-- ==========================================

-- 9. 全テーブルのゲスト関連ポリシー削除
-- chat_sessions
DROP POLICY IF EXISTS "Guest users can view sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Guest users can insert sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Guest users can update sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Guest users can delete sessions" ON chat_sessions;

-- diagnostic_results
DROP POLICY IF EXISTS "Guest users can view diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Guest users can insert diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Guest users can update diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Guest users can delete diagnostic results" ON diagnostic_results;

-- messages (念のため)
DROP POLICY IF EXISTS "Guest users can view messages" ON messages;
DROP POLICY IF EXISTS "Guest users can insert messages" ON messages;
DROP POLICY IF EXISTS "Guest users can update messages" ON messages;
DROP POLICY IF EXISTS "Guest users can delete messages" ON messages;

-- typemate_memory
DROP POLICY IF EXISTS "Guest users can view memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can insert memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can update memories" ON typemate_memory;
DROP POLICY IF EXISTS "Guest users can delete memories" ON typemate_memory;

-- ==========================================
-- Phase 6: 認証ユーザー限定ポリシーの強化
-- ==========================================

-- 10. user_profilesの強化（NOT NULL制約追加）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "auth_users_only_view_profile" ON user_profiles
  FOR SELECT 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_only_insert_profile" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_only_update_profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- ==========================================
-- Phase 7: データベース整合性チェック
-- ==========================================

-- 11. 全テーブルのNULLユーザーID確認（0であることを確認）
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as null_user_id_count
FROM user_profiles 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'chat_sessions' as table_name,
    COUNT(*) as null_user_id_count
FROM chat_sessions 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'messages' as table_name,
    COUNT(*) as orphaned_messages
FROM messages m
LEFT JOIN chat_sessions cs ON m.session_id = cs.id
WHERE cs.id IS NULL

UNION ALL

SELECT 
    'diagnostic_results' as table_name,
    COUNT(*) as null_user_id_count
FROM diagnostic_results 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'typemate_memory' as table_name,
    COUNT(*) as null_user_id_count
FROM typemate_memory 
WHERE user_id IS NULL;

-- ==========================================
-- Phase 8: 最終セキュリティ確認
-- ==========================================

-- 12. 全ポリシーの認証要件確認
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual LIKE '%IS NOT NULL%' THEN '🔐 Maximum Security'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Authenticated Only'
        WHEN qual LIKE '%is_guest%' OR qual LIKE '%user_id IS NULL%' THEN '⚠️ Guest Access Still Present'
        ELSE '❓ Unknown Security Level'
    END as security_level
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'chat_sessions', 'messages', 'diagnostic_results', 'typemate_memory')
ORDER BY tablename, policyname;

-- ==========================================
-- 完了メッセージ
-- ==========================================

-- 13. 実行完了確認
DO $$
DECLARE
    guest_count INTEGER := 0;
    policy_count INTEGER := 0;
BEGIN
    -- ゲストデータ残存確認
    SELECT 
        COALESCE(
            (SELECT COUNT(*) FROM chat_sessions WHERE user_id IS NULL) +
            (SELECT COUNT(*) FROM diagnostic_results WHERE user_id IS NULL) +
            (SELECT COUNT(*) FROM typemate_memory WHERE user_id IS NULL), 0
        ) INTO guest_count;
    
    -- ゲスト関連ポリシー残存確認
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE (qual LIKE '%is_guest%' OR qual LIKE '%user_id IS NULL%')
    AND tablename IN ('user_profiles', 'chat_sessions', 'messages', 'diagnostic_results', 'typemate_memory');
    
    -- 結果表示
    RAISE NOTICE '🔐 TypeMateゲストアクセス削除完了!';
    RAISE NOTICE '📊 削除結果:';
    RAISE NOTICE '  - 残存ゲストデータ数: %', guest_count;
    RAISE NOTICE '  - 残存ゲストポリシー数: %', policy_count;
    
    IF guest_count = 0 AND policy_count = 0 THEN
        RAISE NOTICE '✅ ゲストアクセス完全削除成功';
        RAISE NOTICE '🔐 認証ユーザー限定システムに移行完了';
    ELSE
        RAISE NOTICE '⚠️ 一部ゲスト要素が残存しています (要確認)';
    END IF;
    
    RAISE NOTICE '📋 次のステップ: TypeMateアプリでログイン必須動作をテスト';
END $$;
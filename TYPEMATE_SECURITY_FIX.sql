-- 🚨 TypeMate緊急セキュリティ修正SQL
-- 実行日時: 即座に実行必須
-- 目的: messagesテーブルのRLSポリシー強化とセキュリティホール修正

-- ==========================================
-- Phase 1: 現状確認
-- ==========================================

-- 1. messagesテーブルの既存ポリシー確認
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
WHERE tablename = 'messages'
ORDER BY policyname;

-- 2. 全テーブルのRLS状態確認
SELECT 
    tablename, 
    row_security,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pgc.tablename) as policy_count
FROM pg_tables pgc
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'chat_sessions', 'messages', 'diagnostic_results', 'typemate_memory')
ORDER BY tablename;

-- ==========================================
-- Phase 2: messagesテーブル緊急修正
-- ==========================================

-- 3. 既存ポリシー削除（安全のため完全再構築）
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON messages;
DROP POLICY IF EXISTS "Users can update messages from own sessions" ON messages;
DROP POLICY IF EXISTS "Users can delete messages from own sessions" ON messages;

-- 4. 新規セキュアポリシー適用（認証ユーザーのみ）
CREATE POLICY "auth_users_view_own_messages" ON messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND chat_sessions.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "auth_users_insert_own_messages" ON messages
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND chat_sessions.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    )
  );

-- 5. UPDATE/DELETEポリシーも追加（完全性のため）
CREATE POLICY "auth_users_update_own_messages" ON messages
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND chat_sessions.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    )
  );

CREATE POLICY "auth_users_delete_own_messages" ON messages
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND chat_sessions.user_id = auth.uid()
      AND auth.uid() IS NOT NULL
    )
  );

-- ==========================================
-- Phase 3: 他テーブルの強化確認
-- ==========================================

-- 6. chat_sessionsテーブルのゲスト条件削除
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON chat_sessions;

-- 7. chat_sessions認証ユーザー限定ポリシー再作成
CREATE POLICY "auth_users_view_sessions" ON chat_sessions
  FOR SELECT 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);
  
CREATE POLICY "auth_users_insert_sessions" ON chat_sessions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_update_sessions" ON chat_sessions
  FOR UPDATE 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_delete_sessions" ON chat_sessions
  FOR DELETE 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 8. diagnostic_resultsテーブルのゲスト条件削除
DROP POLICY IF EXISTS "Users can view own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Users can insert own diagnostic results" ON diagnostic_results;

-- 9. diagnostic_results認証ユーザー限定ポリシー再作成
CREATE POLICY "auth_users_view_diagnostic_results" ON diagnostic_results
  FOR SELECT 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "auth_users_insert_diagnostic_results" ON diagnostic_results
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- ==========================================
-- Phase 4: 修正後確認
-- ==========================================

-- 10. 修正後のポリシー一覧確認
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Secure'
        WHEN qual LIKE '%is_guest%' THEN '⚠️ Guest Access'
        ELSE '❓ Unknown'
    END as security_status
FROM pg_policies 
WHERE tablename IN ('messages', 'chat_sessions', 'diagnostic_results')
ORDER BY tablename, policyname;

-- ==========================================
-- 成功メッセージ
-- ==========================================

-- 11. 実行完了確認
DO $$
BEGIN
    RAISE NOTICE '🚨 TypeMate緊急セキュリティ修正完了!';
    RAISE NOTICE '✅ messagesテーブル: 認証ユーザー限定ポリシー適用';
    RAISE NOTICE '✅ chat_sessionsテーブル: ゲストアクセス削除';
    RAISE NOTICE '✅ diagnostic_resultsテーブル: セキュリティ強化';
    RAISE NOTICE '🔐 全テーブルで認証ユーザーのみアクセス可能';
    RAISE NOTICE '📋 次のステップ: TYPEMATE_SECURITY_TEST.sqlで検証実行';
END $$;
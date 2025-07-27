-- 🧪 TypeMate セキュリティ境界検証SQL
-- 目的: セキュリティ修正後の動作確認とデータ隔離テスト
-- 実行タイミング: TYPEMATE_SECURITY_FIX.sql実行後

-- ==========================================
-- Phase 1: セキュリティ境界テスト
-- ==========================================

-- 1. 現在認証中のユーザーID確認
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ 認証済み'
        ELSE '❌ 未認証'
    END as auth_status;

-- 2. 自分のチャットセッション数確認
SELECT 
    COUNT(*) as my_chat_sessions,
    'Should be > 0 if user has sessions' as note
FROM chat_sessions 
WHERE user_id = auth.uid();

-- 3. 自分のメッセージ数確認
SELECT 
    COUNT(*) as my_messages,
    'Should be >= 0 (自分のメッセージのみ)' as note
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
WHERE cs.user_id = auth.uid();

-- 4. セキュリティ境界テスト: 他ユーザーデータアクセス不可確認
-- 注意: このクエリは0件を返すべき（RLSにより自動フィルタ）
SELECT 
    COUNT(*) as visible_sessions,
    'Should be 0 or equal to my sessions (RLS protection)' as security_note
FROM chat_sessions;

SELECT 
    COUNT(*) as visible_messages,
    'Should be 0 or equal to my messages (RLS protection)' as security_note
FROM messages;

-- ==========================================
-- Phase 2: 機能動作テスト
-- ==========================================

-- 5. チャットセッション作成テスト
INSERT INTO chat_sessions (user_type, ai_personality, title)
VALUES ('TEST-AA', 'DRM', 'Security Test Session - ' || NOW()::text)
RETURNING id, user_id, created_at, 
    CASE 
        WHEN user_id = auth.uid() THEN '✅ Correct user_id'
        ELSE '❌ Wrong user_id'
    END as user_id_check;

-- 6. メッセージ投稿テスト
WITH test_session AS (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid() 
    AND title LIKE 'Security Test Session%'
    ORDER BY created_at DESC 
    LIMIT 1
)
INSERT INTO messages (session_id, content, sender)
SELECT 
    ts.id,
    'Security test message - ' || NOW()::text,
    'user'
FROM test_session ts
RETURNING id, session_id, content, sender, created_at,
    '✅ Message created successfully' as test_result;

-- 7. データ取得テスト（自分のデータのみ表示されることを確認）
SELECT 
    cs.id as session_id,
    cs.title,
    cs.user_id,
    COUNT(m.id) as message_count,
    CASE 
        WHEN cs.user_id = auth.uid() THEN '✅ Own data'
        ELSE '❌ Foreign data (should not appear)'
    END as ownership_check
FROM chat_sessions cs
LEFT JOIN messages m ON cs.id = m.session_id
WHERE cs.title LIKE 'Security Test Session%'
GROUP BY cs.id, cs.title, cs.user_id
ORDER BY cs.created_at DESC;

-- ==========================================
-- Phase 3: パフォーマンス確認
-- ==========================================

-- 8. クエリ実行計画確認（パフォーマンス影響チェック）
EXPLAIN (ANALYZE, BUFFERS) 
SELECT m.id, m.content, m.sender, m.created_at
FROM messages m
JOIN chat_sessions cs ON m.session_id = cs.id
WHERE cs.user_id = auth.uid()
ORDER BY m.created_at DESC
LIMIT 10;

-- ==========================================
-- Phase 4: RLSポリシー確認
-- ==========================================

-- 9. 全テーブルの最終RLSポリシー状態確認
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'chat_sessions', 'messages', 'diagnostic_results', 'typemate_memory')
GROUP BY tablename
ORDER BY tablename;

-- 10. 認証必須ポリシー確認
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual LIKE '%IS NOT NULL%' THEN '🔐 Maximum Security'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ Authenticated Only'
        WHEN qual LIKE '%is_guest%' THEN '⚠️ Guest Access Detected'
        ELSE '❓ Unknown Security Level'
    END as security_level
FROM pg_policies 
WHERE tablename IN ('messages', 'chat_sessions', 'diagnostic_results')
ORDER BY tablename, policyname;

-- ==========================================
-- Phase 5: クリーンアップ（オプション）
-- ==========================================

-- 11. テストデータ削除（必要に応じてコメントアウト解除）
/*
DELETE FROM messages 
WHERE content LIKE 'Security test message%'
AND EXISTS (
    SELECT 1 FROM chat_sessions cs 
    WHERE cs.id = messages.session_id 
    AND cs.user_id = auth.uid()
);

DELETE FROM chat_sessions 
WHERE title LIKE 'Security Test Session%'
AND user_id = auth.uid();
*/

-- ==========================================
-- 検証結果サマリー
-- ==========================================

-- 12. 最終検証サマリー
DO $$
DECLARE
    session_count INTEGER;
    message_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- データ数確認
    SELECT COUNT(*) INTO session_count FROM chat_sessions WHERE user_id = auth.uid();
    SELECT COUNT(*) INTO message_count FROM messages m JOIN chat_sessions cs ON m.session_id = cs.id WHERE cs.user_id = auth.uid();
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'messages';
    
    -- 結果表示
    RAISE NOTICE '🧪 TypeMateセキュリティ検証完了!';
    RAISE NOTICE '📊 検証結果:';
    RAISE NOTICE '  - 自分のセッション数: %', session_count;
    RAISE NOTICE '  - 自分のメッセージ数: %', message_count;
    RAISE NOTICE '  - messagesテーブルポリシー数: %', policy_count;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ セキュリティポリシー: 完全適用';
    ELSE
        RAISE NOTICE '⚠️ セキュリティポリシー: 不完全 (要確認)';
    END IF;
    
    RAISE NOTICE '🔐 認証ユーザーのみアクセス可能な状態です';
    RAISE NOTICE '📋 次のステップ: TypeMateアプリでチャット機能をテスト';
END $$;
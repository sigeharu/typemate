-- 🔍 TypeMate 診断データ確認SQL
-- 診断結果が保存されているか確認し、問題を特定

-- ==========================================
-- Phase 1: 現在のユーザーと診断データ確認
-- ==========================================

-- 1. 現在認証中のユーザーID確認
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ 認証済み'
        ELSE '❌ 未認証'
    END as auth_status;

-- 2. diagnostic_resultsテーブルの存在確認とデータ
SELECT 
    'diagnostic_results' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id = auth.uid() THEN 1 END) as my_records
FROM diagnostic_results;

-- 3. user_profilesテーブルのデータ確認
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id = auth.uid() THEN 1 END) as my_records,
    COUNT(CASE WHEN user_type IS NOT NULL THEN 1 END) as has_user_type
FROM user_profiles;

-- ==========================================
-- Phase 2: 自分の診断データ詳細確認
-- ==========================================

-- 4. diagnostic_resultsの自分のデータ
SELECT 
    user_id,
    user_type,
    created_at,
    CASE 
        WHEN answers IS NOT NULL THEN '✅ 回答データあり'
        ELSE '❌ 回答データなし'
    END as answers_status
FROM diagnostic_results 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 5. user_profilesの自分のデータ
SELECT 
    id,
    user_id,
    user_type,
    selected_ai_personality,
    relationship_type,
    created_at,
    updated_at,
    CASE 
        WHEN preferences IS NOT NULL THEN '✅ 設定データあり'
        ELSE '❌ 設定データなし'
    END as preferences_status
FROM user_profiles 
WHERE user_id = auth.uid();

-- ==========================================
-- Phase 3: テーブル構造確認
-- ==========================================

-- 6. diagnostic_resultsテーブル構造
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'diagnostic_results'
ORDER BY ordinal_position;

-- 7. user_profilesテーブル構造
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ==========================================
-- Phase 4: RLSポリシー確認
-- ==========================================

-- 8. diagnostic_resultsのRLSポリシー
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'diagnostic_results'
ORDER BY policyname;

-- 9. user_profilesのRLSポリシー  
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ==========================================
-- Phase 5: 問題診断サマリー
-- ==========================================

DO $$
DECLARE
    diagnostic_count INTEGER;
    profile_count INTEGER;
    has_user_type BOOLEAN;
BEGIN
    -- diagnostic_resultsのレコード数
    SELECT COUNT(*) INTO diagnostic_count 
    FROM diagnostic_results 
    WHERE user_id = auth.uid();
    
    -- user_profilesのレコード数とuser_type確認
    SELECT 
        COUNT(*),
        BOOL_OR(user_type IS NOT NULL)
    INTO profile_count, has_user_type
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    -- 診断結果表示
    RAISE NOTICE '🔍 診断データ確認結果:';
    RAISE NOTICE '  - diagnostic_resultsレコード数: %', diagnostic_count;
    RAISE NOTICE '  - user_profilesレコード数: %', profile_count;
    RAISE NOTICE '  - user_typeデータ: %', CASE WHEN has_user_type THEN '✅ あり' ELSE '❌ なし' END;
    
    -- 問題の原因特定
    IF diagnostic_count = 0 AND profile_count = 0 THEN
        RAISE NOTICE '❌ 問題: データが全く保存されていません';
        RAISE NOTICE '💡 解決策: 診断時の保存処理を確認してください';
    ELSIF diagnostic_count = 0 AND NOT has_user_type THEN
        RAISE NOTICE '⚠️ 問題: diagnostic_resultsが空で、user_profilesにuser_typeがありません';
        RAISE NOTICE '💡 解決策: diagnostic_resultsテーブルが存在しない可能性があります';
    ELSIF has_user_type THEN
        RAISE NOTICE '✅ user_profilesにデータあり - 正常に動作するはずです';
        RAISE NOTICE '💡 確認事項: diagnosis-serviceのgetDiagnosisStatusメソッドを確認';
    END IF;
END $$;
-- 🔍 user_profilesテーブルの詳細確認
-- user_typeがNULLの原因を特定

-- 1. 自分のuser_profilesレコードの詳細確認
SELECT 
    id,
    user_id,
    user_type,
    selected_ai_personality,
    relationship_type,
    preferences,
    created_at,
    updated_at
FROM user_profiles 
WHERE user_id = auth.uid();

-- 2. user_typeがNULLのレコード数確認
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_type IS NULL THEN 1 END) as null_user_type_count,
    COUNT(CASE WHEN user_type IS NOT NULL THEN 1 END) as has_user_type_count
FROM user_profiles;

-- 3. 最近のuser_profiles更新確認（過去24時間）
SELECT 
    user_id,
    user_type,
    created_at,
    updated_at,
    CASE 
        WHEN user_id = auth.uid() THEN '👤 自分のデータ'
        ELSE '他のユーザー'
    END as is_me
FROM user_profiles 
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC
LIMIT 10;

-- 4. user_profilesとdiagnostic_resultsの関連確認
SELECT 
    up.user_id,
    up.user_type as profile_user_type,
    dr.user_type as diagnostic_user_type,
    up.created_at as profile_created,
    dr.created_at as diagnostic_created
FROM user_profiles up
LEFT JOIN diagnostic_results dr ON up.user_id = dr.user_id
WHERE up.user_id = auth.uid();

-- 5. 診断結果保存の問題特定
DO $$
DECLARE
    profile_exists BOOLEAN;
    has_user_type BOOLEAN;
    profile_user_type TEXT;
BEGIN
    -- プロファイルの存在とuser_type確認
    SELECT 
        EXISTS(SELECT 1 FROM user_profiles WHERE user_id = auth.uid()),
        EXISTS(SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND user_type IS NOT NULL),
        user_type
    INTO profile_exists, has_user_type, profile_user_type
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    RAISE NOTICE '🔍 診断データ詳細分析:';
    RAISE NOTICE '  - user_profilesレコード存在: %', CASE WHEN profile_exists THEN '✅ あり' ELSE '❌ なし' END;
    RAISE NOTICE '  - user_typeデータ: %', CASE WHEN has_user_type THEN '✅ あり' ELSE '❌ NULL' END;
    RAISE NOTICE '  - user_typeの値: %', COALESCE(profile_user_type, 'NULL');
    
    -- 問題の診断
    IF profile_exists AND NOT has_user_type THEN
        RAISE NOTICE '❌ 問題: user_profilesレコードは存在するが、user_typeがNULL';
        RAISE NOTICE '💡 原因: 診断結果の保存時にuser_typeが正しく設定されていない';
        RAISE NOTICE '💡 解決策: diagnosis-serviceのsaveDiagnosisResultメソッドを確認';
    END IF;
END $$;
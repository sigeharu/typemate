-- 🔧 diagnosis-service.tsのクエリ動作確認
-- user_profilesテーブルからのデータ取得を再現

-- 1. single()メソッドの動作確認
-- 注意: single()は1件のレコードを期待し、0件または複数件の場合はエラーになる
SELECT 
    user_type, 
    created_at, 
    preferences
FROM user_profiles
WHERE user_id = auth.uid();

-- 2. 複数レコードの存在確認
SELECT 
    COUNT(*) as record_count,
    STRING_AGG(id::text, ', ') as record_ids,
    STRING_AGG(user_type, ', ') as user_types,
    STRING_AGG(created_at::text, ', ') as created_dates
FROM user_profiles
WHERE user_id = auth.uid();

-- 3. 最新レコードのみ取得（修正案）
SELECT 
    user_type, 
    created_at, 
    preferences
FROM user_profiles
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- 4. 問題診断
DO $$
DECLARE
    record_count INTEGER;
    latest_user_type TEXT;
BEGIN
    -- レコード数確認
    SELECT COUNT(*) INTO record_count
    FROM user_profiles
    WHERE user_id = auth.uid();
    
    -- 最新のuser_type取得
    SELECT user_type INTO latest_user_type
    FROM user_profiles
    WHERE user_id = auth.uid()
    ORDER BY created_at DESC
    LIMIT 1;
    
    RAISE NOTICE '🔍 診断サービス問題分析:';
    RAISE NOTICE '  - user_profilesレコード数: %', record_count;
    RAISE NOTICE '  - 最新のuser_type: %', COALESCE(latest_user_type, 'NULL');
    
    IF record_count = 0 THEN
        RAISE NOTICE '❌ レコードが存在しません';
    ELSIF record_count = 1 THEN
        RAISE NOTICE '✅ single()メソッドは正常に動作するはずです';
        RAISE NOTICE '💡 ブラウザコンソールでエラーを確認してください';
    ELSIF record_count > 1 THEN
        RAISE NOTICE '❌ 複数レコードが存在！single()メソッドがエラーになります';
        RAISE NOTICE '💡 解決策: ORDER BY created_at DESC LIMIT 1 を使用';
    END IF;
END $$;
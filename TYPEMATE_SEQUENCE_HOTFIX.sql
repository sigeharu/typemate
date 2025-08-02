-- 🚨 TypeMate Message Sequence Hotfix
-- 緊急修正: sequence_numberカラム追加でメッセージ送信復旧

-- ==========================================
-- HOTFIX: sequence_number カラム追加
-- ==========================================

-- 1. sequence_number カラムを追加（既存データ互換性のためNULL許可）
ALTER TABLE typemate_memory 
ADD COLUMN IF NOT EXISTS sequence_number INTEGER;

-- 2. 会話順序保証用インデックス追加
CREATE INDEX IF NOT EXISTS idx_typemate_memory_conversation_sequence 
  ON typemate_memory (conversation_id, sequence_number) 
  WHERE conversation_id IS NOT NULL AND sequence_number IS NOT NULL;

-- 3. 既存メッセージの順序修復（created_at順で自動採番）
DO $$
BEGIN
    -- conversation_id別に既存メッセージを修復
    WITH numbered_messages AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY conversation_id 
                ORDER BY created_at ASC
            ) as new_sequence_number
        FROM typemate_memory 
        WHERE conversation_id IS NOT NULL 
        AND message_content IS NOT NULL
        AND sequence_number IS NULL
    )
    UPDATE typemate_memory 
    SET sequence_number = numbered_messages.new_sequence_number
    FROM numbered_messages 
    WHERE typemate_memory.id = numbered_messages.id;
    
    RAISE NOTICE '🔧 既存メッセージの順序修復完了';
END $$;

-- ==========================================
-- 検証クエリ
-- ==========================================

-- 4. 修復結果確認
SELECT 
    conversation_id,
    COUNT(*) as total_messages,
    COUNT(sequence_number) as sequenced_messages,
    MIN(sequence_number) as min_seq,
    MAX(sequence_number) as max_seq
FROM typemate_memory 
WHERE conversation_id IS NOT NULL 
AND message_content IS NOT NULL
GROUP BY conversation_id
ORDER BY total_messages DESC
LIMIT 10;

-- 5. スキーマ確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'typemate_memory' 
AND column_name = 'sequence_number';

-- ==========================================
-- 成功メッセージ
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '🚨 TypeMate Sequence Hotfix完了!';
    RAISE NOTICE '✅ sequence_numberカラム追加完了';
    RAISE NOTICE '✅ 既存データ順序修復完了';
    RAISE NOTICE '✅ パフォーマンス用インデックス作成完了';
    RAISE NOTICE '🔥 メッセージ送信機能復旧完了';
END $$;
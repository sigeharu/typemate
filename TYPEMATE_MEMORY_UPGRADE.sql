-- 🎵 TypeMate Memory System Phase 2 Upgrade
-- 目的: 段階的情報収集システム実装（名前・誕生日・感情分析）

-- ==========================================
-- Phase 1: typemate_memory テーブル拡張
-- ==========================================

-- 1. 感情分析関連カラム追加
ALTER TABLE typemate_memory 
ADD COLUMN IF NOT EXISTS emotion_label TEXT,
ADD COLUMN IF NOT EXISTS emotion_score INTEGER CHECK (emotion_score >= 1 AND emotion_score <= 10),
ADD COLUMN IF NOT EXISTS is_special_moment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS music_tone TEXT,
ADD COLUMN IF NOT EXISTS emotion_keywords TEXT[];

-- 2. 個人情報収集関連カラム追加
ALTER TABLE typemate_memory 
ADD COLUMN IF NOT EXISTS user_birthday DATE,
ADD COLUMN IF NOT EXISTS collected_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS info_completeness INTEGER DEFAULT 0 CHECK (info_completeness >= 0 AND info_completeness <= 100);

-- 3. 新しいインデックス作成
CREATE INDEX IF NOT EXISTS idx_typemate_memory_special_moments 
  ON typemate_memory (user_id, is_special_moment) 
  WHERE is_special_moment = true;

CREATE INDEX IF NOT EXISTS idx_typemate_memory_emotion_score 
  ON typemate_memory (user_id, emotion_score DESC) 
  WHERE emotion_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_typemate_memory_info_completeness 
  ON typemate_memory (user_id, info_completeness DESC);

-- ==========================================
-- Phase 2: データ確認
-- ==========================================

-- 4. 既存データ確認
SELECT 
    user_id,
    COUNT(*) as total_memories,
    COUNT(CASE WHEN user_name IS NOT NULL THEN 1 END) as has_name,
    COUNT(CASE WHEN user_birthday IS NOT NULL THEN 1 END) as has_birthday,
    MAX(info_completeness) as max_completeness,
    COUNT(CASE WHEN is_special_moment = true THEN 1 END) as special_moments
FROM typemate_memory 
GROUP BY user_id
ORDER BY total_memories DESC;

-- ==========================================
-- Phase 3: 完了確認
-- ==========================================

-- 5. テーブル構造確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'typemate_memory' 
AND column_name IN (
    'emotion_label', 'emotion_score', 'is_special_moment', 
    'music_tone', 'emotion_keywords', 'user_birthday', 
    'collected_info', 'info_completeness'
)
ORDER BY column_name;

-- 6. インデックス確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'typemate_memory' 
AND indexname LIKE '%emotion%' OR indexname LIKE '%info%'
ORDER BY indexname;

-- ==========================================
-- 成功メッセージ
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '🎵 TypeMate Memory System Phase 2 Upgrade完了!';
    RAISE NOTICE '✅ 感情分析カラム追加完了';
    RAISE NOTICE '✅ 個人情報収集カラム追加完了';
    RAISE NOTICE '✅ パフォーマンス用インデックス作成完了';
    RAISE NOTICE '🔬 段階的情報収集システム準備完了';
    RAISE NOTICE '📋 次のステップ: memory.ts サービス実装';
END $$;
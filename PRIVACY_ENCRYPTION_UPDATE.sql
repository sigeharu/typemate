-- 🎵 TypeMate Privacy Encryption Database Update
-- プライバシー保護システム用のデータベーススキーマ拡張

BEGIN;

-- メッセージテーブルに暗号化関連フィールドを追加
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS privacy_level INTEGER DEFAULT 1 CHECK (privacy_level IN (1, 2, 3)),
ADD COLUMN IF NOT EXISTS session_key_hash TEXT;

-- 暗号化関連のインデックスを作成
CREATE INDEX IF NOT EXISTS idx_messages_is_encrypted ON messages(is_encrypted);
CREATE INDEX IF NOT EXISTS idx_messages_privacy_level ON messages(privacy_level);
CREATE INDEX IF NOT EXISTS idx_messages_content_hash ON messages(content_hash);

-- プライバシー統計用のビューを作成
CREATE OR REPLACE VIEW privacy_stats AS
SELECT 
  session_id,
  COUNT(*) as total_messages,
  SUM(CASE WHEN is_encrypted = true THEN 1 ELSE 0 END) as encrypted_messages,
  ROUND(
    (SUM(CASE WHEN is_encrypted = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 
    2
  ) as encryption_percentage,
  AVG(privacy_level) as avg_privacy_level
FROM messages 
GROUP BY session_id;

-- 暗号化メッセージの整合性チェック関数
CREATE OR REPLACE FUNCTION check_message_integrity()
RETURNS TABLE(
  message_id uuid,
  session_id uuid,
  has_encrypted_content boolean,
  has_content_hash boolean,
  integrity_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as message_id,
    m.session_id,
    (m.encrypted_content IS NOT NULL) as has_encrypted_content,
    (m.content_hash IS NOT NULL) as has_content_hash,
    CASE 
      WHEN m.is_encrypted = true AND m.encrypted_content IS NOT NULL AND m.content_hash IS NOT NULL 
        THEN 'VALID'
      WHEN m.is_encrypted = true AND (m.encrypted_content IS NULL OR m.content_hash IS NULL)
        THEN 'INVALID - Missing encryption data'
      WHEN m.is_encrypted = false AND (m.encrypted_content IS NOT NULL OR m.content_hash IS NOT NULL)
        THEN 'WARNING - Encryption data present but not marked as encrypted'
      ELSE 'VALID'
    END as integrity_status
  FROM messages m
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- プライバシーレベル統計関数
CREATE OR REPLACE FUNCTION get_privacy_stats(user_session_id uuid DEFAULT NULL)
RETURNS TABLE(
  total_messages bigint,
  encrypted_messages bigint,
  basic_protection bigint,
  high_protection bigint,
  max_protection bigint,
  encryption_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_messages,
    SUM(CASE WHEN is_encrypted = true THEN 1 ELSE 0 END) as encrypted_messages,
    SUM(CASE WHEN privacy_level = 1 THEN 1 ELSE 0 END) as basic_protection,
    SUM(CASE WHEN privacy_level = 2 THEN 1 ELSE 0 END) as high_protection,
    SUM(CASE WHEN privacy_level = 3 THEN 1 ELSE 0 END) as max_protection,
    ROUND(
      (SUM(CASE WHEN is_encrypted = true THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as encryption_rate
  FROM messages 
  WHERE (user_session_id IS NULL OR session_id = user_session_id);
END;
$$ LANGUAGE plpgsql;

-- セキュリティ監査ログテーブル（オプション）
CREATE TABLE IF NOT EXISTS encryption_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'encrypt', 'decrypt', 'verify'
  privacy_level INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 監査ログのインデックス
CREATE INDEX IF NOT EXISTS idx_audit_log_session ON encryption_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON encryption_audit_log(created_at DESC);

-- Row Level Security設定の確認と更新
DO $$
BEGIN
  -- 暗号化フィールドへのアクセスも既存のRLSポリシーでカバーされることを確認
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'messages' 
    AND policyname = 'Users can view messages from own sessions'
  ) THEN
    RAISE NOTICE 'Warning: Expected RLS policy not found. Please verify RLS configuration.';
  END IF;
END
$$;

COMMIT;

-- 実行後の確認クエリ（手動実行用）
/*
-- 新しいカラムが追加されたことを確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('encrypted_content', 'content_hash', 'is_encrypted', 'privacy_level', 'session_key_hash');

-- プライバシー統計の確認
SELECT * FROM get_privacy_stats();

-- メッセージ整合性の確認
SELECT * FROM check_message_integrity() LIMIT 10;
*/
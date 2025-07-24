-- 🎵 TypeMate Phase 1: 記憶システムテーブル作成
-- Supabase SQL Editorで実行してください

-- Phase 1: 基本記憶テーブル
CREATE TABLE IF NOT EXISTS typemate_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 基本情報
  archetype TEXT NOT NULL,
  relationship_level INTEGER DEFAULT 1,
  user_name TEXT,
  
  -- 会話記憶
  message_content TEXT,
  message_role TEXT CHECK (message_role IN ('user', 'ai')),
  conversation_id UUID,
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 1: 記憶テーブルRLS有効化
ALTER TABLE typemate_memory ENABLE ROW LEVEL SECURITY;

-- Phase 1: 記憶テーブルRLSポリシー
CREATE POLICY "Users can view own memories" ON typemate_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON typemate_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON typemate_memory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON typemate_memory
  FOR DELETE USING (auth.uid() = user_id);

-- Phase 1: 記憶テーブルインデックス
CREATE INDEX IF NOT EXISTS idx_typemate_memory_user_time ON typemate_memory (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_typemate_memory_conversation ON typemate_memory (conversation_id);

-- 確認用クエリ
SELECT 'typemate_memory table created successfully!' as status;
-- 🎵 TypeMate Database Schema
-- Supabaseで実行するSQL設定スクリプト

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ユーザープロファイルテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL,
  selected_ai_personality TEXT,
  relationship_type TEXT DEFAULT 'friend' CHECK (relationship_type IN ('friend', 'counselor', 'romantic', 'mentor')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- チャットセッションテーブル
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL,
  ai_personality TEXT NOT NULL,
  title TEXT,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  archetype_type TEXT,
  emotion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 診断結果テーブル
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user_id ON diagnostic_results(user_id);

-- Row Level Security (RLS) 設定
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLSポリシー: chat_sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id OR is_guest = true);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_guest = true);

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLSポリシー: messages
CREATE POLICY "Users can view messages from own sessions" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.is_guest = true)
    )
  );

CREATE POLICY "Users can insert messages to own sessions" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = messages.session_id 
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.is_guest = true)
    )
  );

-- RLSポリシー: diagnostic_results
CREATE POLICY "Users can view own diagnostic results" ON diagnostic_results
  FOR SELECT USING (auth.uid() = user_id OR is_guest = true);

CREATE POLICY "Users can insert own diagnostic results" ON diagnostic_results
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_guest = true);

-- トリガー関数: updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🎵 Phase 1: 基本記憶テーブル
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
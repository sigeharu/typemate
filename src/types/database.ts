// 🎵 TypeMate Database Types
// Supabase型定義とテーブル構造

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ユーザープロファイル
      user_profiles: {
        Row: {
          id: string
          user_id: string
          user_type: string
          selected_ai_personality: string | null
          relationship_type: 'friend' | 'counselor' | 'romantic' | 'mentor'
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_type: string
          selected_ai_personality?: string | null
          relationship_type?: 'friend' | 'counselor' | 'romantic' | 'mentor'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_type?: string
          selected_ai_personality?: string | null
          relationship_type?: 'friend' | 'counselor' | 'romantic' | 'mentor'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      
      // チャットセッション
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          user_type: string
          ai_personality: string
          title: string | null
          is_guest: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_type: string
          ai_personality: string
          title?: string | null
          is_guest?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_type?: string
          ai_personality?: string
          title?: string | null
          is_guest?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      // メッセージ
      messages: {
        Row: {
          id: string
          session_id: string
          content: string
          sender: 'user' | 'ai'
          archetype_type: string | null
          emotion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          content: string
          sender: 'user' | 'ai'
          archetype_type?: string | null
          emotion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          content?: string
          sender?: 'user' | 'ai'
          archetype_type?: string | null
          emotion?: string | null
          created_at?: string
        }
      }
      
      // 診断結果
      diagnostic_results: {
        Row: {
          id: string
          user_id: string | null
          user_type: string
          answers: Json
          is_guest: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_type: string
          answers?: Json
          is_guest?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_type?: string
          answers?: Json
          is_guest?: boolean
          created_at?: string
        }
      }
      
      // 🎵 Phase 1: 基本記憶テーブル
      typemate_memory: {
        Row: {
          id: string
          user_id: string | null
          archetype: string
          relationship_level: number
          user_name: string | null
          message_content: string | null
          message_role: 'user' | 'ai' | null
          conversation_id: string | null
          sequence_number: number // 👈 NEW: 順序保証用
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          archetype: string
          relationship_level?: number
          user_name?: string | null
          message_content?: string | null
          message_role?: 'user' | 'ai' | null
          conversation_id?: string | null
          sequence_number?: number // 👈 NEW: 順序保証用
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          archetype?: string
          relationship_level?: number
          user_name?: string | null
          message_content?: string | null
          message_role?: 'user' | 'ai' | null
          conversation_id?: string | null
          sequence_number?: number // 👈 NEW: 順序保証用
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
// 🎵 TypeMate Hybrid Storage System
// ローカルストレージ ↔ Supabase の段階的移行システム

import { supabase } from './supabase-simple';
import { storage as localStorage } from './storage';
import type { ChatSession, UserProfile } from './storage';
import type { Database } from '@/types/database';
import type { User } from '@supabase/supabase-js';
import { dbLogger, validateUUID, safeDbOperation } from './db-logger';

type DbChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type DbMessage = Database['public']['Tables']['messages']['Row'];
type DbUserProfile = Database['public']['Tables']['user_profiles']['Row'];

class HybridStorage {
  private static instance: HybridStorage;
  private user: User | null = null;
  private isOnline = true;

  private constructor() {
    this.initializeAuth();
    this.checkOnlineStatus();
  }

  static getInstance(): HybridStorage {
    if (!HybridStorage.instance) {
      HybridStorage.instance = new HybridStorage();
    }
    return HybridStorage.instance;
  }

  private async initializeAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    this.user = user;
    
    // Auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
      
      if (event === 'SIGNED_IN' && this.user) {
        this.migrateLocalDataToCloud();
      }
    });
  }

  private checkOnlineStatus() {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.user) {
        this.syncPendingData();
      }
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // ストレージ選択ロジック
  private useCloudStorage(): boolean {
    // 一時的にクラウドストレージを無効化
    return false; // this.user !== null && this.isOnline;
  }

  // === ユーザープロファイル管理 ===
  async getUserProfile(): Promise<UserProfile | null> {
    if (this.useCloudStorage()) {
      if (!this.user?.id || !validateUUID(this.user.id, 'user_id')) {
        dbLogger.warn('getUserProfile', 'Invalid user ID, falling back to local storage');
        return localStorage.getUserProfile();
      }

      const result = await safeDbOperation('getUserProfile', async () => {
        return await supabase
          .from('user_profiles')
          .select('id, user_id, user_type, selected_ai_personality, relationship_type, preferences, created_at, updated_at')
          .eq('user_id', this.user!.id)
          .single();
      });

      if (result.error && result.error.code !== 'PGRST116') {
        dbLogger.warn('getUserProfile', 'Failed to fetch cloud profile, falling back to local', { error: result.error });
        return localStorage.getUserProfile();
      }
      
      if (result.data) {
        return this.dbProfileToLocal(result.data);
      }
    }
    
    return localStorage.getUserProfile();
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    // ローカルには常に保存（オフライン対応）
    localStorage.saveUserProfile(profile);
    
    if (this.useCloudStorage()) {
      if (!this.user?.id || !validateUUID(this.user.id, 'user_id')) {
        dbLogger.warn('saveUserProfile', 'Invalid user ID, skipping cloud save');
        return;
      }

      const dbProfile = this.localProfileToDb(profile);
      
      const result = await safeDbOperation('saveUserProfile', async () => {
        return await supabase
          .from('user_profiles')
          .upsert({
            ...dbProfile,
            user_id: this.user!.id,
            updated_at: new Date().toISOString()
          });
      });

      if (result.error) {
        dbLogger.warn('saveUserProfile', 'Failed to save profile to cloud, adding to sync queue');
        this.addToPendingSync('profile', profile);
      }
    }
  }

  // === チャットセッション管理 ===
  async getAllChatSessions(): Promise<ChatSession[]> {
    if (this.useCloudStorage()) {
      if (!this.user?.id || !validateUUID(this.user.id, 'user_id')) {
        dbLogger.warn('getAllChatSessions', 'Invalid user ID, falling back to local storage');
        return localStorage.getAllChatSessions();
      }

      const result = await safeDbOperation('getAllChatSessions', async () => {
        return await supabase
          .from('chat_sessions')
          .select(`
            id, user_id, user_type, ai_personality, title, is_guest, created_at, updated_at,
            messages (id, session_id, content, sender, archetype_type, emotion, created_at)
          `)
          .eq('user_id', this.user!.id)
          .order('updated_at', { ascending: false });
      });

      if (result.error) {
        dbLogger.warn('getAllChatSessions', 'Failed to fetch cloud sessions, falling back to local');
        return localStorage.getAllChatSessions();
      }

      if (result.data) {
        return result.data.map(session => this.dbSessionToLocal(session));
      }
    }
    
    return localStorage.getAllChatSessions();
  }

  async saveChatSession(session: ChatSession): Promise<void> {
    // ローカルには常に保存
    localStorage.saveChatSession(session);
    
    if (this.useCloudStorage()) {
      try {
        // セッション保存
        const { error: sessionError } = await supabase
          .from('chat_sessions')
          .upsert({
            id: session.id,
            user_id: this.user!.id,
            user_type: session.userType,
            ai_personality: session.aiPersonality,
            title: session.title,
            is_guest: false,
            updated_at: new Date().toISOString()
          });

        if (sessionError) throw sessionError;

        // メッセージ保存
        for (const message of session.messages) {
          const { error: messageError } = await supabase
            .from('messages')
            .upsert({
              id: message.id,
              session_id: session.id,
              content: message.content,
              sender: message.sender,
              archetype_type: message.archetypeType,
              emotion: message.emotion,
              created_at: message.timestamp.toISOString()
            });

          if (messageError) throw messageError;
        }
      } catch (error) {
        console.warn('Failed to save session to cloud:', error);
        this.addToPendingSync('session', session);
      }
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    localStorage.deleteChatSession(sessionId);
    
    if (this.useCloudStorage()) {
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', this.user!.id);
          
        if (error) throw error;
      } catch (error) {
        console.warn('Failed to delete session from cloud:', error);
      }
    }
  }

  // === ローカル → クラウド移行 ===
  async migrateLocalDataToCloud(): Promise<void> {
    if (!this.user) return;

    try {
      console.log('Starting migration of local data to cloud...');
      
      // プロファイル移行
      const localProfile = localStorage.getUserProfile();
      if (localProfile) {
        await this.saveUserProfile(localProfile);
      }

      // チャットセッション移行
      const localSessions = localStorage.getAllChatSessions();
      for (const session of localSessions) {
        await this.saveChatSession(session);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // === データ変換ヘルパー ===
  private dbProfileToLocal(dbProfile: DbUserProfile): UserProfile {
    return {
      userType: dbProfile.user_type as any,
      selectedAiPersonality: dbProfile.selected_ai_personality as any,
      relationshipType: dbProfile.relationship_type,
      preferences: dbProfile.preferences as any,
      createdAt: new Date(dbProfile.created_at),
      updatedAt: new Date(dbProfile.updated_at)
    };
  }

  private localProfileToDb(profile: UserProfile) {
    return {
      user_type: profile.userType,
      selected_ai_personality: profile.selectedAiPersonality,
      relationship_type: profile.relationshipType,
      preferences: profile.preferences as any
    };
  }

  private dbSessionToLocal(dbSession: any): ChatSession {
    return {
      id: dbSession.id,
      userType: dbSession.user_type,
      aiPersonality: dbSession.ai_personality,
      title: dbSession.title,
      messages: dbSession.messages.map((msg: DbMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        archetypeType: msg.archetype_type,
        emotion: msg.emotion
      })),
      createdAt: new Date(dbSession.created_at),
      updatedAt: new Date(dbSession.updated_at)
    };
  }

  // === 同期管理 ===
  private pendingSyncData: Array<{ type: string; data: any }> = [];

  private addToPendingSync(type: string, data: any) {
    this.pendingSyncData.push({ type, data });
  }

  private async syncPendingData() {
    for (const item of this.pendingSyncData) {
      try {
        if (item.type === 'profile') {
          await this.saveUserProfile(item.data);
        } else if (item.type === 'session') {
          await this.saveChatSession(item.data);
        }
      } catch (error) {
        console.warn('Failed to sync pending data:', error);
        break; // 失敗したら中止
      }
    }
    this.pendingSyncData = [];
  }

  // === 統計情報 ===
  async getStatistics() {
    if (this.useCloudStorage()) {
      try {
        const { data: sessions, error } = await supabase
          .from('chat_sessions')
          .select('id, messages(*)')
          .eq('user_id', this.user!.id);

        if (error) throw error;

        const totalMessages = sessions.reduce((total, session) => 
          total + (session.messages?.length || 0), 0
        );

        return {
          totalSessions: sessions.length,
          totalMessages,
          averageMessagesPerSession: sessions.length > 0 ? totalMessages / sessions.length : 0,
          aiPersonalities: [], // TODO: 実装
          oldestSession: null // TODO: 実装
        };
      } catch (error) {
        console.warn('Failed to fetch cloud statistics:', error);
      }
    }
    
    return localStorage.getStatistics();
  }

  // === 認証状態 ===
  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  isGuest(): boolean {
    return this.user === null;
  }
}

export const hybridStorage = HybridStorage.getInstance();
// 🎵 TypeMate Storage Management
// チャット履歴とユーザーデータの永続化管理

import type { Message, Type64, BaseArchetype } from '@/types';

// チャットセッション
export interface ChatSession {
  id: string;
  userType: Type64;
  aiPersonality: BaseArchetype;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

// ユーザープロファイル
export interface UserProfile {
  userType: Type64;
  selectedAiPersonality?: BaseArchetype;
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    messageStyle: 'casual' | 'formal' | 'poetic';
    responseLength: 'short' | 'medium' | 'long';
  };
  // Option B: 段階的情報収集
  chatCount: number;
  personalInfo: {
    name?: string;
    birthday?: string;
    interests?: string[];
    relationshipGoals?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

class TypeMateStorage {
  private static instance: TypeMateStorage;
  
  private constructor() {}
  
  static getInstance(): TypeMateStorage {
    if (!TypeMateStorage.instance) {
      TypeMateStorage.instance = new TypeMateStorage();
    }
    return TypeMateStorage.instance;
  }

  // チャットセッション管理
  saveChatSession(session: ChatSession): void {
    if (typeof window === 'undefined') return;
    try {
      const sessions = this.getAllChatSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = { ...session, updatedAt: new Date() };
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem('typemate_chat_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  }

  getAllChatSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('typemate_chat_sessions');
      if (!stored) return [];
      
      const sessions = JSON.parse(stored) as ChatSession[];
      return sessions.map(session => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    }
  }

  getChatSession(sessionId: string): ChatSession | null {
    const sessions = this.getAllChatSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  getLatestChatSession(userType: Type64, aiPersonality: BaseArchetype): ChatSession | null {
    const sessions = this.getAllChatSessions();
    const matchingSessions = sessions.filter(
      s => s.userType === userType && s.aiPersonality === aiPersonality
    );
    
    if (matchingSessions.length === 0) return null;
    
    return matchingSessions.reduce((latest, current) => 
      current.updatedAt > latest.updatedAt ? current : latest
    );
  }

  deleteChatSession(sessionId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const sessions = this.getAllChatSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('typemate_chat_sessions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  }

  // ユーザープロファイル管理
  saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      const updatedProfile = { ...profile, updatedAt: new Date() };
      localStorage.setItem('typemate_user_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  getUserProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('typemate_user_profile');
      if (!stored) return null;
      
      const profile = JSON.parse(stored) as UserProfile;
      return {
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt)
      };
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  // 診断結果管理（既存との互換性）
  saveUserType(type: Type64): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userType64', type);
  }

  getUserType(): Type64 | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userType64') as Type64 || null;
  }

  // データのクリア
  clearAllData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('typemate_chat_sessions');
      localStorage.removeItem('typemate_user_profile');
      localStorage.removeItem('userType64');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }

  // チャット履歴の検索
  searchChatSessions(query: string): ChatSession[] {
    const sessions = this.getAllChatSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.title?.toLowerCase().includes(lowerQuery) ||
      session.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      )
    );
  }

  // Option B: チャット回数管理
  incrementChatCount(): number {
    try {
      const profile = this.getUserProfile();
      if (profile) {
        profile.chatCount += 1;
        this.saveUserProfile(profile);
        return profile.chatCount;
      } else {
        // プロファイルが存在しない場合は初期プロファイルを作成
        const userType = this.getUserType();
        if (userType) {
          const newProfile: UserProfile = {
            userType,
            relationshipType: 'friend',
            preferences: {
              theme: 'auto',
              messageStyle: 'casual',
              responseLength: 'medium'
            },
            chatCount: 1,
            personalInfo: {},
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.saveUserProfile(newProfile);
          return 1;
        }
        return 0;
      }
    } catch (error) {
      console.error('Failed to increment chat count:', error);
      return 0;
    }
  }

  getChatCount(): number {
    const profile = this.getUserProfile();
    return profile?.chatCount || 0;
  }

  // Option B: 個人情報管理
  updatePersonalInfo(info: Partial<UserProfile['personalInfo']>): void {
    try {
      const profile = this.getUserProfile();
      if (profile) {
        profile.personalInfo = { ...profile.personalInfo, ...info };
        this.saveUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to update personal info:', error);
    }
  }

  getPersonalInfo(): UserProfile['personalInfo'] {
    const profile = this.getUserProfile();
    return profile?.personalInfo || {};
  }

  // Option B判定: 2回目のチャットで個人情報がない場合
  shouldShowPersonalInfoModal(): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;
    
    return (
      profile.chatCount === 2 && 
      (!profile.personalInfo.name || !profile.personalInfo.birthday)
    );
  }

  // 統計情報
  getStatistics() {
    const sessions = this.getAllChatSessions();
    const totalMessages = sessions.reduce((total, session) => 
      total + session.messages.length, 0
    );
    
    return {
      totalSessions: sessions.length,
      totalMessages,
      averageMessagesPerSession: sessions.length > 0 ? totalMessages / sessions.length : 0,
      aiPersonalities: [...new Set(sessions.map(s => s.aiPersonality))],
      oldestSession: sessions.length > 0 ? 
        sessions.reduce((oldest, current) => 
          current.createdAt < oldest.createdAt ? current : oldest
        ) : null
    };
  }
}

export const storage = TypeMateStorage.getInstance();
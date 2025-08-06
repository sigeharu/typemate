// 🎵 TypeMate 短期記憶サービス
// Redis-based short-term memory with TTL (1 hour)

import { redisClient } from './redis-client';

// 短期記憶メッセージ型
export interface ShortTermMessage {
  id: string;
  content: string;
  role: 'user' | 'ai';
  timestamp: string;
  sessionId: string;
  emotion?: string;
  intensity?: number;
}

// 短期記憶セッション型
export interface ShortTermSession {
  sessionId: string;
  messages: ShortTermMessage[];
  createdAt: string;
  lastAccessed: string;
  messageCount: number;
}

export class ShortTermMemoryService {
  private static instance: ShortTermMemoryService;
  private readonly TTL_SECONDS = 3600; // 1時間
  private readonly MAX_MESSAGES = 10; // 直近10メッセージ

  private constructor() {}

  static getInstance(): ShortTermMemoryService {
    if (!ShortTermMemoryService.instance) {
      ShortTermMemoryService.instance = new ShortTermMemoryService();
    }
    return ShortTermMemoryService.instance;
  }

  // Redis接続確認
  private async ensureConnection(): Promise<boolean> {
    try {
      await redisClient.connect();
      return redisClient.isReady();
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      return false;
    }
  }

  // 短期記憶キー生成
  private getSessionKey(userId: string, sessionId: string): string {
    return `typemate:short_memory:${userId}:${sessionId}`;
  }

  // ユーザーのセッション一覧キー
  private getUserSessionsKey(userId: string): string {
    return `typemate:user_sessions:${userId}`;
  }

  // メッセージを短期記憶に保存
  async saveMessage(
    userId: string,
    sessionId: string,
    message: Omit<ShortTermMessage, 'id' | 'timestamp' | 'sessionId'>
  ): Promise<boolean> {
    if (!await this.ensureConnection()) {
      console.warn('⚠️ Redis not available, skipping short-term memory save');
      return false;
    }

    const client = redisClient.getClient();
    if (!client) return false;

    try {
      const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const messageData: ShortTermMessage = {
        ...message,
        id: messageId,
        timestamp: new Date().toISOString(),
        sessionId
      };

      const sessionKey = this.getSessionKey(userId, sessionId);
      const userSessionsKey = this.getUserSessionsKey(userId);

      // セッション内のメッセージ数を確認
      const currentMessages = await client.lLen(sessionKey);
      
      // 最大メッセージ数を超える場合は古いものを削除
      if (currentMessages >= this.MAX_MESSAGES) {
        await client.lTrim(sessionKey, -(this.MAX_MESSAGES - 1), -1);
      }

      // 新しいメッセージを追加
      await client.rPush(sessionKey, JSON.stringify(messageData));
      
      // TTL設定
      await client.expire(sessionKey, this.TTL_SECONDS);
      
      // ユーザーセッション一覧を更新
      await client.sAdd(userSessionsKey, sessionId);
      await client.expire(userSessionsKey, this.TTL_SECONDS);

      console.log('✅ Short-term message saved:', {
        userId: userId.substring(0, 8) + '...',
        sessionId: sessionId.substring(0, 8) + '...',
        messageId,
        role: message.role
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to save short-term message:', error);
      return false;
    }
  }

  // セッションの全メッセージを取得
  async getSessionMessages(userId: string, sessionId: string): Promise<ShortTermMessage[]> {
    if (!await this.ensureConnection()) {
      console.warn('⚠️ Redis not available, returning empty short-term memories');
      return [];
    }

    const client = redisClient.getClient();
    if (!client) return [];

    try {
      const sessionKey = this.getSessionKey(userId, sessionId);
      const messages = await client.lRange(sessionKey, 0, -1);
      
      const parsedMessages: ShortTermMessage[] = messages
        .map(msg => {
          try {
            return JSON.parse(msg) as ShortTermMessage;
          } catch (error) {
            console.error('❌ Failed to parse short-term message:', error);
            return null;
          }
        })
        .filter(msg => msg !== null) as ShortTermMessage[];

      // TTL更新（アクセス時）
      await client.expire(sessionKey, this.TTL_SECONDS);

      console.log('✅ Retrieved short-term messages:', {
        userId: userId.substring(0, 8) + '...',
        sessionId: sessionId.substring(0, 8) + '...',
        messageCount: parsedMessages.length
      });

      return parsedMessages;
    } catch (error) {
      console.error('❌ Failed to get short-term messages:', error);
      return [];
    }
  }

  // ユーザーの全セッション取得
  async getUserSessions(userId: string): Promise<ShortTermSession[]> {
    if (!await this.ensureConnection()) {
      return [];
    }

    const client = redisClient.getClient();
    if (!client) return [];

    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await client.sMembers(userSessionsKey);
      
      const sessions: ShortTermSession[] = [];

      for (const sessionId of sessionIds) {
        const messages = await this.getSessionMessages(userId, sessionId);
        if (messages.length > 0) {
          sessions.push({
            sessionId,
            messages,
            createdAt: messages[0]?.timestamp || new Date().toISOString(),
            lastAccessed: messages[messages.length - 1]?.timestamp || new Date().toISOString(),
            messageCount: messages.length
          });
        }
      }

      // 最新順にソート
      sessions.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

      console.log('✅ Retrieved user sessions:', {
        userId: userId.substring(0, 8) + '...',
        sessionCount: sessions.length
      });

      return sessions;
    } catch (error) {
      console.error('❌ Failed to get user sessions:', error);
      return [];
    }
  }

  // 最近のメッセージ取得（複数セッションから）
  async getRecentMessages(userId: string, limit: number = 10): Promise<ShortTermMessage[]> {
    const sessions = await this.getUserSessions(userId);
    const allMessages: ShortTermMessage[] = [];

    // 全セッションからメッセージを収集
    for (const session of sessions) {
      allMessages.push(...session.messages);
    }

    // タイムスタンプで最新順にソート
    allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return allMessages.slice(0, limit);
  }

  // セッション削除
  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    if (!await this.ensureConnection()) {
      return false;
    }

    const client = redisClient.getClient();
    if (!client) return false;

    try {
      const sessionKey = this.getSessionKey(userId, sessionId);
      const userSessionsKey = this.getUserSessionsKey(userId);

      await client.del(sessionKey);
      await client.sRem(userSessionsKey, sessionId);

      console.log('✅ Short-term session deleted:', {
        userId: userId.substring(0, 8) + '...',
        sessionId: sessionId.substring(0, 8) + '...'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to delete short-term session:', error);
      return false;
    }
  }

  // 期限切れセッションのクリーンアップ
  async cleanup(userId: string): Promise<{ deleted: number }> {
    if (!await this.ensureConnection()) {
      return { deleted: 0 };
    }

    const client = redisClient.getClient();
    if (!client) return { deleted: 0 };

    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await client.sMembers(userSessionsKey);
      let deletedCount = 0;

      for (const sessionId of sessionIds) {
        const sessionKey = this.getSessionKey(userId, sessionId);
        const exists = await client.exists(sessionKey);
        
        if (!exists) {
          // セッションが期限切れの場合、セッション一覧からも削除
          await client.sRem(userSessionsKey, sessionId);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log('🧹 Cleaned up expired sessions:', {
          userId: userId.substring(0, 8) + '...',
          deletedCount
        });
      }

      return { deleted: deletedCount };
    } catch (error) {
      console.error('❌ Failed to cleanup short-term memory:', error);
      return { deleted: 0 };
    }
  }

  // サービス状態確認
  async getServiceStatus(): Promise<{
    connected: boolean;
    ping: boolean;
    error?: string;
  }> {
    try {
      const connected = await this.ensureConnection();
      if (!connected) {
        return { connected: false, ping: false, error: 'Connection failed' };
      }

      const ping = await redisClient.ping();
      return { connected, ping };
    } catch (error) {
      return { 
        connected: false, 
        ping: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// シングルトンインスタンス
export const shortTermMemoryService = ShortTermMemoryService.getInstance();
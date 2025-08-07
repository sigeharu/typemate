// 🎵 TypeMate Redis Client
// 短期記憶用Redis接続管理

import * as redis from 'redis';
type RedisClientType = ReturnType<typeof redis.createClient>;

export class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    try {
      // Redis Cloud用の接続設定
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379');
      const redisUsername = process.env.REDIS_USERNAME || 'default';
      const redisPassword = process.env.REDIS_PASSWORD || '';
      const useSSL = process.env.REDIS_SSL === 'true' || process.env.REDIS_TLS === 'true';
      
      console.log('🔄 Connecting to Redis:', { host: redisHost, port: redisPort, ssl: useSSL });
      
      // Redis Cloudとの互換性のため個別パラメータを使用
      this.client = redis.createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          connectTimeout: 10000,
          reconnectStrategy: (retries) => {
            if (retries > 3) return new Error('Max retries reached');
            return Math.min(retries * 100, 3000);
          },
          ...(useSSL && {
            tls: {
              rejectUnauthorized: false,
              servername: redisHost,
              minVersion: 'TLSv1.2'
            }
          })
        },
        username: redisUsername,
        password: redisPassword
      });

      // エラーハンドリング
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('🔄 Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('📴 Redis connection ended');
        this.isConnected = false;
      });

      // 接続実行
      await this.client.connect();
      console.log('✅ Redis connected successfully');
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.client = null;
      this.isConnected = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
      this.connectionPromise = null;
      console.log('📴 Redis disconnected');
    }
  }

  getClient(): RedisClientType | null {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  // ヘルスチェック
  async ping(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        return false;
      }
      const response = await this.client.ping();
      return response === 'PONG';
    } catch (error) {
      console.error('❌ Redis ping failed:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const redisClient = RedisClient.getInstance();
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
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // 🛡️ 環境変数の検証：REDIS_URL優先、個別設定をフォールバック
      let redisHost: string;
      let redisPort: number;
      let redisUsername: string;
      let redisPassword: string;
      let useSSL: boolean;

      // REDIS_URLが設定されている場合はそれを優先
      if (process.env.REDIS_URL) {
        const redisUrl = new URL(process.env.REDIS_URL);
        redisHost = redisUrl.hostname;
        redisPort = parseInt(redisUrl.port);
        redisUsername = redisUrl.username || 'default';
        redisPassword = redisUrl.password || '';
        useSSL = redisUrl.protocol === 'rediss:';
        
        console.log('🔗 Using REDIS_URL configuration');
      } else {
        // 個別環境変数を使用（従来の方法）
        redisHost = process.env.REDIS_HOST || '';
        redisPort = parseInt(process.env.REDIS_PORT || '6379');
        redisUsername = process.env.REDIS_USERNAME || 'default';
        redisPassword = process.env.REDIS_PASSWORD || '';
        useSSL = process.env.REDIS_SSL === 'true' || process.env.REDIS_TLS === 'true';
        
        console.log('🔧 Using individual Redis environment variables');
      }

      // 必須パラメータチェック
      if (!redisHost || !redisPassword) {
        throw new Error('Missing required Redis configuration: host and password are required');
      }
      
      if (isNaN(redisPort) || redisPort <= 0) {
        throw new Error('Invalid Redis port: must be a positive number');
      }
      
      console.log('🔄 Connecting to Redis:', { 
        host: redisHost, 
        port: redisPort, 
        ssl: useSSL,
        environment: isDevelopment ? 'development' : 'production'
      });
      
      // Redis Cloudとの互換性のため個別パラメータを使用
      this.client = redis.createClient({
        socket: {
          host: redisHost,
          port: redisPort,
          connectTimeout: 10000,
          commandTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) return new Error('Max retries reached');
            return Math.min(retries * 100, 3000);
          },
          ...(useSSL && {
            tls: {
              // 🛡️ 本番環境では証明書検証を有効化
              rejectUnauthorized: !isDevelopment,
              servername: redisHost,
              minVersion: 'TLSv1.2',
              // 開発環境でのみ自己署名証明書許可
              ...(isDevelopment && {
                checkServerIdentity: () => undefined
              })
            }
          })
        },
        username: redisUsername,
        password: redisPassword,
        // 🛡️ セキュリティ強化設定
        socket: {
          ...{
            host: redisHost,
            port: redisPort,
            connectTimeout: 10000,
            commandTimeout: 5000,
            reconnectStrategy: (retries) => {
              if (retries > 3) return new Error('Max retries reached');
              return Math.min(retries * 100, 3000);
            }
          },
          ...(useSSL && {
            tls: {
              rejectUnauthorized: !isDevelopment,
              servername: redisHost,
              minVersion: 'TLSv1.2',
              ...(isDevelopment && {
                checkServerIdentity: () => undefined
              })
            }
          })
        },
        // 接続プール設定
        isolationPoolOptions: {
          min: 2,
          max: 10
        }
      });

      // 🔄 強化されたエラーハンドリング
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
        
        // 重大エラーの場合は再接続試行停止
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
          console.error('🚨 Redis connection critically failed, stopping reconnection attempts');
        }
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

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // 接続実行
      await this.client.connect();
      console.log('✅ Redis connected successfully');
      
      // 🧪 接続テスト
      const pingResult = await this.client.ping();
      if (pingResult !== 'PONG') {
        throw new Error('Redis ping test failed');
      }
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.client = null;
      this.isConnected = false;
      this.connectionPromise = null;
      
      // 開発環境では詳細なエラー情報を表示
      if (process.env.NODE_ENV === 'development') {
        console.error('🔧 Redis connection debug info:', {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          hasPassword: !!process.env.REDIS_PASSWORD,
          ssl: process.env.REDIS_SSL === 'true' || process.env.REDIS_TLS === 'true'
        });
      }
      
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
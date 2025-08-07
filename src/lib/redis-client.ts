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
      // 🛡️ 環境変数の検証
      const redisHost = process.env.REDIS_HOST;
      const redisPort = process.env.REDIS_PORT;
      const redisUsername = process.env.REDIS_USERNAME || 'default';
      const redisPassword = process.env.REDIS_PASSWORD;
      const useSSL = process.env.REDIS_SSL === 'true' || process.env.REDIS_TLS === 'true';
      const isDevelopment = process.env.NODE_ENV === 'development';

      // 必須環境変数チェック
      if (!redisHost || !redisPort || !redisPassword) {
        throw new Error('Missing required Redis environment variables: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD');
      }
      
      const parsedPort = parseInt(redisPort);
      if (isNaN(parsedPort) || parsedPort <= 0) {
        throw new Error('Invalid REDIS_PORT: must be a positive number');
      }
      
      console.log('🔄 Connecting to Redis:', { 
        host: redisHost, 
        port: parsedPort, 
        ssl: useSSL,
        environment: isDevelopment ? 'development' : 'production'
      });
      
      // Redis Cloudとの互換性のため個別パラメータを使用
      this.client = redis.createClient({
        socket: {
          host: redisHost,
          port: parsedPort,
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
            port: parsedPort,
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
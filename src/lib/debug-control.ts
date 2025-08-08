// 🛡️ TypeMate Debug Control System
// 環境別デバッグログの統一制御

export type DebugLevel = 'verbose' | 'info' | 'warn' | 'error' | 'silent';
export type DebugCategory = 'auth' | 'supabase' | 'redis' | 'ai' | 'vector' | 'performance' | 'security' | 'general';

interface DebugConfig {
  level: DebugLevel;
  categories: Record<DebugCategory, boolean>;
  showTimestamps: boolean;
  showFileLocation: boolean;
  filterSensitiveData: boolean;
}

class DebugController {
  private config: DebugConfig;
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // 環境別デフォルト設定
    this.config = this.getEnvironmentConfig();
  }

  private getEnvironmentConfig(): DebugConfig {
    // 本番環境：最小限のログのみ
    if (this.isProduction) {
      return {
        level: 'error',
        categories: {
          auth: false,
          supabase: false,
          redis: false,
          ai: false,
          vector: false,
          performance: true,  // パフォーマンス監視は本番でも有効
          security: true,     // セキュリティログは本番でも有効
          general: false
        },
        showTimestamps: true,
        showFileLocation: false,
        filterSensitiveData: true
      };
    }

    // 開発環境：詳細なデバッグ情報
    return {
      level: process.env.DEBUG_LEVEL as DebugLevel || 'info',
      categories: {
        auth: process.env.DEBUG_AUTH !== 'false',
        supabase: process.env.DEBUG_SUPABASE !== 'false',
        redis: process.env.DEBUG_REDIS !== 'false',
        ai: process.env.DEBUG_AI !== 'false',
        vector: process.env.DEBUG_VECTOR !== 'false',
        performance: process.env.DEBUG_PERFORMANCE !== 'false',
        security: process.env.DEBUG_SECURITY !== 'false',
        general: process.env.DEBUG_GENERAL !== 'false'
      },
      showTimestamps: process.env.DEBUG_TIMESTAMPS !== 'false',
      showFileLocation: process.env.DEBUG_FILE_LOCATION === 'true',
      filterSensitiveData: process.env.DEBUG_FILTER_SENSITIVE !== 'false'
    };
  }

  /**
   * カテゴリとレベルに基づいてデバッグメッセージを出力
   */
  log(
    category: DebugCategory, 
    level: DebugLevel, 
    message: string, 
    data?: any,
    fileLocation?: string
  ): void {
    // レベル制御
    if (!this.shouldLog(level)) return;
    
    // カテゴリ制御
    if (!this.config.categories[category]) return;

    // メッセージの構築
    let finalMessage = this.formatMessage(category, level, message, fileLocation);
    
    // データの処理
    let processedData = data;
    if (data && this.config.filterSensitiveData) {
      processedData = this.sanitizeData(data);
    }

    // 出力
    this.output(level, finalMessage, processedData);
  }

  /**
   * 各カテゴリ専用のログ関数を提供
   */
  auth = this.createCategoryLogger('auth');
  supabase = this.createCategoryLogger('supabase');
  redis = this.createCategoryLogger('redis');
  ai = this.createCategoryLogger('ai');
  vector = this.createCategoryLogger('vector');
  performance = this.createCategoryLogger('performance');
  security = this.createCategoryLogger('security');
  general = this.createCategoryLogger('general');

  private createCategoryLogger(category: DebugCategory) {
    return {
      verbose: (message: string, data?: any, fileLocation?: string) => 
        this.log(category, 'verbose', message, data, fileLocation),
      info: (message: string, data?: any, fileLocation?: string) => 
        this.log(category, 'info', message, data, fileLocation),
      warn: (message: string, data?: any, fileLocation?: string) => 
        this.log(category, 'warn', message, data, fileLocation),
      error: (message: string, data?: any, fileLocation?: string) => 
        this.log(category, 'error', message, data, fileLocation),
    };
  }

  private shouldLog(level: DebugLevel): boolean {
    const levels: DebugLevel[] = ['verbose', 'info', 'warn', 'error', 'silent'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    if (this.config.level === 'silent') return false;
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(category: DebugCategory, level: DebugLevel, message: string, fileLocation?: string): string {
    let parts: string[] = [];

    // タイムスタンプ
    if (this.config.showTimestamps) {
      parts.push(new Date().toISOString());
    }

    // レベルアイコン
    const levelIcons = {
      verbose: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      silent: ''
    };
    parts.push(levelIcons[level]);

    // カテゴリアイコン
    const categoryIcons = {
      auth: '🔐',
      supabase: '🗄️',
      redis: '📦',
      ai: '🤖',
      vector: '🧠',
      performance: '📊',
      security: '🛡️',
      general: '📝'
    };
    parts.push(`${categoryIcons[category]} ${category.toUpperCase()}`);

    // ファイル位置
    if (this.config.showFileLocation && fileLocation) {
      parts.push(`[${fileLocation}]`);
    }

    // メッセージ
    parts.push(message);

    return parts.join(' ');
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'apiKey', 'api_key',
      'authorization', 'cookie', 'session', 'jwt', 'bearer',
      'email', 'phone', 'address', 'creditCard', 'ssn'
    ];

    const sanitized = JSON.parse(JSON.stringify(data));

    const sanitizeObject = (obj: any): void => {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            sanitizeObject(item);
          }
        });
        return;
      }

      for (const key in obj) {
        if (sensitiveKeys.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey.toLowerCase())
        )) {
          if (typeof obj[key] === 'string' && obj[key].length > 4) {
            obj[key] = obj[key].substring(0, 4) + '***[REDACTED]***';
          } else {
            obj[key] = '[REDACTED]';
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  private output(level: DebugLevel, message: string, data?: any): void {
    switch (level) {
      case 'verbose':
      case 'info':
        if (data) {
          console.log(message, data);
        } else {
          console.log(message);
        }
        break;
      case 'warn':
        if (data) {
          console.warn(message, data);
        } else {
          console.warn(message);
        }
        break;
      case 'error':
        if (data) {
          console.error(message, data);
        } else {
          console.error(message);
        }
        break;
    }
  }

  /**
   * 設定の動的更新
   */
  updateConfig(updates: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): DebugConfig {
    return { ...this.config };
  }

  /**
   * パフォーマンス測定用のヘルパー
   */
  measurePerformance<T>(
    name: string, 
    fn: () => Promise<T>,
    category: DebugCategory = 'performance'
  ): Promise<T> {
    const start = performance.now();
    
    return fn().then(result => {
      const duration = performance.now() - start;
      this.log(category, 'info', `Performance: ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      return result;
    }).catch(error => {
      const duration = performance.now() - start;
      this.log(category, 'error', `Performance (failed): ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    });
  }
}

// シングルトンインスタンス
export const debugController = new DebugController();

// 便利な短縮形エクスポート
export const debug = debugController;
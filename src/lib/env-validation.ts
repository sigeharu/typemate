// 🛡️ TypeMate Environment Variable Validation System
// 設定値の検証と安全なフォールバック管理

interface EnvValidationResult<T> {
  value: T;
  isFromEnv: boolean;
  isValid: boolean;
  warnings: string[];
}

export class EnvValidator {
  private static warnings: string[] = [];

  /**
   * Supabase URL の検証と取得
   */
  static getSupabaseUrl(): EnvValidationResult<string> {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fallbackUrl = 'https://ypwvkihattwxushbwsig.supabase.co';
    const warnings: string[] = [];

    // 環境変数が設定されている場合
    if (envUrl && envUrl.trim() !== '') {
      try {
        const url = new URL(envUrl);
        const isSupabaseUrl = url.hostname.endsWith('.supabase.co');
        const hasValidProtocol = url.protocol === 'https:';

        if (isSupabaseUrl && hasValidProtocol) {
          return {
            value: envUrl,
            isFromEnv: true,
            isValid: true,
            warnings: []
          };
        } else {
          warnings.push('Invalid Supabase URL format in environment variable');
        }
      } catch (error) {
        warnings.push('Invalid URL format in NEXT_PUBLIC_SUPABASE_URL');
      }
    }

    // フォールバック使用
    if (process.env.NODE_ENV === 'production') {
      warnings.push('Using hardcoded Supabase URL in production. Please set NEXT_PUBLIC_SUPABASE_URL');
    }

    return {
      value: fallbackUrl,
      isFromEnv: false,
      isValid: true,
      warnings
    };
  }

  /**
   * Supabase APIキーの検証と取得
   */
  static getSupabaseKey(): EnvValidationResult<string> {
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlwd3ZraWhhdHR3eHVzaGJ3c2lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5ODM0MzUsImV4cCI6MjA2ODU1OTQzNX0.i6RCPWQLpWg_LwSTWZKkodf5DbLPTo2kbRIREIKtUGc';
    const warnings: string[] = [];

    // 環境変数が設定されている場合
    if (envKey && envKey.trim() !== '') {
      const jwtPattern = /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$/;
      
      if (jwtPattern.test(envKey)) {
        return {
          value: envKey,
          isFromEnv: true,
          isValid: true,
          warnings: []
        };
      } else {
        warnings.push('Invalid API key format in environment variable');
      }
    }

    // フォールバック使用
    if (process.env.NODE_ENV === 'production') {
      warnings.push('Using hardcoded Supabase API key in production. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    return {
      value: fallbackKey,
      isFromEnv: false,
      isValid: true,
      warnings
    };
  }

  /**
   * Redis設定の検証
   */
  static validateRedisConfig(): EnvValidationResult<boolean> {
    const warnings: string[] = [];
    const requiredVars = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      warnings.push(`Missing required Redis environment variables: ${missing.join(', ')}`);
      return {
        value: false,
        isFromEnv: false,
        isValid: false,
        warnings
      };
    }

    // ポート番号の検証
    const port = parseInt(process.env.REDIS_PORT || '');
    if (isNaN(port) || port <= 0) {
      warnings.push('Invalid REDIS_PORT: must be a positive number');
      return {
        value: false,
        isFromEnv: false,
        isValid: false,
        warnings
      };
    }

    return {
      value: true,
      isFromEnv: true,
      isValid: true,
      warnings
    };
  }

  /**
   * AI APIキーの検証
   */
  static validateAIKeys(): EnvValidationResult<{ claude: boolean; openai: boolean }> {
    const warnings: string[] = [];
    const claudeKey = process.env.CLAUDE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const claudeValid = !!(claudeKey && claudeKey.trim() !== '');
    const openaiValid = !!(openaiKey && openaiKey.trim() !== '');

    if (!claudeValid) {
      warnings.push('Missing CLAUDE_API_KEY environment variable');
    }
    if (!openaiValid) {
      warnings.push('Missing OPENAI_API_KEY environment variable');
    }

    return {
      value: { claude: claudeValid, openai: openaiValid },
      isFromEnv: claudeValid || openaiValid,
      isValid: claudeValid && openaiValid,
      warnings
    };
  }

  /**
   * 全体的な環境変数ヘルスチェック
   */
  static performHealthCheck(): {
    supabase: EnvValidationResult<{ url: string; key: string }>;
    redis: EnvValidationResult<boolean>;
    ai: EnvValidationResult<{ claude: boolean; openai: boolean }>;
    overallValid: boolean;
    allWarnings: string[];
  } {
    const supabaseUrl = this.getSupabaseUrl();
    const supabaseKey = this.getSupabaseKey();
    const redis = this.validateRedisConfig();
    const ai = this.validateAIKeys();

    const supabase = {
      value: { url: supabaseUrl.value, key: supabaseKey.value },
      isFromEnv: supabaseUrl.isFromEnv && supabaseKey.isFromEnv,
      isValid: supabaseUrl.isValid && supabaseKey.isValid,
      warnings: [...supabaseUrl.warnings, ...supabaseKey.warnings]
    };

    const allWarnings = [
      ...supabase.warnings,
      ...redis.warnings,
      ...ai.warnings
    ];

    const overallValid = supabase.isValid && redis.isValid && ai.isValid;

    // 開発環境でのみ詳細ログ
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('🛡️ Environment Variables Health Check:', {
        supabase: { valid: supabase.isValid, fromEnv: supabase.isFromEnv },
        redis: { valid: redis.isValid, fromEnv: redis.isFromEnv },
        ai: { valid: ai.isValid, fromEnv: ai.isFromEnv },
        overallValid,
        warningCount: allWarnings.length
      });
      
      if (allWarnings.length > 0) {
        console.warn('⚠️ Configuration Warnings:', allWarnings);
      }
    }

    return {
      supabase,
      redis,
      ai,
      overallValid,
      allWarnings
    };
  }
}
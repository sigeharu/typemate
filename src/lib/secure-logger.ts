// 🛡️ TypeMate Secure Logger
// 本番環境でのログ出力制御とセキュリティ強化

interface LogData {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
  timestamp: string;
  environment: string;
}

// 🛡️ 本番環境ではコンソール出力を無効化
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// セキュアログ関数
export const secureLog = {
  debug: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔧 [DEBUG] ${message}`, data || '');
    }
    // 本番環境では出力しない
  },

  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
    // 本番環境では重要なもののみ記録
    if (isProduction && isSecurityRelevant(message)) {
      logSecurely('info', message, data);
    }
  },

  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`⚠️ [WARN] ${message}`, data || '');
    }
    // 本番環境でも警告は記録
    if (isProduction) {
      logSecurely('warn', message, sanitizeData(data));
    }
  },

  error: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.error(`❌ [ERROR] ${message}`, data || '');
    }
    // 本番環境でもエラーは必ず記録（個人情報は除去）
    if (isProduction) {
      logSecurely('error', message, sanitizeData(data));
    }
  }
};

// セキュリティ関連ログかどうかを判定
function isSecurityRelevant(message: string): boolean {
  const securityKeywords = [
    'auth', 'login', 'unauthorized', 'attack', 'injection',
    'csrf', 'xss', 'rate limit', 'suspicious'
  ];
  return securityKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

// データの個人情報を除去
function sanitizeData(data: unknown): unknown {
  if (!data) return data;
  
  if (typeof data === 'object') {
    const sanitized = { ...data as Record<string, unknown> };
    
    // 個人情報の除去
    const sensitiveKeys = [
      'email', 'password', 'token', 'key', 'secret',
      'birthDate', 'location', 'name', 'phone'
    ];
    
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  return data;
}

// セキュアなログ記録（本番環境用）
function logSecurely(level: LogData['level'], message: string, data?: unknown) {
  const logEntry: LogData = {
    level,
    message,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  };
  
  // 本番環境では外部ログサービスに送信
  // （例：Vercel Analytics, Sentry等）
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'log_event', {
      level,
      message: message.substring(0, 100), // メッセージを制限
      timestamp: logEntry.timestamp
    });
  }
}

// 🛡️ パフォーマンス監視用のセキュアログ
export const performanceLog = {
  metric: (name: string, value: number, rating?: string) => {
    if (isDevelopment) {
      console.log(`🎵 Performance Metric: ${name}=${value} (${rating || 'unknown'})`);
    }
    
    // 本番環境ではパフォーマンスデータのみ送信
    if (isProduction && typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'performance', {
        metric: name,
        value,
        rating
      });
    }
  },

  error: (message: string) => {
    secureLog.error(`Performance Error: ${message}`);
  }
};

// 🛡️ セキュリティイベント専用ログ
export const securityLog = {
  suspiciousActivity: (activity: string, details?: unknown) => {
    const message = `Suspicious Activity: ${activity}`;
    secureLog.warn(message, details);
  },

  authFailure: (reason: string) => {
    const message = `Authentication Failure: ${reason}`;
    secureLog.warn(message);
  },

  rateLimitExceeded: (endpoint: string, ip?: string) => {
    const message = `Rate Limit Exceeded: ${endpoint}`;
    secureLog.warn(message, { endpoint, ip: ip ? '[REDACTED]' : undefined });
  }
};

// 既存のconsole.logを本番環境で無効化
if (isProduction && typeof window !== 'undefined') {
  // 本番環境では console.log を無効化
  console.log = () => {};
  console.debug = () => {};
  console.info = secureLog.info;
  console.warn = secureLog.warn;
  console.error = secureLog.error;
}
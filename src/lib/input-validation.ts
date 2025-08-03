// 🛡️ TypeMate Input Validation & Sanitization
// セキュリティ強化のための入力検証とサニタイゼーション

import { securityLog } from './secure-logger';

// 🛡️ 一般的な入力検証
export const validateInput = {
  // メッセージの検証とサニタイゼーション
  message: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Message must be a non-empty string' };
    }

    // 最大長制限
    if (input.length > 10000) {
      securityLog.suspiciousActivity('Oversized message input', { length: input.length });
      return { isValid: false, sanitized: '', error: 'Message too long' };
    }

    // 危険なスクリプトの検出
    const dangerousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        securityLog.suspiciousActivity('Dangerous script detected in message', { pattern: pattern.source });
        return { isValid: false, sanitized: '', error: 'Invalid content detected' };
      }
    }

    // HTMLエンティティエスケープ
    const sanitized = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();

    return { isValid: true, sanitized };
  },

  // ユーザータイプの検証
  userType: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'User type is required' };
    }

    const validTypes = [
      'ARC-AS', 'ARC-AG', 'ARC-CS', 'ARC-CG',
      'DRM-AS', 'DRM-AG', 'DRM-CS', 'DRM-CG',
      'HER-AS', 'HER-AG', 'HER-CS', 'HER-CG',
      'INV-AS', 'INV-AG', 'INV-CS', 'INV-CG',
      'SAG-AS', 'SAG-AG', 'SAG-CS', 'SAG-CG',
      'BAR-AS', 'BAR-AG', 'BAR-CS', 'BAR-CG',
      'ARS-AS', 'ARS-AG', 'ARS-CS', 'ARS-CG',
      'DEF-AS', 'DEF-AG', 'DEF-CS', 'DEF-CG'
    ];

    if (!validTypes.includes(input)) {
      securityLog.suspiciousActivity('Invalid user type provided', { userType: input });
      return { isValid: false, sanitized: '', error: 'Invalid user type' };
    }

    return { isValid: true, sanitized: input };
  },

  // AIパーソナリティの検証
  aiPersonality: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'AI personality is required' };
    }

    const validPersonalities = ['ARC', 'DRM', 'HER', 'INV', 'SAG', 'BAR', 'ARS', 'DEF'];

    if (!validPersonalities.includes(input)) {
      securityLog.suspiciousActivity('Invalid AI personality provided', { personality: input });
      return { isValid: false, sanitized: '', error: 'Invalid AI personality' };
    }

    return { isValid: true, sanitized: input };
  },

  // 関係性タイプの検証
  relationshipType: (input: string): { isValid: boolean; sanitized: string; error?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: 'friend', error: undefined }; // デフォルト値
    }

    const validTypes = ['friend', 'counselor', 'romantic', 'mentor'];

    if (!validTypes.includes(input)) {
      securityLog.suspiciousActivity('Invalid relationship type provided', { relationshipType: input });
      return { isValid: true, sanitized: 'friend', error: undefined }; // デフォルトにフォールバック
    }

    return { isValid: true, sanitized: input };
  },

  // 数値の検証
  number: (input: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): { isValid: boolean; sanitized: number; error?: string } => {
    const num = Number(input);

    if (isNaN(num)) {
      return { isValid: false, sanitized: 0, error: 'Must be a valid number' };
    }

    if (num < min || num > max) {
      securityLog.suspiciousActivity('Number out of range', { input, min, max });
      return { isValid: false, sanitized: 0, error: `Number must be between ${min} and ${max}` };
    }

    return { isValid: true, sanitized: Math.floor(num) };
  },

  // 配列の検証
  array: (input: unknown, maxLength: number = 100): { isValid: boolean; sanitized: any[]; error?: string } => {
    if (!Array.isArray(input)) {
      return { isValid: true, sanitized: [], error: undefined }; // 空配列にフォールバック
    }

    if (input.length > maxLength) {
      securityLog.suspiciousActivity('Array too large', { length: input.length, maxLength });
      return { isValid: false, sanitized: [], error: 'Array too large' };
    }

    return { isValid: true, sanitized: input };
  },

  // オブジェクトの検証
  object: (input: unknown): { isValid: boolean; sanitized: Record<string, any>; error?: string } => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { isValid: true, sanitized: {}, error: undefined }; // 空オブジェクトにフォールバック
    }

    // オブジェクトのキーをサニタイゼーション
    const sanitized: Record<string, any> = {};
    const safeKeys = ['name', 'birthday', 'userType', 'aiPersonality', 'relationshipType'];

    for (const [key, value] of Object.entries(input as Record<string, any>)) {
      if (safeKeys.includes(key) && typeof value === 'string') {
        sanitized[key] = value.slice(0, 100); // 最大100文字
      }
    }

    return { isValid: true, sanitized };
  }
};

// 🛡️ API リクエストの包括的検証
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, any>;
}

export function validateChatRequest(body: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, any> = {};

  // 必須フィールドの検証
  const messageValidation = validateInput.message(body.message);
  if (!messageValidation.isValid) {
    errors.push(messageValidation.error || 'Invalid message');
  } else {
    sanitizedData.message = messageValidation.sanitized;
  }

  const userTypeValidation = validateInput.userType(body.userType);
  if (!userTypeValidation.isValid) {
    errors.push(userTypeValidation.error || 'Invalid user type');
  } else {
    sanitizedData.userType = userTypeValidation.sanitized;
  }

  const aiPersonalityValidation = validateInput.aiPersonality(body.aiPersonality);
  if (!aiPersonalityValidation.isValid) {
    errors.push(aiPersonalityValidation.error || 'Invalid AI personality');
  } else {
    sanitizedData.aiPersonality = aiPersonalityValidation.sanitized;
  }

  // オプショナルフィールドの検証
  const relationshipValidation = validateInput.relationshipType(body.relationshipType);
  sanitizedData.relationshipType = relationshipValidation.sanitized;

  const conversationTurnValidation = validateInput.number(body.conversationTurn, 0, 10000);
  sanitizedData.conversationTurn = conversationTurnValidation.sanitized;

  const relationshipLevelValidation = validateInput.number(body.relationshipLevel, 1, 6);
  sanitizedData.relationshipLevel = relationshipLevelValidation.sanitized;

  const chatCountValidation = validateInput.number(body.chatCount, 0, 100000);
  sanitizedData.chatCount = chatCountValidation.sanitized;

  const privacyLevelValidation = validateInput.number(body.privacyLevel, 1, 5);
  sanitizedData.privacyLevel = privacyLevelValidation.sanitized;

  // 配列フィールドの検証
  const historyValidation = validateInput.array(body.messageHistory, 20);
  sanitizedData.messageHistory = historyValidation.sanitized;

  const memoriesValidation = validateInput.array(body.importantMemories, 50);
  sanitizedData.importantMemories = memoriesValidation.sanitized;

  const relatedValidation = validateInput.array(body.relatedMemories, 50);
  sanitizedData.relatedMemories = relatedValidation.sanitized;

  const eventsValidation = validateInput.array(body.todaysEvents, 10);
  sanitizedData.todaysEvents = eventsValidation.sanitized;

  // オブジェクトフィールドの検証
  const personalInfoValidation = validateInput.object(body.personalInfo);
  sanitizedData.personalInfo = personalInfoValidation.sanitized;

  // 文字列フィールド
  if (typeof body.currentMood === 'string') {
    sanitizedData.currentMood = body.currentMood.slice(0, 10);
  } else {
    sanitizedData.currentMood = '😊';
  }

  if (typeof body.moodContext === 'string') {
    const moodContextValidation = validateInput.message(body.moodContext);
    sanitizedData.moodContext = moodContextValidation.sanitized;
  } else {
    sanitizedData.moodContext = '';
  }

  // セキュリティ関連フィールド（ログのみ、処理はしない）
  if (body.encryptedMessage || body.contentHash || body.sessionKey) {
    securityLog.suspiciousActivity('Encryption fields detected', {
      hasEncrypted: !!body.encryptedMessage,
      hasHash: !!body.contentHash,
      hasSessionKey: !!body.sessionKey
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// 🛡️ レート制限チェック
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const current = rateLimitMap.get(identifier);
  
  if (!current || current.lastReset < windowStart) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return true;
  }

  if (current.count >= maxRequests) {
    securityLog.rateLimitExceeded('chat-api', identifier);
    return false;
  }

  current.count++;
  return true;
}

// 🛡️ 本番環境でのセキュリティ検証
export function validateProductionSecurity(request: Request): { isValid: boolean; error?: string } {
  // Content-Type検証
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    securityLog.suspiciousActivity('Invalid content type', { contentType });
    return { isValid: false, error: 'Invalid content type' };
  }

  // Origin検証（本番環境）
  if (process.env.NODE_ENV === 'production') {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'https://typemate.vercel.app',
      'https://typemate-miyamotoseiyou.vercel.app',
      'https://typemate-zeta.vercel.app', // 🚨 緊急追加: 現在の本番URL
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      securityLog.suspiciousActivity('Invalid origin', { origin, allowed: allowedOrigins });
      return { isValid: false, error: 'Invalid origin' };
    }
  }

  return { isValid: true };
}
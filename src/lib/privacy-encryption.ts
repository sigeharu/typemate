// 🎵 TypeMate Privacy Engine
// エンドツーエンド暗号化システム - 音楽的に美しく、完全に安全

import CryptoJS from 'crypto-js';

export class PrivacyEngine {
  /**
   * ユーザー固有の暗号化キーを生成
   * @param userId ユーザーID（セッション識別用）
   * @param sessionKey セッション固有キー
   * @returns 256bit暗号化キー
   */
  static generateUserKey(userId: string, sessionKey: string): string {
    return CryptoJS.PBKDF2(sessionKey, userId, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }

  /**
   * メッセージをクライアントサイドで暗号化
   * @param message 平文メッセージ
   * @param userKey 暗号化キー
   * @returns 暗号化されたメッセージ
   */
  static encryptMessage(message: string, userKey: string): string {
    try {
      return CryptoJS.AES.encrypt(message, userKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('暗号化に失敗しました');
    }
  }

  /**
   * 暗号化されたメッセージをクライアントサイドで復号化
   * @param encryptedMessage 暗号化されたメッセージ
   * @param userKey 復号化キー
   * @returns 復号化された平文
   */
  static decryptMessage(encryptedMessage: string, userKey: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, userKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('復号化結果が空です');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('復号化に失敗しました。キーが正しくない可能性があります。');
    }
  }

  /**
   * コンテンツの整合性ハッシュを生成
   * @param content コンテンツ
   * @returns SHA256ハッシュ値
   */
  static generateContentHash(content: string): string {
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * セッション固有の安全なキーを生成
   * @returns ランダムなセッションキー
   */
  static generateSessionKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  /**
   * 暗号化データの検証
   * @param encryptedData 暗号化データ
   * @param originalHash 元のハッシュ値
   * @param userKey 復号化キー
   * @returns 整合性チェック結果
   */
  static verifyIntegrity(encryptedData: string, originalHash: string, userKey: string): boolean {
    try {
      const decrypted = this.decryptMessage(encryptedData, userKey);
      const currentHash = this.generateContentHash(decrypted);
      return currentHash === originalHash;
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return false;
    }
  }

  /**
   * プライバシー保護レベルの判定
   * @param message メッセージ内容
   * @returns 保護レベル（1-3）
   */
  static getPrivacyLevel(message: string): number {
    const sensitiveKeywords = [
      '名前', 'パスワード', '住所', '電話', 'メール', '誕生日',
      '秘密', 'プライベート', '内緒', '大切', '重要'
    ];
    
    const foundKeywords = sensitiveKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length >= 3) return 3; // 高レベル
    if (foundKeywords.length >= 1) return 2; // 中レベル
    return 1; // 基本レベル
  }
}

// 🎵 プライバシー保護インターフェース
export interface EncryptedMessage {
  encrypted: string;      // 暗号化されたコンテンツ
  hash: string;          // 整合性ハッシュ
  timestamp: number;     // 暗号化時刻
  privacyLevel: number;  // プライバシーレベル
}

/**
 * メッセージの完全暗号化処理
 * @param message 平文メッセージ
 * @param userKey 暗号化キー
 * @returns 暗号化済みメッセージオブジェクト
 */
export function createEncryptedMessage(message: string, userKey: string): EncryptedMessage {
  const encrypted = PrivacyEngine.encryptMessage(message, userKey);
  const hash = PrivacyEngine.generateContentHash(message);
  const privacyLevel = PrivacyEngine.getPrivacyLevel(message);
  
  return {
    encrypted,
    hash,
    timestamp: Date.now(),
    privacyLevel
  };
}
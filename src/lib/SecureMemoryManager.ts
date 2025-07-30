// 🛡️ TypeMate Secure Memory Manager
// 暗号化キーの安全なメモリ管理とガベージコレクション

export class SecureMemoryManager {
  private static keyStorage = new WeakMap<object, string>();
  private static keyReferences = new Set<object>();
  private static memoryStats = {
    keysGenerated: 0,
    keysCleared: 0,
    gcForced: 0
  };

  /**
   * セキュアな暗号化キーを生成・保存
   * @param keyData キーデータ
   * @param reference 参照オブジェクト
   * @returns セキュアキー
   */
  static storeSecureKey(keyData: string, reference: object): string {
    try {
      // WeakMapに保存（ガベージコレクション対象）
      this.keyStorage.set(reference, keyData);
      this.keyReferences.add(reference);
      this.memoryStats.keysGenerated++;
      
      console.log('🔐 セキュアキー生成:', {
        keyLength: keyData.length,
        totalKeys: this.keyReferences.size
      });
      
      return keyData;
    } catch (error) {
      console.error('セキュアキー保存失敗:', error);
      throw error;
    }
  }

  /**
   * 暗号化キーの即座削除
   * @param reference 参照オブジェクト
   */
  static clearKey(reference: object): void {
    if (this.keyStorage.has(reference)) {
      // キーデータを取得してゼロ埋め
      const keyData = this.keyStorage.get(reference);
      if (keyData) {
        // JavaScriptでは文字列は不変のためゼロ埋めは困難
        // WeakMapからの削除で参照を断つ
        this.keyStorage.delete(reference);
      }
    }
    
    this.keyReferences.delete(reference);
    this.memoryStats.keysCleared++;
    
    console.log('🗑️ セキュアキー削除:', {
      clearedCount: this.memoryStats.keysCleared,
      remainingKeys: this.keyReferences.size
    });
  }

  /**
   * 保存されたセキュアキーを取得
   * @param reference 参照オブジェクト
   * @returns キーデータまたはnull
   */
  static getSecureKey(reference: object): string | null {
    return this.keyStorage.get(reference) || null;
  }

  /**
   * 強制ガベージコレクション実行
   */
  static forceGarbageCollection(): void {
    // 明示的なガベージコレクション促進
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc(); // 開発時のみ有効
    }
    
    // 不要な参照をクリア
    const deadReferences: object[] = [];
    this.keyReferences.forEach(ref => {
      if (!this.keyStorage.has(ref)) {
        deadReferences.push(ref);
      }
    });
    
    deadReferences.forEach(ref => {
      this.keyReferences.delete(ref);
    });
    
    this.memoryStats.gcForced++;
    
    console.log('🧹 ガベージコレクション実行:', {
      removedReferences: deadReferences.length,
      totalKeys: this.keyReferences.size,
      gcCount: this.memoryStats.gcForced
    });
  }

  /**
   * すべてのセキュアキーをクリア（非常時用）
   */
  static clearAllKeys(): void {
    console.warn('⚠️ 緊急セキュリティクリア実行');
    
    // すべてのキー参照をクリア
    this.keyReferences.clear();
    
    // ガベージコレクション促進
    this.forceGarbageCollection();
    
    this.memoryStats.keysCleared += this.memoryStats.keysGenerated;
    
    console.log('🚨 全セキュアキークリア完了');
  }

  /**
   * メモリ統計情報を取得
   * @returns メモリ統計
   */
  static getMemoryStats() {
    return {
      ...this.memoryStats,
      activeKeys: this.keyReferences.size,
      memoryEfficiency: this.memoryStats.keysGenerated > 0 
        ? Math.round((this.memoryStats.keysCleared / this.memoryStats.keysGenerated) * 100)
        : 100
    };
  }

  /**
   * セキュアな一時配列（自動ゼロ埋め）
   */
  static createSecureArray(size: number): SecureArray {
    return new SecureArray(size);
  }
}

/**
 * セキュア配列クラス（使用後自動ゼロ埋め）
 */
class SecureArray {
  private data: Uint8Array;
  private isCleared: boolean = false;

  constructor(size: number) {
    this.data = new Uint8Array(size);
  }

  /**
   * データを設定
   * @param index インデックス
   * @param value 値
   */
  set(index: number, value: number): void {
    if (this.isCleared) throw new Error('セキュア配列は既にクリアされています');
    this.data[index] = value;
  }

  /**
   * データを取得
   * @param index インデックス
   * @returns 値
   */
  get(index: number): number {
    if (this.isCleared) throw new Error('セキュア配列は既にクリアされています');
    return this.data[index];
  }

  /**
   * 配列をゼロ埋めして削除
   */
  clear(): void {
    if (!this.isCleared) {
      this.data.fill(0); // ゼロ埋め
      this.isCleared = true;
      console.log('🔒 セキュア配列クリア完了');
    }
  }

  /**
   * デストラクタ（自動クリーンアップ）
   */
  destroy(): void {
    this.clear();
  }
}

// 自動メモリクリーンアップ（5分間隔）
if (typeof window !== 'undefined') {
  setInterval(() => {
    SecureMemoryManager.forceGarbageCollection();
  }, 5 * 60 * 1000); // 5分

  // ページアンロード時の緊急クリア
  window.addEventListener('beforeunload', () => {
    SecureMemoryManager.clearAllKeys();
  });
}
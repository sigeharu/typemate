// 🎵 TypeMate User Profile Cache
// N+1クエリ問題解決のためのメモリキャッシュ

import { supabase } from './supabase-simple';

export interface UserProfile {
  user_id: string;
  display_name?: string;
  birth_date?: string;
  user_type?: string;
  selected_ai_personality?: string;
  relationship_type?: 'friend' | 'counselor' | 'romantic' | 'mentor';
  preferences?: any;
  created_at: string;
  updated_at: string;
}

export class UserProfileCache {
  private static cache = new Map<string, {
    profile: UserProfile | null;
    timestamp: number;
    ttl: number;
  }>();
  
  // キャッシュのTTL（ミリ秒）
  private static DEFAULT_TTL = 5 * 60 * 1000; // 5分
  
  /**
   * ユーザープロファイルを取得（キャッシュ優先）
   */
  static async getUserProfile(userId: string, ttl: number = this.DEFAULT_TTL): Promise<UserProfile | null> {
    try {
      // キャッシュ確認
      const cached = this.cache.get(userId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < cached.ttl) {
        console.log('📋 UserProfile cache hit:', userId);
        return cached.profile;
      }
      
      // データベースから取得
      console.log('🔄 UserProfile cache miss, fetching from DB:', userId);
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, birth_date, user_type, selected_ai_personality, relationship_type, preferences, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.warn('⚠️ UserProfile fetch error:', error);
        return null;
      }
      
      const profile = profiles?.[0] || null;
      
      // キャッシュに保存
      this.cache.set(userId, {
        profile,
        timestamp: now,
        ttl
      });
      
      console.log('✅ UserProfile cached:', { userId, hasProfile: !!profile });
      return profile;
      
    } catch (error) {
      console.error('❌ UserProfile cache error:', error);
      return null;
    }
  }
  
  /**
   * 複数ユーザーのプロファイルを一括取得
   */
  static async getUserProfiles(userIds: string[], ttl: number = this.DEFAULT_TTL): Promise<Map<string, UserProfile | null>> {
    const results = new Map<string, UserProfile | null>();
    const uncachedIds: string[] = [];
    const now = Date.now();
    
    // キャッシュチェック
    for (const userId of userIds) {
      const cached = this.cache.get(userId);
      if (cached && (now - cached.timestamp) < cached.ttl) {
        results.set(userId, cached.profile);
      } else {
        uncachedIds.push(userId);
      }
    }
    
    // 未キャッシュのものを一括取得
    if (uncachedIds.length > 0) {
      try {
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, birth_date, user_type, selected_ai_personality, relationship_type, preferences, created_at, updated_at')
          .in('user_id', uncachedIds)
          .order('updated_at', { ascending: false });
        
        if (!error && profiles) {
          // 結果をマップ化してキャッシュ
          const profileMap = new Map<string, UserProfile>();
          profiles.forEach(profile => {
            profileMap.set(profile.user_id, profile);
          });
          
          uncachedIds.forEach(userId => {
            const profile = profileMap.get(userId) || null;
            results.set(userId, profile);
            
            // キャッシュに保存
            this.cache.set(userId, {
              profile,
              timestamp: now,
              ttl
            });
          });
        }
      } catch (error) {
        console.error('❌ Batch UserProfile fetch error:', error);
        // エラー時は未取得IDをnullに設定
        uncachedIds.forEach(userId => results.set(userId, null));
      }
    }
    
    console.log('📊 UserProfile batch result:', { 
      total: userIds.length, 
      cached: userIds.length - uncachedIds.length,
      fetched: uncachedIds.length 
    });
    
    return results;
  }
  
  /**
   * 特定ユーザーのキャッシュを無効化
   */
  static invalidateUser(userId: string): void {
    this.cache.delete(userId);
    console.log('🗑️ UserProfile cache invalidated:', userId);
  }
  
  /**
   * 全キャッシュをクリア
   */
  static clearAll(): void {
    this.cache.clear();
    console.log('🧹 UserProfile cache cleared');
  }
  
  /**
   * 期限切れキャッシュをクリーンアップ
   */
  static cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [userId, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) >= cached.ttl) {
        this.cache.delete(userId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log('🧹 UserProfile cache cleanup:', { removed: cleanedCount, remaining: this.cache.size });
    }
  }
  
  /**
   * キャッシュ統計情報
   */
  static getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    for (const [_, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) < cached.ttl) {
        validCount++;
      } else {
        expiredCount++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount
    };
  }
}

// 定期クリーンアップ（10分間隔）
if (typeof window !== 'undefined') {
  setInterval(() => {
    UserProfileCache.cleanup();
  }, 10 * 60 * 1000);
}
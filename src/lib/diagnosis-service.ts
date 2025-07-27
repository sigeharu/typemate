// 🔬 TypeMate 診断結果永続化サービス
// 診断結果のSupabase保存・復元・管理機能

import { supabase } from './supabase-simple';
import type { Type64, BaseArchetype } from '@/types';
import type { Database } from '@/types/database';

// 診断結果型定義
export interface DiagnosisResult {
  userType: Type64;
  answers: Record<number, string>;
  baseArchetype: BaseArchetype;
  environmentAxis: 'A' | 'C';
  motivationAxis: 'S' | 'G';
  createdAt: Date;
}

// 診断状況型定義
export interface DiagnosisStatus {
  hasDiagnosis: boolean;
  userType?: Type64;
  aiPersonality?: BaseArchetype;
  lastDiagnosisDate?: Date;
  canRetakeDiagnosis: boolean;
}

class DiagnosisService {
  // 🎵 診断結果をデータベースに保存
  async saveDiagnosisResult(
    userType: Type64, 
    answers: Record<number, string>
  ): Promise<boolean> {
    try {
      // 認証ユーザー取得
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('❌ 未認証ユーザー - ローカルストレージのみ保存');
        this.saveToLocalStorage(userType, answers);
        return false;
      }

      console.log('💾 診断結果をデータベースに保存開始:', { userType, userId: user.id });

      // BaseArchetypeとバリエーションを分離
      const [baseArchetype, variation] = userType.split('-') as [BaseArchetype, string];
      const environmentAxis = variation[0] as 'A' | 'C';
      const motivationAxis = variation[1] as 'S' | 'G';

      // 1. diagnostic_results テーブルに保存（テーブルが存在しない場合はスキップ）
      try {
        const { error: diagnosticError } = await supabase
          .from('diagnostic_results')
          .insert({
            user_id: user.id,
            user_type: userType,
            answers: answers,
            is_guest: false
          });

        if (diagnosticError) {
          console.warn('⚠️ diagnostic_results保存スキップ（テーブル未作成？）:', diagnosticError);
          // エラーをスローせず、user_profilesへの保存を続行
        } else {
          console.log('✅ diagnostic_results保存成功');
        }
      } catch (error) {
        console.warn('⚠️ diagnostic_resultsテーブルアクセスエラー、スキップして続行:', error);
      }

      // 2. user_profiles テーブルにupsert
      const upsertData = {
        user_id: user.id,
        user_type: userType,
        selected_ai_personality: this.getCompatibleAIPersonality(baseArchetype),
        relationship_type: 'friend' as const,
        preferences: {
          baseArchetype,
          environmentAxis,
          motivationAxis,
          diagnosisDate: new Date().toISOString()
        }
      };

      console.log('💾 user_profiles保存データ:', upsertData);

      // まず既存レコードを確認
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let upsertResult, profileError;

      if (existingProfile) {
        // 既存レコードを更新
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            user_type: upsertData.user_type,
            selected_ai_personality: upsertData.selected_ai_personality,
            relationship_type: upsertData.relationship_type,
            preferences: upsertData.preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select();
        
        upsertResult = data;
        profileError = error;
      } else {
        // 新規レコードを挿入
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(upsertData)
          .select();
        
        upsertResult = data;
        profileError = error;
      }

      console.log('💾 user_profiles保存結果:', { upsertResult, error: profileError?.message });

      if (profileError) {
        console.error('❌ user_profiles保存エラー:', profileError);
        throw profileError;
      }

      // LocalStorageにもバックアップ保存
      this.saveToLocalStorage(userType, answers);

      console.log('✅ 診断結果データベース保存完了');
      return true;

    } catch (error) {
      console.error('❌ 診断結果保存失敗:', error);
      // フォールバック: LocalStorageに保存
      this.saveToLocalStorage(userType, answers);
      return false;
    }
  }

  // 🎵 ユーザーの診断状況を取得
  async getDiagnosisStatus(userId?: string): Promise<DiagnosisStatus> {
    try {
      // 認証ユーザー取得
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.log('🔍 診断状況確認: 未認証ユーザー');
          return this.getLocalDiagnosisStatus();
        }
        targetUserId = user.id;
      }

      console.log('🔍 診断状況確認開始:', { userId: targetUserId });

      // メイン: diagnostic_resultsテーブルから診断状況確認（保存が成功しているため）
      try {
        const { data: diagnosticResults, error: diagnosticError } = await supabase
          .from('diagnostic_results')
          .select('user_type, created_at, answers')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('🔍 diagnostic_results結果:', { 
          diagnosticResults, 
          error: diagnosticError?.message, 
          errorCode: diagnosticError?.code 
        });

        // diagnostic_resultsに結果がある場合
        if (diagnosticResults && diagnosticResults.length > 0) {
          const latestResult = diagnosticResults[0];
          
          // AI人格を診断結果から決定
          const [baseArchetype] = latestResult.user_type.split('-') as [BaseArchetype, string];
          const aiPersonality = this.getCompatibleAIPersonality(baseArchetype);
          
          console.log('✅ diagnostic_resultsから診断済み確認:', { 
            userType: latestResult.user_type, 
            aiPersonality,
            createdAt: latestResult.created_at 
          });

          return {
            hasDiagnosis: true,
            userType: latestResult.user_type as Type64,
            aiPersonality: aiPersonality as BaseArchetype,
            lastDiagnosisDate: new Date(latestResult.created_at),
            canRetakeDiagnosis: true
          };
        }
      } catch (error) {
        console.warn('⚠️ diagnostic_resultsテーブルアクセスエラー:', error);
      }

      // フォールバック: user_profilesテーブルから確認
      try {
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('user_type, selected_ai_personality, created_at, preferences')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(1);

        const profile = profiles?.[0];

        console.log('🔍 user_profiles結果:', { profile, error: error?.message, errorCode: error?.code });

        if (profile && profile.user_type) {
          const lastDiagnosisDate = profile.preferences?.diagnosisDate 
            ? new Date(profile.preferences.diagnosisDate) 
            : new Date(profile.created_at);

          // AI人格の取得（保存されていない場合は診断結果から自動選択）
          const [baseArchetype] = profile.user_type.split('-') as [BaseArchetype, string];
          const aiPersonality = profile.selected_ai_personality || this.getCompatibleAIPersonality(baseArchetype);

          console.log('✅ user_profilesから診断済み確認:', { 
            userType: profile.user_type, 
            aiPersonality,
            lastDiagnosisDate 
          });

          return {
            hasDiagnosis: true,
            userType: profile.user_type as Type64,
            aiPersonality: aiPersonality as BaseArchetype,
            lastDiagnosisDate,
            canRetakeDiagnosis: true
          };
        }
      } catch (error) {
        console.warn('⚠️ user_profilesテーブルアクセスエラー:', error);
      }

      // データベースに診断結果がない場合、LocalStorageを確認
      console.log('⚠️ DB診断結果なし、LocalStorage確認');
      return this.getLocalDiagnosisStatus();

    } catch (error) {
      console.error('❌ 診断状況取得エラー:', error);
      return this.getLocalDiagnosisStatus();
    }
  }

  // 🎵 診断結果を復元
  async getDiagnosisResult(userId?: string): Promise<DiagnosisResult | null> {
    try {
      // 認証ユーザー取得
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          return this.getLocalDiagnosisResult();
        }
        targetUserId = user.id;
      }

      // 最新の診断結果を取得
      const { data: diagnostic, error } = await supabase
        .from('diagnostic_results')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('診断結果取得エラー:', error);
        return this.getLocalDiagnosisResult();
      }

      if (diagnostic) {
        const [baseArchetype, variation] = diagnostic.user_type.split('-') as [BaseArchetype, string];
        
        return {
          userType: diagnostic.user_type as Type64,
          answers: diagnostic.answers as Record<number, string>,
          baseArchetype,
          environmentAxis: variation[0] as 'A' | 'C',
          motivationAxis: variation[1] as 'S' | 'G',
          createdAt: new Date(diagnostic.created_at)
        };
      }

      return this.getLocalDiagnosisResult();

    } catch (error) {
      console.error('診断結果復元エラー:', error);
      return this.getLocalDiagnosisResult();
    }
  }

  // 🎵 診断をやり直す（再診断機能）
  async retakeDiagnosis(userId?: string): Promise<boolean> {
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          // LocalStorageをクリア
          localStorage.removeItem('userType64');
          return true;
        }
        targetUserId = user.id;
      }

      // user_profilesのuser_typeをクリア
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          user_type: null,
          preferences: {}
        })
        .eq('user_id', targetUserId);

      if (profileError) {
        console.warn('プロフィール更新エラー:', profileError);
      }

      // LocalStorageもクリア
      localStorage.removeItem('userType64');
      
      console.log('✅ 診断データクリア完了 - 再診断可能');
      return true;

    } catch (error) {
      console.error('再診断準備エラー:', error);
      return false;
    }
  }

  // === プライベートヘルパーメソッド ===

  // LocalStorageに診断結果保存
  private saveToLocalStorage(userType: Type64, answers: Record<number, string>): void {
    try {
      localStorage.setItem('userType64', userType);
      localStorage.setItem('diagnosisAnswers', JSON.stringify(answers));
      localStorage.setItem('diagnosisDate', new Date().toISOString());
      console.log('💾 LocalStorage保存完了');
    } catch (error) {
      console.warn('LocalStorage保存エラー:', error);
    }
  }

  // LocalStorageから診断状況取得
  private getLocalDiagnosisStatus(): DiagnosisStatus {
    const userType = localStorage.getItem('userType64') as Type64;
    const diagnosisDate = localStorage.getItem('diagnosisDate');

    console.log('🔍 LocalStorage診断状況:', { userType, diagnosisDate });

    if (userType) {
      // AI人格を診断結果から決定
      const [baseArchetype] = userType.split('-') as [BaseArchetype, string];
      const aiPersonality = this.getCompatibleAIPersonality(baseArchetype);
      
      return {
        hasDiagnosis: true,
        userType,
        aiPersonality: aiPersonality as BaseArchetype,
        lastDiagnosisDate: diagnosisDate ? new Date(diagnosisDate) : undefined,
        canRetakeDiagnosis: true
      };
    }

    return {
      hasDiagnosis: false,
      canRetakeDiagnosis: true
    };
  }

  // LocalStorageから診断結果取得
  private getLocalDiagnosisResult(): DiagnosisResult | null {
    try {
      const userType = localStorage.getItem('userType64') as Type64;
      const answersStr = localStorage.getItem('diagnosisAnswers');
      const diagnosisDate = localStorage.getItem('diagnosisDate');

      if (!userType) return null;

      const answers = answersStr ? JSON.parse(answersStr) : {};
      const [baseArchetype, variation] = userType.split('-') as [BaseArchetype, string];

      return {
        userType,
        answers,
        baseArchetype,
        environmentAxis: variation[0] as 'A' | 'C',
        motivationAxis: variation[1] as 'S' | 'G',
        createdAt: diagnosisDate ? new Date(diagnosisDate) : new Date()
      };
    } catch (error) {
      console.warn('LocalStorage診断結果取得エラー:', error);
      return null;
    }
  }

  // BaseArchetypeに基づいて互換性のあるAI人格を選択
  private getCompatibleAIPersonality(baseArchetype: BaseArchetype): string {
    const compatibilityMap: Record<BaseArchetype, BaseArchetype[]> = {
      // 分析家系
      'ARC': ['DRM', 'SAG', 'BAR'], // 設計主 → 外交官系と相性良好
      'ALC': ['SAG', 'HER', 'DRM'], // 錬金術師 → 賢者・英雄・夢想家
      'SOV': ['HER', 'EXE', 'PRO'], // 統率者 → 英雄・役員・保護者
      'INV': ['BAR', 'PER', 'PIO'], // 発明家 → 吟遊詩人・表現者・開拓者
      
      // 外交官系
      'SAG': ['ARC', 'ALC', 'DRM'], // 賢者 → 分析家系と相性良好
      'DRM': ['ARC', 'SAG', 'BAR'], // 夢想家 → 設計主・賢者・吟遊詩人
      'HER': ['SOV', 'ALC', 'PRO'], // 英雄 → 統率者・錬金術師・保護者
      'BAR': ['INV', 'DRM', 'PER'], // 吟遊詩人 → 発明家・夢想家・表現者
      
      // 番人系
      'GUA': ['DEF', 'ART', 'ARS'], // 守護者 → 防衛者・職人・芸術家
      'DEF': ['GUA', 'PRO', 'ARS'], // 防衛者 → 守護者・保護者・芸術家
      'EXE': ['SOV', 'PRO', 'PIO'], // 役員 → 統率者・保護者・開拓者
      'PRO': ['HER', 'EXE', 'DEF'], // 保護者 → 英雄・役員・防衛者
      
      // 探検家系
      'ART': ['GUA', 'ARS', 'PIO'], // 職人 → 守護者・芸術家・開拓者
      'ARS': ['DEF', 'ART', 'PER'], // 芸術家 → 防衛者・職人・表現者
      'PIO': ['EXE', 'ART', 'INV'], // 開拓者 → 役員・職人・発明家
      'PER': ['BAR', 'ARS', 'INV']  // 表現者 → 吟遊詩人・芸術家・発明家
    };

    const compatibleTypes = compatibilityMap[baseArchetype];
    // 最初の互換性タイプを選択（後で設定で変更可能）
    return compatibleTypes[0];
  }
}

// シングルトンインスタンスとしてエクスポート
export const diagnosisService = new DiagnosisService();
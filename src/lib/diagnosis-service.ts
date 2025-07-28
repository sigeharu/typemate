// 🔬 TypeMate 診断結果永続化サービス
// 診断結果のSupabase保存・復元・管理機能

import { supabase } from './supabase-simple';
import type { Type64, BaseArchetype } from '@/types';
import type { Database } from '@/types/database';

// 相性スコア定義
export interface CompatibilityScore {
  archetype: BaseArchetype;
  score: number; // 100点満点
  reason: string; // 相性の理由
}

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
  // 🎵 診断結果をデータベースに保存（詳細結果対応）
  async saveDiagnosisResult(
    userType: Type64, 
    answers: Record<number, string>,
    detailedResult?: DetailedDiagnosisResult
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

      // 2. user_profiles テーブルにupsert（詳細結果含む）
      const upsertData = {
        user_id: user.id,
        user_type: userType,
        selected_ai_personality: this.getCompatibleAIPersonality(baseArchetype),
        relationship_type: 'friend' as const,
        preferences: {
          baseArchetype,
          environmentAxis,
          motivationAxis,
          diagnosisDate: new Date().toISOString(),
          // 🎯 詳細診断結果をpreferencesに含める
          detailedDiagnosisResult: detailedResult || null
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
          const [baseArchetype] = latestResult.user_type.split('-') as [BaseArchetype, string];

          // user_profilesからsaved AI personalityを取得
          let savedAiPersonality = null;
          try {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('selected_ai_personality')
              .eq('user_id', targetUserId)
              .single();
            
            savedAiPersonality = profiles?.selected_ai_personality;
            console.log('🔍 user_profilesから保存済みAI人格取得:', savedAiPersonality);
          } catch (error) {
            console.warn('⚠️ user_profiles AI人格取得エラー:', error);
          }

          // 優先順位: 1) 保存されたAI人格 2) 診断結果から計算
          const aiPersonality = savedAiPersonality || this.getCompatibleAIPersonality(baseArchetype);
          
          console.log('✅ diagnostic_resultsから診断済み確認:', { 
            userType: latestResult.user_type, 
            savedAiPersonality,
            calculatedAiPersonality: this.getCompatibleAIPersonality(baseArchetype),
            finalAiPersonality: aiPersonality,
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

          // AI人格の取得（保存されたselected_ai_personalityを優先使用）
          const [baseArchetype] = profile.user_type.split('-') as [BaseArchetype, string];
          const aiPersonality = profile.selected_ai_personality || this.getCompatibleAIPersonality(baseArchetype);

          console.log('✅ user_profilesから診断済み確認:', { 
            userType: profile.user_type, 
            savedAiPersonality: profile.selected_ai_personality,
            calculatedAiPersonality: aiPersonality,
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

  // BaseArchetypeに基づいて相性ランキングを取得
  getCompatibilityRanking(baseArchetype: BaseArchetype): CompatibilityScore[] {
    const rankings: Record<BaseArchetype, CompatibilityScore[]> = {
      // 分析家系
      'ARC': [ // 設計主
        { archetype: 'DRM', score: 95, reason: '創造性と論理性の完璧な融合' },
        { archetype: 'SAG', score: 90, reason: '深い洞察力で互いを理解' },
        { archetype: 'BAR', score: 85, reason: '知的好奇心を刺激し合う関係' },
        { archetype: 'HER', score: 80, reason: '理想と戦略の調和' },
        { archetype: 'ALC', score: 75, reason: '同じ分析家として共鳴' },
        { archetype: 'PRO', score: 70, reason: '守りと攻めのバランス' },
        { archetype: 'INV', score: 65, reason: '革新的アイデアの交換' },
        { archetype: 'PER', score: 60, reason: '感性と論理の新しい組み合わせ' }
      ],
      'ALC': [ // 錬金術師
        { archetype: 'SAG', score: 95, reason: '知識と知恵の深い共有' },
        { archetype: 'HER', score: 90, reason: '理想主義者同士の共鳴' },
        { archetype: 'DRM', score: 85, reason: '創造的な思考の融合' },
        { archetype: 'ARC', score: 80, reason: '分析力の相互補完' },
        { archetype: 'BAR', score: 75, reason: '芸術的センスの共有' },
        { archetype: 'PRO', score: 70, reason: '思いやりの深い関係' },
        { archetype: 'DEF', score: 65, reason: '静かで安定した絆' },
        { archetype: 'ARS', score: 60, reason: '美意識の共鳴' }
      ],
      'SOV': [ // 統率者
        { archetype: 'HER', score: 95, reason: 'リーダーシップの相互尊重' },
        { archetype: 'EXE', score: 90, reason: '実行力と統率力の融合' },
        { archetype: 'PRO', score: 85, reason: '守りと攻めの理想的バランス' },
        { archetype: 'SAG', score: 80, reason: '知恵とカリスマの組み合わせ' },
        { archetype: 'PIO', score: 75, reason: '冒険と戦略の調和' },
        { archetype: 'ARC', score: 70, reason: '計画と実行の完璧な連携' },
        { archetype: 'GUA', score: 65, reason: '責任感の深い共有' },
        { archetype: 'ALC', score: 60, reason: '理想と現実の橋渡し' }
      ],
      'INV': [ // 発明家
        { archetype: 'BAR', score: 95, reason: '創造性と表現力の爆発的融合' },
        { archetype: 'PER', score: 90, reason: '自由な発想で刺激し合う' },
        { archetype: 'PIO', score: 85, reason: '冒険心と革新性の共鳴' },
        { archetype: 'DRM', score: 80, reason: '夢想と革新の美しい調和' },
        { archetype: 'ARS', score: 75, reason: '芸術的革新の追求' },
        { archetype: 'HER', score: 70, reason: '理想実現への共同歩行' },
        { archetype: 'SAG', score: 65, reason: '知恵と発明の相互啓発' },
        { archetype: 'ARC', score: 60, reason: '論理と直感の新しい融合' }
      ],
      
      // 外交官系
      'SAG': [ // 賢者
        { archetype: 'ARC', score: 95, reason: '深い思考と洞察の共有' },
        { archetype: 'ALC', score: 90, reason: '知識探求の理想的パートナー' },
        { archetype: 'DRM', score: 85, reason: '知恵と夢想の美しい調和' },
        { archetype: 'HER', score: 80, reason: '理想主義的な深い絆' },
        { archetype: 'SOV', score: 75, reason: '知恵とリーダーシップの融合' },
        { archetype: 'PRO', score: 70, reason: '思いやりと知恵の組み合わせ' },
        { archetype: 'INV', score: 65, reason: '革新的思考の刺激' },
        { archetype: 'GUA', score: 60, reason: '安定と成長の調和' }
      ],
      'DRM': [ // 夢想家
        { archetype: 'ARC', score: 95, reason: '創造性と分析力の理想的融合' },
        { archetype: 'SAG', score: 90, reason: '夢と知恵の深い共鳴' },
        { archetype: 'BAR', score: 85, reason: '芸術的感性の共有' },
        { archetype: 'INV', score: 80, reason: '革新的夢想の実現' },
        { archetype: 'HER', score: 75, reason: '理想主義者同士の絆' },
        { archetype: 'PER', score: 70, reason: '自由な表現の共鳴' },
        { archetype: 'ARS', score: 65, reason: '美的センスの共有' },
        { archetype: 'ALC', score: 60, reason: '創造的思考の交流' }
      ],
      'HER': [ // 英雄
        { archetype: 'SOV', score: 95, reason: 'リーダーシップの相互尊重' },
        { archetype: 'ALC', score: 90, reason: '理想実現への共同歩行' },
        { archetype: 'PRO', score: 85, reason: '保護と理想の美しい調和' },
        { archetype: 'SAG', score: 80, reason: '知恵と勇気の組み合わせ' },
        { archetype: 'EXE', score: 75, reason: '実行力と理想の融合' },
        { archetype: 'DRM', score: 70, reason: '夢と現実の橋渡し' },
        { archetype: 'GUA', score: 65, reason: '守護精神の共有' },
        { archetype: 'INV', score: 60, reason: '革新的理想の追求' }
      ],
      'BAR': [ // 吟遊詩人
        { archetype: 'INV', score: 95, reason: '創造性の爆発的な融合' },
        { archetype: 'DRM', score: 90, reason: '芸術的夢想の共鳴' },
        { archetype: 'PER', score: 85, reason: '表現力の相互啓発' },
        { archetype: 'ARS', score: 80, reason: '芸術的感性の深い共有' },
        { archetype: 'ARC', score: 75, reason: '創造性と論理の調和' },
        { archetype: 'PIO', score: 70, reason: '自由な精神の共鳴' },
        { archetype: 'SAG', score: 65, reason: '知恵と芸術の融合' },
        { archetype: 'HER', score: 60, reason: '理想と表現の組み合わせ' }
      ],
      
      // 番人系
      'GUA': [ // 守護者
        { archetype: 'DEF', score: 95, reason: '守護精神の深い共有' },
        { archetype: 'ART', score: 90, reason: '堅実さと技術の融合' },
        { archetype: 'ARS', score: 85, reason: '安定と美の調和' },
        { archetype: 'PRO', score: 80, reason: '保護本能の相互理解' },
        { archetype: 'EXE', score: 75, reason: '責任感の共有' },
        { archetype: 'SOV', score: 70, reason: '守りと統率の組み合わせ' },
        { archetype: 'SAG', score: 65, reason: '安定と知恵の調和' },
        { archetype: 'HER', score: 60, reason: '守護と理想の融合' }
      ],
      'DEF': [ // 防衛者
        { archetype: 'GUA', score: 95, reason: '守護精神の完璧な共鳴' },
        { archetype: 'PRO', score: 90, reason: '思いやりの深い絆' },
        { archetype: 'ARS', score: 85, reason: '静かな美しさの共有' },
        { archetype: 'ART', score: 80, reason: '職人気質の相互理解' },
        { archetype: 'HER', score: 75, reason: '保護と理想の調和' },
        { archetype: 'ALC', score: 70, reason: '内向的な深い理解' },
        { archetype: 'SAG', score: 65, reason: '静かな知恵の交流' },
        { archetype: 'DRM', score: 60, reason: '優しい夢想の共有' }
      ],
      'EXE': [ // 役員
        { archetype: 'SOV', score: 95, reason: 'リーダーシップの理想的融合' },
        { archetype: 'PRO', score: 90, reason: '実行力と思いやりの調和' },
        { archetype: 'PIO', score: 85, reason: '実行力と冒険心の組み合わせ' },
        { archetype: 'HER', score: 80, reason: '実行力と理想の融合' },
        { archetype: 'GUA', score: 75, reason: '責任感の深い共有' },
        { archetype: 'ARC', score: 70, reason: '戦略と実行の完璧な連携' },
        { archetype: 'SAG', score: 65, reason: '実行力と知恵の組み合わせ' },
        { archetype: 'DEF', score: 60, reason: '堅実な実行の共鳴' }
      ],
      'PRO': [ // 保護者
        { archetype: 'HER', score: 95, reason: '保護と理想の美しい調和' },
        { archetype: 'EXE', score: 90, reason: '思いやりと実行力の融合' },
        { archetype: 'DEF', score: 85, reason: '深い思いやりの共鳴' },
        { archetype: 'SOV', score: 80, reason: 'リーダーシップと保護の調和' },
        { archetype: 'GUA', score: 75, reason: '守護精神の共有' },
        { archetype: 'SAG', score: 70, reason: '知恵と思いやりの組み合わせ' },
        { archetype: 'ALC', score: 65, reason: '理想主義的な思いやり' },
        { archetype: 'ARS', score: 60, reason: '美しい思いやりの表現' }
      ],
      
      // 探検家系
      'ART': [ // 職人
        { archetype: 'GUA', score: 95, reason: '職人気質と堅実さの融合' },
        { archetype: 'ARS', score: 90, reason: '技術と芸術の理想的調和' },
        { archetype: 'PIO', score: 85, reason: '実践力と冒険心の組み合わせ' },
        { archetype: 'DEF', score: 80, reason: '堅実な技術の共鳴' },
        { archetype: 'INV', score: 75, reason: '革新的技術の追求' },
        { archetype: 'EXE', score: 70, reason: '実行力と技術の融合' },
        { archetype: 'ARC', score: 65, reason: '論理と技術の組み合わせ' },
        { archetype: 'PRO', score: 60, reason: '思いやりのある技術' }
      ],
      'ARS': [ // 芸術家
        { archetype: 'DEF', score: 95, reason: '静かな美しさの深い共鳴' },
        { archetype: 'ART', score: 90, reason: '芸術と技術の完璧な融合' },
        { archetype: 'PER', score: 85, reason: '芸術表現の相互啓発' },
        { archetype: 'BAR', score: 80, reason: '芸術的感性の深い共有' },
        { archetype: 'GUA', score: 75, reason: '安定した美の追求' },
        { archetype: 'DRM', score: 70, reason: '美しい夢想の共有' },
        { archetype: 'ALC', score: 65, reason: '内向的な美意識の共鳴' },
        { archetype: 'INV', score: 60, reason: '革新的芸術の創造' }
      ],
      'PIO': [ // 開拓者
        { archetype: 'EXE', score: 95, reason: '冒険心と実行力の爆発的融合' },
        { archetype: 'ART', score: 90, reason: '実践的冒険の追求' },
        { archetype: 'INV', score: 85, reason: '革新的冒険の共鳴' },
        { archetype: 'SOV', score: 80, reason: 'リーダーシップと冒険の調和' },
        { archetype: 'PER', score: 75, reason: '自由な精神の共鳴' },
        { archetype: 'HER', score: 70, reason: '理想実現への冒険' },
        { archetype: 'BAR', score: 65, reason: '創造的冒険の追求' },
        { archetype: 'GUA', score: 60, reason: '堅実な冒険の組み合わせ' }
      ],
      'PER': [ // 表現者
        { archetype: 'BAR', score: 95, reason: '表現力の爆発的な融合' },
        { archetype: 'ARS', score: 90, reason: '芸術的表現の相互啓発' },
        { archetype: 'INV', score: 85, reason: '革新的表現の追求' },
        { archetype: 'DRM', score: 80, reason: '自由な夢想の表現' },
        { archetype: 'PIO', score: 75, reason: '自由な精神の共鳴' },
        { archetype: 'HER', score: 70, reason: '理想の表現' },
        { archetype: 'ARC', score: 65, reason: '論理的表現の新しい形' },
        { archetype: 'SAG', score: 60, reason: '知恵の表現' }
      ]
    };

    return rankings[baseArchetype] || [];
  }

  // BaseArchetypeに基づいて互換性のあるAI人格を選択（一定選択）
  private getCompatibleAIPersonality(baseArchetype: BaseArchetype, randomize: boolean = false): string {
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
    if (!compatibleTypes || compatibleTypes.length === 0) {
      return 'DRM'; // フォールバック
    }

    if (randomize && compatibleTypes.length > 1) {
      // 🎯 ランダムに相性の良いAIを選択
      const randomIndex = Math.floor(Math.random() * compatibleTypes.length);
      const selectedAI = compatibleTypes[randomIndex];
      console.log(`🎲 AI人格ランダム選択: ${baseArchetype} → ${selectedAI} (${randomIndex + 1}/${compatibleTypes.length})`);
      return selectedAI;
    }
    
    // デフォルトは最初の選択肢
    return compatibleTypes[0];
  }

  // 🎯 詳細診断結果をデータベースから取得する新機能
  async getDetailedDiagnosisResult(userId?: string): Promise<DetailedDiagnosisResult | null> {
    try {
      // 認証ユーザー取得
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.log('🔍 詳細診断結果取得: 未認証ユーザー - localStorageを確認');
          return this.getDetailedDiagnosisResultFromStorage();
        }
        targetUserId = user.id;
      }

      console.log('🔍 詳細診断結果取得開始:', { userId: targetUserId });

      // user_profilesテーブルから詳細診断結果を取得
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', targetUserId)
        .single();

      if (error || !profile) {
        console.log('⚠️ user_profiles詳細結果なし:', error?.message);
        return this.getDetailedDiagnosisResultFromStorage();
      }

      // preferences内のdetailedDiagnosisResultを取得
      const detailedResult = profile.preferences?.detailedDiagnosisResult;
      
      if (detailedResult) {
        console.log('✅ データベースから詳細診断結果取得成功:', detailedResult);
        return detailedResult as DetailedDiagnosisResult;
      }

      console.log('⚠️ DB内に詳細診断結果なし - localStorageフォールバック');
      return this.getDetailedDiagnosisResultFromStorage();

    } catch (error) {
      console.error('❌ 詳細診断結果取得エラー:', error);
      return this.getDetailedDiagnosisResultFromStorage();
    }
  }

  // localStorage/sessionStorageから詳細診断結果を取得
  private getDetailedDiagnosisResultFromStorage(): DetailedDiagnosisResult | null {
    try {
      // 1. localStorageを試行
      let savedResult = localStorage.getItem('detailedDiagnosisResult');
      
      // 2. sessionStorageフォールバック
      if (!savedResult) {
        savedResult = sessionStorage.getItem('detailedDiagnosisResult');
      }
      
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult) as DetailedDiagnosisResult;
        console.log('✅ ストレージから詳細診断結果取得成功');
        return parsedResult;
      }
      
      console.log('⚠️ ストレージにも詳細診断結果なし');
      return null;
    } catch (error) {
      console.warn('⚠️ ストレージ取得エラー:', error);
      return null;
    }
  }
}

// シングルトンインスタンスとしてエクスポート
export const diagnosisService = new DiagnosisService();
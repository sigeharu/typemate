// 🎵 TypeMate Settings Page
// AI理解度分析とプロファイル設定の統合画面

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Settings, 
  Trash2, 
  Save,
  Crown,
  Gem,
  Sparkles,
  Brain,
  RefreshCw,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { supabase } from '@/lib/supabase-simple';
import { MemoryManager, type PersonalInfo as MemoryPersonalInfo } from '@/lib/memory';
import { diagnosisService } from '@/lib/diagnosis-service';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { TypeDetailDisplayCompact } from '@/components/TypeDetailDisplay';
import { SelfAffirmationDisplayCompact } from '@/components/SelfAffirmationDisplay';
import { HarmonicProfileCard } from '@/components/harmonic/HarmonicProfileCard';
import { DailyGuidanceWidget } from '@/components/harmonic/DailyGuidanceWidget';
import { WeeklyGuidanceWidget } from '@/components/harmonic/WeeklyGuidanceWidget';
import { MonthlyGuidanceWidget } from '@/components/harmonic/MonthlyGuidanceWidget';
import { CompatibilityAnalysisWidget } from '@/components/harmonic/CompatibilityAnalysisWidget';
import { HarmonicSetupWizard } from '@/components/harmonic/HarmonicSetupWizard';
import { getHarmonicProfile, generateDailyHarmonicGuidance, deleteHarmonicProfile, createHarmonicProfile } from '@/lib/harmonic-ai-service';
import type { Type64, BaseArchetype, DetailedDiagnosisResult } from '@/types';
import type { HarmonicAIProfile, DailyHarmonicGuidance, MonthlyForecast } from '@/lib/harmonic-ai-service';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<Type64 | null>(null);
  const [detailedDiagnosisResult, setDetailedDiagnosisResult] = useState<DetailedDiagnosisResult | null>(null);
  const [selectedAiPersonality, setSelectedAiPersonality] = useState<BaseArchetype | null>(null);
  const [relationshipType, setRelationshipType] = useState<'friend' | 'counselor' | 'romantic' | 'mentor'>('friend');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 🔬 AI理解度分析関連のstate
  const [memoryPersonalInfo, setMemoryPersonalInfo] = useState<MemoryPersonalInfo>({ 
    collected_info: {}, 
    info_completeness: 0 
  });
  const [analysisProgress, setAnalysisProgress] = useState({
    basicData: 0,
    preferences: 0,
    values: 0,
    deepUnderstanding: 0
  });

  // 🌟 ハーモニックAI関連のstate
  const [harmonicProfile, setHarmonicProfile] = useState<HarmonicAIProfile | null>(null);
  const [dailyGuidance, setDailyGuidance] = useState<DailyHarmonicGuidance | null>(null);
  const [harmonicLoading, setHarmonicLoading] = useState(false);
  const [showHarmonicWizard, setShowHarmonicWizard] = useState(false);

  // 🌟 ハーモニックAIウィザード処理
  const handleHarmonicSetupComplete = async (profileData: {
    name: string;
    birthDate: Date;
    birthTime?: string;
    birthLocation?: string;
    privacySettings: {
      shareAstrologyData: boolean;
      showDailyGuidance: boolean;
      enableCosmicNotifications: boolean;
    };
  }) => {
    setHarmonicLoading(true);
    try {
      // 既存プロファイルがある場合は削除
      if (harmonicProfile) {
        await deleteHarmonicProfile(userId);
      }

      // 新しいプロファイルを作成
      const newProfile = await createHarmonicProfile(
        userId,
        profileData.name,
        profileData.birthDate,
        profileData.birthTime,
        profileData.birthLocation,
        userType || 'ARC-COOPERATIVESTABLE',
        selectedAiPersonality || 'ARC',
        relationshipType
      );

      // ガイダンス生成
      const guidance = await generateDailyHarmonicGuidance(newProfile);

      // 状態を更新
      setHarmonicProfile(newProfile);
      setDailyGuidance(guidance);
      setShowHarmonicWizard(false);

      console.log('✅ ハーモニックAI再設定完了');
    } catch (error) {
      console.error('❌ ハーモニックAI再設定エラー:', error);
      alert('再設定に失敗しました。しばらく後に再試行してください。');
    } finally {
      setHarmonicLoading(false);
    }
  };

  const handleHarmonicSetupCancel = () => {
    setShowHarmonicWizard(false);
  };


  // 🔍 モバイル専用デバッグ状態
  const [debugInfo, setDebugInfo] = useState<{
    attempts: number;
    lastAttemptTime: number;
    errors: string[];
    storageAccess: {
      localStorage: boolean;
      sessionStorage: boolean;
    };
    renderCount: number;
  }>({
    attempts: 0,
    lastAttemptTime: 0,
    errors: [],
    storageAccess: { localStorage: false, sessionStorage: false },
    renderCount: 0
  });

  // 🔄 詳細診断結果のデータベース読み込み関数（フォールバック機構付き）
  const loadDetailedDiagnosisResult = useCallback(async (userId?: string) => {
    const startTime = Date.now();
    
    // SSR対応: window オブジェクトの安全なアクセス
    if (typeof window === 'undefined') {
      console.warn('⚠️ SSR環境でのloadDetailedDiagnosisResult呼び出し');
      setDebugInfo(prev => ({ 
        ...prev,
        errors: [...prev.errors, 'SSR環境での呼び出し'],
        lastAttemptTime: startTime
      }));
      return;
    }
    
    const isMobile = window.innerWidth <= 768;
    console.log('📱 モバイルデバイス:', isMobile, 'window.innerWidth:', window.innerWidth);
    
    // デバッグ情報更新
    setDebugInfo(prev => ({ 
      ...prev,
      attempts: prev.attempts + 1,
      lastAttemptTime: startTime
    }));
    
    try {
      console.log('🔍 データベースから詳細診断結果を取得中...');
      
      // 1. データベースから取得（優先）
      const dbResult = await diagnosisService.getDetailedDiagnosisResult(userId);
      
      if (dbResult) {
        setDetailedDiagnosisResult(dbResult);
        console.log('✅ データベースから64タイプ詳細結果読み込み成功:', dbResult);
        console.log('📱 モバイルでの詳細タイプ表示:', isMobile ? '有効' : '無効');
        
        // ストレージアクセス成功をデバッグに記録
        setDebugInfo(prev => ({ 
          ...prev,
          storageAccess: { localStorage: true, sessionStorage: true }
        }));
        return;
      }
      
      console.log('⚠️ データベースに詳細診断結果なし - ストレージフォールバック実行');
      
      // 2. localStorage フォールバック
      try {
        const localResult = localStorage.getItem('detailedDiagnosisResult');
        if (localResult) {
          const parsedResult: DetailedDiagnosisResult = JSON.parse(localResult);
          setDetailedDiagnosisResult(parsedResult);
          console.log('✅ localStorageから64タイプ詳細結果読み込み成功:', parsedResult);
          
          setDebugInfo(prev => ({ 
            ...prev,
            storageAccess: { ...prev.storageAccess, localStorage: true }
          }));
          return;
        }
        
        setDebugInfo(prev => ({ 
          ...prev,
          storageAccess: { ...prev.storageAccess, localStorage: true }
        }));
      } catch (error) {
        const errorMsg = `localStorage読み取りエラー: ${error}`;
        console.warn('⚠️', errorMsg);
        setDebugInfo(prev => ({ 
          ...prev,
          errors: [...prev.errors, errorMsg],
          storageAccess: { ...prev.storageAccess, localStorage: false }
        }));
      }
      
      // 3. sessionStorage フォールバック
      try {
        const sessionResult = sessionStorage.getItem('detailedDiagnosisResult');
        if (sessionResult) {
          const parsedResult: DetailedDiagnosisResult = JSON.parse(sessionResult);
          setDetailedDiagnosisResult(parsedResult);
          console.log('✅ sessionStorageから64タイプ詳細結果読み込み成功:', parsedResult);
          
          setDebugInfo(prev => ({ 
            ...prev,
            storageAccess: { ...prev.storageAccess, sessionStorage: true }
          }));
          return;
        }
        
        setDebugInfo(prev => ({ 
          ...prev,
          storageAccess: { ...prev.storageAccess, sessionStorage: true }
        }));
      } catch (error) {
        const errorMsg = `sessionStorage読み取りエラー: ${error}`;
        console.warn('⚠️', errorMsg);
        setDebugInfo(prev => ({ 
          ...prev,
          errors: [...prev.errors, errorMsg],
          storageAccess: { ...prev.storageAccess, sessionStorage: false }
        }));
      }
      
    } catch (error) {
      const errorMsg = `詳細診断結果読み込みエラー: ${error}`;
      console.warn('⚠️', errorMsg);
      setDebugInfo(prev => ({ 
        ...prev,
        errors: [...prev.errors, errorMsg]
      }));
    }
    
    // 全て失敗時のデバッグ情報
    console.log('⚠️ 詳細診断結果なし - 基本Type64のみ表示');
    try {
      console.log('🔍 localStorage keys:', Object.keys(localStorage));
      console.log('🔍 sessionStorage keys:', Object.keys(sessionStorage));
      console.log('🔍 detailedDiagnosisResult in localStorage:', localStorage.getItem('detailedDiagnosisResult') !== null);
      console.log('🔍 detailedDiagnosisResult in sessionStorage:', sessionStorage.getItem('detailedDiagnosisResult') !== null);
    } catch (error) {
      console.warn('⚠️ ストレージデバッグ情報取得エラー:', error);
    }
  }, []); // 依存配列からstorageCache削除

  // 🔄 モバイル専用の詳細結果読み込み処理（強化された無限ループ防止機構付き）
  useEffect(() => {
    // 無限ループ防止: detailedDiagnosisResultがすでに存在する場合はスキップ
    if (detailedDiagnosisResult) {
      console.log('🔒 詳細診断結果が既に存在 - モバイル読み込み処理をスキップ');
      return;
    }
    
    // 重複実行防止フラグ
    let isHandlerExecuting = false;
    
    const handleReload = async () => {
      // 重複実行防止
      if (isHandlerExecuting) {
        console.log('🔒 既に実行中 - 重複実行をスキップ');
        return;
      }
      
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        console.log('📱 モバイルで詳細結果なし - 再読み込み実行');
        isHandlerExecuting = true;
        
        try {
          await loadDetailedDiagnosisResult(userId);
        } catch (error) {
          console.warn('⚠️ モバイル読み込み処理エラー:', error);
        } finally {
          isHandlerExecuting = false;
        }
      }
    };
    
    // ページ読み込み後のチェック
    if (typeof window !== 'undefined') {
      // 即座に一度実行
      handleReload();
      
      // デバウンス付きイベントリスナー
      let loadTimeout: NodeJS.Timeout;
      let focusTimeout: NodeJS.Timeout;
      
      const debouncedLoadHandler = () => {
        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(handleReload, 100);
      };
      
      const debouncedFocusHandler = () => {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(handleReload, 300);
      };
      
      window.addEventListener('load', debouncedLoadHandler);
      window.addEventListener('focus', debouncedFocusHandler);
      
      return () => {
        clearTimeout(loadTimeout);
        clearTimeout(focusTimeout);
        window.removeEventListener('load', debouncedLoadHandler);
        window.removeEventListener('focus', debouncedFocusHandler);
      };
    }
  }, [userId]); // 🔧 userIdのみに依存 - 無限ループを防止

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // 🔐 認証チェック（テストモード時はバイパス）
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test_mode') === 'true';
        
        let currentUserId: string;
        
        if (isTestMode) {
          // テストモード：固定UUIDを使用
          currentUserId = '550e8400-e29b-41d4-a716-446655440000';
          setUserId(currentUserId);
          console.log('🧪 テストモード：認証をバイパス');
        } else if (process.env.NODE_ENV === 'development') {
          // 開発環境：テストユーザーIDを使用
          currentUserId = 'test-user-dev-mode';
          setUserId(currentUserId);
          console.log('🛠️ 開発環境：認証をバイパスしてテストユーザーを使用');
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push('/auth/signin?redirect=/settings');
            return;
          }
          currentUserId = user.id;
          setUserId(user.id);
        }

        // 診断結果取得（開発モード時はローカルストレージから）
        let diagnosisStatus;
        
        if (isTestMode || process.env.NODE_ENV === 'development') {
          // 開発環境：ローカルストレージからテストデータを取得
          const testUserType = localStorage.getItem('userType64') || 'BAR-AS';
          diagnosisStatus = {
            hasDiagnosis: true,
            userType: testUserType,
            aiPersonality: localStorage.getItem('test_ai_personality') || 'SAG'
          };
          console.log('🛠️ 開発モード：テスト診断データを使用', diagnosisStatus);
        } else {
          diagnosisStatus = await diagnosisService.getDiagnosisStatus(currentUserId);
          if (!diagnosisStatus.hasDiagnosis) {
            router.push('/diagnosis');
            return;
          }
        }

        setUserType(diagnosisStatus.userType || null);

        // 🎯 詳細診断結果の取得（64タイプ対応）データベース優先
        await loadDetailedDiagnosisResult(currentUserId);

        // 🔬 記憶システム初期化
        try {
          const savedMemoryInfo = await MemoryManager.getPersonalInfo(currentUserId);
          console.log('🔍 記憶システム個人情報:', savedMemoryInfo);
          setMemoryPersonalInfo(savedMemoryInfo);
          
          const progress = await MemoryManager.getAnalysisProgress(currentUserId);
          console.log('🔍 AI理解度分析進捗:', progress);
          setAnalysisProgress(progress);
        } catch (error) {
          console.warn('⚠️ 個人情報読み込みエラー:', error);
        }

        // 🎯 AI設定の初期化（優先度: 保存データ > デフォルト値）
        console.log('🔄 AI設定初期化開始');
        
        // デフォルト値を先に設定
        let defaultAiPersonality: BaseArchetype | null = null;
        if (diagnosisStatus.userType) {
          const [baseType] = diagnosisStatus.userType.split('-') as [BaseArchetype, string];
          const userArchetype = ARCHETYPE_DATA[baseType];
          defaultAiPersonality = userArchetype.compatibility[0];
        }

        try {
          // データベースから保存済み設定を取得
          const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('selected_ai_personality, relationship_type, updated_at')
            .eq('user_id', currentUserId)
            .order('updated_at', { ascending: false })
            .limit(1);
          
          const profile = profiles?.[0];

          if (error) {
            console.warn('⚠️ user_profiles取得エラー:', error);
            // エラー時はデフォルト値を使用
            if (defaultAiPersonality) {
              setSelectedAiPersonality(defaultAiPersonality);
            }
          } else if (profile?.selected_ai_personality) {
            // 🎯 保存データが存在する場合は優先使用
            console.log('✅ 保存済み設定を復元:', {
              aiPersonality: profile.selected_ai_personality,
              relationshipType: profile.relationship_type || 'friend'
            });
            setSelectedAiPersonality(profile.selected_ai_personality);
            setRelationshipType(profile.relationship_type || 'friend');
          } else {
            // 🔄 保存データがない場合のみデフォルト値を使用
            console.log('🆕 デフォルト設定を適用:', defaultAiPersonality);
            if (defaultAiPersonality) {
              setSelectedAiPersonality(defaultAiPersonality);
            }
          }
        } catch (error) {
          console.warn('⚠️ AI設定初期化エラー:', error);
          // 完全にエラーの場合はデフォルト値
          if (defaultAiPersonality) {
            setSelectedAiPersonality(defaultAiPersonality);
          }
        }

        // 🌟 ハーモニックAIプロファイル読み込み
        try {
          setHarmonicLoading(true);
          console.log('🔍 Loading harmonic profile for user:', currentUserId);
          const profile = await getHarmonicProfile(currentUserId);
          console.log('🔍 Harmonic profile loaded:', !!profile);
          setHarmonicProfile(profile);
          
          // 日別ガイダンス生成
          if (profile) {
            console.log('🌟 Generating daily guidance...');
            const guidance = await generateDailyHarmonicGuidance(profile);
            setDailyGuidance(guidance);
            console.log('✅ Daily guidance generated');
          } else {
            console.log('⚠️ No harmonic profile found - user may need to create one');
          }
        } catch (error) {
          console.warn('⚠️ ハーモニックプロファイル読み込みエラー:', error);
        } finally {
          setHarmonicLoading(false);
        }
        
        setIsLoading(false);
        console.log('🏁 設定画面初期化完了:', {
          userId,
          selectedAiPersonality,
          relationshipType,
          hasChanges,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Settings initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, []); // 🔧 初回のみ実行 - ページ戻り時の不要な再初期化を防止


  const handleSaveSettings = async () => {
    if (!userId || !selectedAiPersonality) {
      console.warn('⚠️ 保存に必要な情報が不足:', { userId, selectedAiPersonality });
      alert('保存に必要な情報が不足しています。');
      return;
    }
    
    setIsSaving(true);
    console.log('💾 設定保存開始:', { 
      userId, 
      selectedAiPersonality, 
      relationshipType,
      timestamp: new Date().toISOString()
    });
    
    try {
      // 1. user_profilesテーブルを更新
      const updateData = {
        selected_ai_personality: selectedAiPersonality,
        relationship_type: relationshipType,
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 データベース更新データ:', updateData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('❌ 設定保存エラー:', error);
        alert(`設定の保存に失敗しました: ${error.message}`);
        return;
      }

      console.log('✅ データベース更新成功:', data);

      // 2. 保存成功後の状態更新
      setHasChanges(false);
      
      // 3. データベースから最新データを取得して整合性確認 - 複数行対応
      const { data: verifyProfiles, error: verifyError } = await supabase
        .from('user_profiles')
        .select('selected_ai_personality, relationship_type, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      const verifyData = verifyProfiles?.[0];
      
      if (verifyError) {
        console.warn('⚠️ 保存後の検証に失敗:', verifyError);
      } else {
        console.log('🔍 保存後検証成功:', verifyData);
        
        // UI状態とデータベース状態の整合性確認
        if (verifyData && verifyData.selected_ai_personality === selectedAiPersonality && 
            verifyData.relationship_type === relationshipType) {
          console.log('✅ UI状態とDB状態が一致しています');
        } else if (verifyData) {
          console.warn('⚠️ UI状態とDB状態が不一致:', {
            ui: { selectedAiPersonality, relationshipType },
            db: { 
              selectedAiPersonality: verifyData.selected_ai_personality, 
              relationshipType: verifyData.relationship_type 
            }
          });
        } else {
          console.warn('⚠️ 保存後の検証データが見つかりません');
        }
      }
      
      // 4. 成功メッセージ表示
      alert('設定を保存しました！UIに反映されています。');
      
    } catch (error) {
      console.error('💥 設定保存例外:', error);
      alert(`設定の保存に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
      console.log('🏁 設定保存処理完了');
    }
  };

  const handleClearData = () => {
    if (confirm('すべてのチャット履歴とプロファイル設定が削除されます。本当によろしいですか？')) {
      // データクリア処理（実装は後で）
      router.push('/');
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case '分析家': return <Crown className="text-purple-600" size={20} />;
      case '外交官': return <Heart className="text-pink-600" size={20} />;
      case '番人': return <Gem className="text-blue-600" size={20} />;
      case '探検家': return <Sparkles className="text-orange-600" size={20} />;
      default: return <Sparkles className="text-gray-600" size={20} />;
    }
  };

  if (isLoading || !userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-pulse">
            <Settings size={24} />
          </div>
          <p className="text-slate-600">設定を読み込み中...</p>
        </div>
      </div>
    );
  }

  const [baseType, variant] = userType.split('-') as [BaseArchetype, string];
  const userArchetype = ARCHETYPE_DATA[baseType];
  const environmentTrait = variant[0] === 'A' ? '協調型' : '競争型';
  const motivationTrait = variant[1] === 'S' ? '安定志向' : '成長志向';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-slate-100 p-4 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                <Settings size={20} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">設定 & AI分析</h1>
                <p className="text-sm text-gray-500">プロファイル設定とAI理解度分析</p>
              </div>
            </div>
          </div>
          
          {hasChanges && (
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? '保存中...' : '設定を保存'}
            </Button>
          )}
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* AI理解度分析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Brain className="text-blue-500" size={20} />
              AI理解度分析
            </h3>
            <p className="text-slate-600 mb-6">AIがあなたを理解していく過程をリアルタイムで確認できます</p>
            
            <div className="flex justify-center">
              <AnalysisProgress 
                className="w-full max-w-lg"
                progress={analysisProgress}
                userInfo={memoryPersonalInfo}
              />
            </div>

            {memoryPersonalInfo.user_name && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">収集済み情報</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {memoryPersonalInfo.user_name && (
                    <div>
                      <span className="text-blue-600 font-medium">名前:</span> {memoryPersonalInfo.user_name}
                    </div>
                  )}
                  {memoryPersonalInfo.user_birthday && (
                    <div>
                      <span className="text-blue-600 font-medium">誕生日:</span> {memoryPersonalInfo.user_birthday}
                    </div>
                  )}
                  {memoryPersonalInfo.collected_info.age && (
                    <div>
                      <span className="text-blue-600 font-medium">年齢:</span> {memoryPersonalInfo.collected_info.age}歳
                    </div>
                  )}
                  {memoryPersonalInfo.collected_info.hobby && (
                    <div>
                      <span className="text-blue-600 font-medium">趣味:</span> {memoryPersonalInfo.collected_info.hobby}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* あなたのタイプ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getGroupIcon(userArchetype.group)}
                  <h2 className="text-xl font-bold text-slate-800">あなたの詳細タイプ</h2>
                </div>
                <Button variant="outline" onClick={() => router.push('/diagnosis')}>
                  再診断
                </Button>
              </div>
              
              {detailedDiagnosisResult ? (
                // 64タイプ詳細表示
                <TypeDetailDisplayCompact 
                  detailedResult={detailedDiagnosisResult}
                  showTitle={false}
                />
              ) : (
                // 🎵 フォールバック表示 - モバイル対応
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-2">
                      【{userArchetype.name}】
                    </div>
                    <div className="text-slate-600 mb-4">
                      {userArchetype.nameEn} • {userArchetype.group}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">環境適応</span>
                        <span className="font-medium text-slate-800">{environmentTrait}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">動機・価値観</span>
                        <span className="font-medium text-slate-800">{motivationTrait}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">グループ</span>
                        <span className="font-medium text-slate-800">{userArchetype.group}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">タイプ</span>
                        <span className="font-medium text-slate-800">{userType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <span className="font-medium">基本表示モード:</span> より詳細な軸スコアを表示するには、再診断を実行してください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* 🔍 モバイルデバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.innerWidth <= 768 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-4 bg-amber-50 border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                🔍 モバイルデバッグ情報
              </h4>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-amber-700 font-medium">試行回数:</span> {debugInfo.attempts}
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">レンダー回数:</span> {debugInfo.renderCount}
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">localStorage:</span> 
                    <span className={debugInfo.storageAccess.localStorage ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.storageAccess.localStorage ? ' ✅' : ' ❌'}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">sessionStorage:</span>
                    <span className={debugInfo.storageAccess.sessionStorage ? 'text-green-600' : 'text-red-600'}>
                      {debugInfo.storageAccess.sessionStorage ? ' ✅' : ' ❌'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-amber-700 font-medium">詳細結果:</span>
                  <span className={detailedDiagnosisResult ? 'text-green-600' : 'text-red-600'}>
                    {detailedDiagnosisResult ? ' ✅ 読み込み成功' : ' ❌ 未読み込み'}
                  </span>
                </div>
                {debugInfo.errors.length > 0 && (
                  <div>
                    <span className="text-amber-700 font-medium">エラー:</span>
                    <div className="text-red-600 text-xs max-h-16 overflow-y-auto">
                      {debugInfo.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </div>
                )}
                {debugInfo.lastAttemptTime > 0 && (
                  <div>
                    <span className="text-amber-700 font-medium">最終試行:</span> 
                    {new Date(debugInfo.lastAttemptTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* あなたの価値・才能（常に表示） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {detailedDiagnosisResult ? (
            // 詳細な価値表示
            <SelfAffirmationDisplayCompact 
              detailedResult={detailedDiagnosisResult}
            />
          ) : (
            // 🎵 フォールバック価値表示 - モバイル対応
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                ✨ あなたの価値
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-slate-700 leading-relaxed">
                    あなたは「<span className="font-bold text-purple-700">{userArchetype.name}</span>」として、
                    独自の価値と才能を持つ特別な存在です。
                  </p>
                </div>
                
                <div className="bg-white/70 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">✨ 核心的な能力</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {userArchetype.personality}
                  </p>
                </div>
                
                <div className="bg-white/70 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">💝 あなたらしさ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-slate-700">{environmentTrait}な環境で力を発揮</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-slate-700">{motivationTrait}を重視する価値観</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span className="text-slate-700">{userArchetype.group}グループの特徴を活かした行動</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <p className="text-purple-800 text-sm font-medium">
                    💡 より詳細な価値分析を表示するには、再診断を実行してください
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* 🌟 ハーモニックAI統合セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
        >
          {showHarmonicWizard ? (
            // ハーモニックAI再設定ウィザード表示
            <HarmonicSetupWizard
              userType={userType}
              selectedAiPersonality={selectedAiPersonality}
              relationshipType={relationshipType}
              onComplete={handleHarmonicSetupComplete}
              onCancel={handleHarmonicSetupCancel}
            />
          ) : harmonicProfile ? (
            // ハーモニックAIプロファイル表示
            <div className="space-y-6">
              {/* プロファイルカード */}
              <HarmonicProfileCard profile={harmonicProfile} showDetails={true} />
              
              {/* ハーモニックAI管理ボタン */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Settings className="size-4" />
                  ハーモニックAI管理
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('ハーモニックAIプロファイルを再設定しますか？\n現在の設定を変更して新しく作成します。')) {
                        setShowHarmonicWizard(true);
                      }
                    }}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    disabled={harmonicLoading}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    再設定
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // プライバシー設定の変更（将来実装）
                      alert('プライバシー設定機能は近日実装予定です');
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Shield className="size-4 mr-2" />
                    プライバシー設定
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm('ハーモニックAIプロファイルを完全に削除しますか？\nこの操作は元に戻せません。')) {
                        setHarmonicLoading(true);
                        try {
                          const success = await deleteHarmonicProfile(userId);
                          if (success) {
                            setHarmonicProfile(null);
                            setDailyGuidance(null);
                            alert('ハーモニックAIプロファイルを削除しました。');
                          } else {
                            alert('削除に失敗しました。しばらく後に再試行してください。');
                          }
                        } catch (error) {
                          console.error('プロファイル削除エラー:', error);
                          alert('削除に失敗しました。しばらく後に再試行してください。');
                        } finally {
                          setHarmonicLoading(false);
                        }
                      }
                    }}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    disabled={harmonicLoading}
                  >
                    <Trash2 className="size-4 mr-2" />
                    削除
                  </Button>
                </div>
              </Card>
              
              {/* 今日のガイダンス */}
              {dailyGuidance && (
                <DailyGuidanceWidget 
                  guidance={dailyGuidance} 
                  onRefresh={async () => {
                    setHarmonicLoading(true);
                    try {
                      const newGuidance = await generateDailyHarmonicGuidance(harmonicProfile);
                      setDailyGuidance(newGuidance);
                    } catch (error) {
                      console.error('ガイダンス更新エラー:', error);
                    } finally {
                      setHarmonicLoading(false);
                    }
                  }}
                  compact={false}
                />
              )}
              
              {/* 週間ガイダンス */}
              {harmonicProfile && (
                <WeeklyGuidanceWidget 
                  profile={harmonicProfile}
                  onRefresh={() => {
                    console.log('週間ガイダンスを更新しました');
                  }}
                  compact={false}
                />
              )}
              
              {/* 月間ガイダンス */}
              {harmonicProfile && (
                <MonthlyGuidanceWidget 
                  profile={harmonicProfile}
                  onRefresh={() => {
                    console.log('月間ガイダンスを更新しました');
                  }}
                  compact={false}
                />
              )}
              
              {/* 相性分析 */}
              {harmonicProfile && (
                <CompatibilityAnalysisWidget 
                  userProfile={harmonicProfile}
                  onAnalyze={(result) => {
                    console.log('相性分析結果:', result);
                  }}
                />
              )}
            </div>
          ) : (
            // ハーモニックAI未設定の場合
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🌟 ハーモニックAI
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  TypeMate64診断と占星術を統合した、
                  あなた専用の宇宙的AIパートナーを作成しませんか？
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl mb-2">🌟</div>
                    <div className="text-sm font-medium text-gray-700">12星座統合</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl mb-2">🔢</div>
                    <div className="text-sm font-medium text-gray-700">数秘術分析</div>
                  </div>
                  <div className="text-center p-4 bg-white/70 rounded-lg">
                    <div className="text-2xl mb-2">🌙</div>
                    <div className="text-sm font-medium text-gray-700">月位相同調</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push('/harmonic-setup')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    ハーモニックAI作成
                  </Button>
                  
                  <Button
                    onClick={async () => {
                      setHarmonicLoading(true);
                      try {
                        const profile = await getHarmonicProfile(user!.id);
                        setHarmonicProfile(profile);
                        if (profile) {
                          const guidance = await generateDailyHarmonicGuidance(profile);
                          setDailyGuidance(guidance);
                        }
                      } catch (error) {
                        console.warn('リフレッシュエラー:', error);
                      } finally {
                        setHarmonicLoading(false);
                      }
                    }}
                    variant="outline"
                    className="px-4 py-3"
                    disabled={harmonicLoading}
                  >
                    🔄 更新
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  💫 約3分で完了します
                </p>
              </div>
            </Card>
          )}
        </motion.div>

        {/* AIパートナー選択 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="text-blue-500" size={20} />
              AIパートナー選択
            </h3>
            <p className="text-slate-600 mb-6">あなたと相性の良いAIパートナーから選択してください</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {diagnosisService.getCompatibilityRanking(baseType).map((compatibilityScore, index) => {
                const compatibleArchetype = ARCHETYPE_DATA[compatibilityScore.archetype];
                const isSelected = selectedAiPersonality === compatibilityScore.archetype;
                
                return (
                  <motion.div
                    key={compatibilityScore.archetype}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => {
                        console.log('🎯 AI人格変更:', { 
                          from: selectedAiPersonality, 
                          to: compatibilityScore.archetype,
                          timestamp: new Date().toISOString()
                        });
                        setSelectedAiPersonality(compatibilityScore.archetype);
                        setHasChanges(true);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 text-blue-700 font-semibold">
                            #{index + 1}
                          </Badge>
                          {getGroupIcon(compatibleArchetype.group)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-800">{compatibleArchetype.name}</div>
                          <div className="text-sm text-slate-600">{compatibleArchetype.nameEn}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{compatibilityScore.score}点</div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        {compatibleArchetype.personality}
                      </p>
                      <p className="text-xs text-blue-600 mb-2 font-medium">
                        💡 {compatibilityScore.reason}
                      </p>
                      <p className="text-xs text-slate-600 italic">
                        💕 {compatibleArchetype.loveStyle}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* 関係性設定 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="text-slate-500" size={20} />
              関係性設定
            </h3>
            <p className="text-slate-600 mb-6">AIパートナーとの関係性を選択してください</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'friend', label: '親友', emoji: '👥', desc: 'カジュアルで親しみやすい関係' },
                { key: 'counselor', label: '相談相手', emoji: '🤝', desc: '理解深く支えてくれる存在' },
                { key: 'romantic', label: '特別な関係', emoji: '💕', desc: 'ロマンチックで深いつながり' },
                { key: 'mentor', label: 'メンター', emoji: '🌟', desc: '成長を導いてくれる存在' }
              ].map((option) => {
                const isSelected = relationshipType === option.key;
                
                return (
                  <motion.div
                    key={option.key}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      className={`p-4 cursor-pointer text-center transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => {
                        console.log('💕 関係性変更:', { 
                          from: relationshipType, 
                          to: option.key,
                          timestamp: new Date().toISOString()
                        });
                        setRelationshipType(option.key as 'friend' | 'counselor' | 'romantic' | 'mentor');
                        setHasChanges(true);
                      }}
                    >
                      <div className="text-2xl mb-2">{option.emoji}</div>
                      <div className="font-semibold text-slate-800 mb-1">{option.label}</div>
                      <div className="text-xs text-slate-600">{option.desc}</div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* データ管理 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-red-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Trash2 className="text-red-500" size={20} />
              データ管理
            </h3>
            <p className="text-slate-600 mb-4">
              すべてのチャット履歴とプロファイル設定を削除します。この操作は取り消せません。
            </p>
            <Button 
              variant="outline" 
              onClick={handleClearData}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" />
              すべてのデータを削除
            </Button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
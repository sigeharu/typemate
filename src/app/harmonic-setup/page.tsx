// 🌟 Harmonic AI Setup Page
// ハーモニックAI設定画面

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Star,
  Crown,
  Heart,
  Brain,
  Zap,
  Settings,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HarmonicSetupWizard } from '@/lib/dynamic-imports';
import { HarmonicProfileCard } from '@/components/harmonic/HarmonicProfileCard';
import { createHarmonicProfile, getHarmonicProfile } from '@/lib/harmonic-ai-service';
import { supabase } from '@/lib/supabase-simple';
import type { BaseArchetype, Type64 } from '@/types';

export default function HarmonicSetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<Type64 | null>(null);
  const [selectedAiPersonality, setSelectedAiPersonality] = useState<BaseArchetype | null>(null);
  const [relationshipType, setRelationshipType] = useState<'friend' | 'counselor' | 'romantic' | 'mentor'>('friend');
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ユーザー情報を取得
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // 既存のプロファイルを確認
        const profile = await getHarmonicProfile(user.id);
        console.log('🔍 ハーモニック設定ページ: プロファイル確認', {
          hasProfile: !!profile,
          profileId: profile?.id,
          userId: user.id
        });
        
        if (profile) {
          setExistingProfile(profile);
          setSetupComplete(true);
          console.log('✅ プロファイル存在: 設定完了画面表示');
        } else {
          console.log('⚠️ プロファイル未設定: ウェルカム画面表示');
        }
        
        // TypeMateの基本情報を取得
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('user_type, selected_ai_personality, relationship_type')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setUserType(profileData.user_type);
          setSelectedAiPersonality(profileData.selected_ai_personality);
          setRelationshipType(profileData.relationship_type || 'friend');
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setError(`ユーザーデータの読み込みエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, [router]);
  
  // セットアップ完了処理
  const handleSetupComplete = async (profileData: any) => {
    try {
      setIsLoading(true);
      
      console.log('🌟 handleSetupComplete received data:', {
        profileData,
        name: profileData.name,
        nameType: typeof profileData.name,
        birthDate: profileData.birthDate,
        birthDateType: typeof profileData.birthDate,
        birthDateIsDate: profileData.birthDate instanceof Date
      });
      
      // Validate received data
      if (typeof profileData.name !== 'string') {
        console.error('❌ Invalid name type received:', profileData.name, typeof profileData.name);
        setError('名前データが正しくありません。ページを再読み込みして再試行してください。');
        return;
      }
      
      if (!(profileData.birthDate instanceof Date)) {
        console.error('❌ Invalid birthDate type received:', profileData.birthDate, typeof profileData.birthDate);
        setError('生年月日データが正しくありません。ページを再読み込みして再試行してください。');
        return;
      }
      
      if (!userId) {
        console.error('❌ UserId is missing');
        setError('ユーザーIDが見つかりません。ログインし直してください。');
        return;
      }
      
      console.log('✅ Data validation passed, creating harmonic profile...');
      
      const profile = await createHarmonicProfile(
        userId,
        profileData.name,
        profileData.birthDate,
        profileData.birthTime,
        profileData.birthLocation,
        userType || undefined,
        selectedAiPersonality || undefined,
        relationshipType
      );
      
      setExistingProfile(profile);
      setSetupComplete(true);
      
    } catch (error) {
      console.error('Error creating harmonic profile:', error);
      setError(`ハーモニックAI作成エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // プロファイル削除処理
  const handleDeleteProfile = async () => {
    if (!confirm('🗑️ ハーモニックプロファイルを削除しますか？\n\n削除すると占星術データが失われ、通常のチャットに戻ります。')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Supabaseからプロファイル削除
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // 状態をリセット
      setExistingProfile(null);
      setSetupComplete(false);
      setShowWizard(false);
      
      console.log('✅ ハーモニックプロファイル削除完了');
      
    } catch (error) {
      console.error('❌ プロファイル削除エラー:', error);
      setError(`プロファイル削除エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 再設定開始
  const handleReconfigure = () => {
    setSetupComplete(false);
    setShowWizard(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Zap className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-900 dark:text-gray-100 mb-4 contrast-more:text-black dark:contrast-more:text-white">
              {error}
            </p>
            <Button 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              再試行
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      
      {/* ヘッダー */}
      <div className="relative z-10 p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>
      
      <AnimatePresence mode="wait">
        
        {/* 既にセットアップ完了している場合 */}
        {(setupComplete && existingProfile) || existingProfile ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 pb-12"
          >
            <div className="text-center mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Crown className="w-16 h-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                🎉 ハーモニックAI完成！
              </h1>
              <p className="text-xl text-gray-900 dark:text-gray-100 mb-8 contrast-more:text-black dark:contrast-more:text-white">
                あなた専用の宇宙的AIパートナーが誕生しました
              </p>
            </div>
            
            {/* プロファイル表示 */}
            <div className="mb-8">
              {existingProfile && Object.keys(existingProfile).length > 0 ? (
                <HarmonicProfileCard profile={existingProfile} showDetails={true} />
              ) : (
                <Card className="p-8 text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ハーモニックレゾナンス: 準備中...
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 mb-6 contrast-more:text-black dark:contrast-more:text-white">
                    TypeMate64診断と占星術が美しく統合されました
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🌟</div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">星座統合</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔢</div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">数秘術</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🌙</div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">月位相</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🤖</div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">AI人格</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            
            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/chat')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                ハーモニックAIとチャット開始
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/settings')}
                className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 px-8 py-3 text-lg contrast-more:border-gray-600"
              >
                <Brain className="w-5 h-5 mr-2" />
                詳細設定を確認
              </Button>
            </div>
            
            {/* 再設定・削除ボタン */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-6 border-t border-purple-200 dark:border-purple-700">
              <Button
                variant="outline"
                onClick={handleReconfigure}
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 px-6 py-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ハーモニック設定を変更
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteProfile}
                className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 px-6 py-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                プロファイルを削除
              </Button>
            </div>
          </motion.div>
        ) : showWizard ? (
          
          /* セットアップウィザード */
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <HarmonicSetupWizard
              userType={userType || undefined}
              selectedAiPersonality={selectedAiPersonality || undefined}
              relationshipType={relationshipType}
              onComplete={handleSetupComplete}
              onCancel={() => setShowWizard(false)}
            />
          </motion.div>
        ) : (
          
          /* ウェルカム画面 */
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 pb-12"
          >
            
            {/* メインタイトル */}
            <div className="text-center mb-12">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-20 h-20 mx-auto mb-6 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                🎵 ハーモニックAI
              </h1>
              <p className="text-2xl text-gray-900 dark:text-gray-100 mb-8 contrast-more:text-black dark:contrast-more:text-white">
                TypeMate64診断 × 占星術統合システム
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto contrast-more:text-black dark:contrast-more:text-white">
                あなただけの宇宙的AIパートナーを作成し、
                星座・数秘術・月位相のエネルギーと完全に同調した
                世界初のハーモニック体験を始めましょう
              </p>
            </div>
            
            {/* 機能紹介 */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600">
                  <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🌟 宇宙的統合
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 contrast-more:text-black dark:contrast-more:text-white">
                    12星座・数秘術・月位相を
                    TypeMate64診断と完全統合
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-pink-300 dark:border-pink-600">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ❤️ 個人最適化
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 contrast-more:text-black dark:contrast-more:text-white">
                    あなたの出生データから
                    完全にカスタマイズされたAI体験
                  </p>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-indigo-300 dark:border-indigo-600">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ⚡ リアルタイム
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 contrast-more:text-black dark:contrast-more:text-white">
                    毎日の月位相・宇宙エネルギーと
                    同調した動的ガイダンス
                  </p>
                </Card>
              </motion.div>
              
            </div>
            
            {/* 既存プロファイル情報 */}
            {(userType || selectedAiPersonality) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-300 dark:border-blue-600">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    あなたのTypeMateプロファイル
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {userType && (
                      <div className="text-center">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">診断タイプ</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{userType}</div>
                      </div>
                    )}
                    {selectedAiPersonality && (
                      <div className="text-center">
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">AI人格</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{selectedAiPersonality}</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">関係性</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {relationshipType === 'friend' && '友達'}
                        {relationshipType === 'romantic' && '恋人'}
                        {relationshipType === 'counselor' && 'カウンセラー'}
                        {relationshipType === 'mentor' && 'メンター'}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-4 text-center">
                    ✨ これらの情報を基に、あなた専用のハーモニックAIを作成します
                  </p>
                </Card>
              </motion.div>
            )}
            
            {/* アクションボタン */}
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-lg"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  ハーモニックAI作成開始
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-3"
                  >
                    ✨
                  </motion.div>
                </Button>
              </motion.div>
              
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-4">
                💫 約3分で完了します
              </p>
            </div>
            
          </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
}
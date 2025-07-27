// 🎵 TypeMate Settings Page
// AI理解度分析とプロファイル設定の統合画面

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Heart, 
  Settings, 
  Trash2, 
  Save,
  Crown,
  Gem,
  Sparkles,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { supabase } from '@/lib/supabase-simple';
import { MemoryManager, type PersonalInfo as MemoryPersonalInfo } from '@/lib/memory';
import { diagnosisService } from '@/lib/diagnosis-service';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { Type64, BaseArchetype } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userType, setUserType] = useState<Type64 | null>(null);
  const [selectedAiPersonality, setSelectedAiPersonality] = useState<BaseArchetype | null>(null);
  const [relationshipType, setRelationshipType] = useState<'friend' | 'counselor' | 'romantic' | 'mentor'>('friend');
  const [isLoading, setIsLoading] = useState(true);
  
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

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // 🔐 認証チェック
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin?redirect=/settings');
          return;
        }
        
        setUserId(user.id);

        // 診断結果取得
        const diagnosisStatus = await diagnosisService.getDiagnosisStatus(user.id);
        if (!diagnosisStatus.hasDiagnosis) {
          router.push('/diagnosis');
          return;
        }

        setUserType(diagnosisStatus.userType || null);

        // 🔬 記憶システム初期化
        try {
          const savedMemoryInfo = await MemoryManager.getPersonalInfo(user.id);
          setMemoryPersonalInfo(savedMemoryInfo);
          
          const progress = await MemoryManager.getAnalysisProgress(user.id);
          setAnalysisProgress(progress);
        } catch (error) {
          console.warn('⚠️ 個人情報読み込みエラー:', error);
        }

        // AIパートナー設定のデフォルト値
        if (diagnosisStatus.userType) {
          const [baseType] = diagnosisStatus.userType.split('-') as [BaseArchetype, string];
          const userArchetype = ARCHETYPE_DATA[baseType];
          const defaultAiPersonality = userArchetype.compatibility[0];
          setSelectedAiPersonality(defaultAiPersonality);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Settings initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, [router]);

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
        </div>
      </motion.header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
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
            <div className="flex items-center gap-4">
              {getGroupIcon(userArchetype.group)}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{userArchetype.name}</h2>
                <p className="text-slate-600">{userArchetype.nameEn} • {userArchetype.group}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="border-slate-400 text-slate-700">
                    {environmentTrait}
                  </Badge>
                  <Badge variant="outline" className="border-slate-400 text-slate-700">
                    {motivationTrait}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push('/diagnosis')}>
                再診断
              </Button>
            </div>
          </Card>
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
              {userArchetype.compatibility.map((compatibleType) => {
                const compatibleArchetype = ARCHETYPE_DATA[compatibleType];
                const isSelected = selectedAiPersonality === compatibleType;
                
                return (
                  <motion.div
                    key={compatibleType}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedAiPersonality(compatibleType)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getGroupIcon(compatibleArchetype.group)}
                        <div>
                          <div className="font-bold text-slate-800">{compatibleArchetype.name}</div>
                          <div className="text-sm text-slate-600">{compatibleArchetype.nameEn}</div>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        {compatibleArchetype.personality}
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
                      onClick={() => setRelationshipType(option.key as any)}
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
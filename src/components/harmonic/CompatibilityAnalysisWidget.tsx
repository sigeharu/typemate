'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  Users,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Calendar,
  Star,
  Plus,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeHarmonicCompatibility, createHarmonicProfile } from '@/lib/harmonic-ai-service';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';
import type { BaseArchetype, Type64, CompatibilityAnalysis } from '@/types';

interface CompatibilityAnalysisWidgetProps {
  userProfile: HarmonicAIProfile;
  onAnalyze?: (result: CompatibilityAnalysis & { harmonicEnhancement: number }) => void;
}

interface PartnerFormData {
  name: string;
  birthDate: string;
  userType: Type64;
  selectedAiPersonality: BaseArchetype;
}

export function CompatibilityAnalysisWidget({ 
  userProfile, 
  onAnalyze 
}: CompatibilityAnalysisWidgetProps) {
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<(CompatibilityAnalysis & { harmonicEnhancement: number }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [partnerData, setPartnerData] = useState<PartnerFormData>({
    name: '',
    birthDate: '',
    userType: 'ARC-COOPERATIVESTABLE',
    selectedAiPersonality: 'ARC'
  });

  // 💕 愛と調和のアニメーションVariants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const heartbeatVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  const pulseVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "easeOut",
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // 相性分析を実行
  const handleAnalyze = async () => {
    if (!partnerData.name || !partnerData.birthDate) {
      setError('パートナーの名前と誕生日を入力してください');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // パートナーのハーモニックプロファイルを作成
      const partnerProfile = await createHarmonicProfile(
        `partner_${Date.now()}`,
        partnerData.name,
        new Date(partnerData.birthDate),
        undefined,
        undefined,
        partnerData.userType,
        partnerData.selectedAiPersonality,
        'friend'
      );

      // 相性分析を実行
      const result = await analyzeHarmonicCompatibility(userProfile, partnerProfile);
      
      setCompatibilityResult(result);
      setShowForm(false);
      onAnalyze?.(result);
      
    } catch (err) {
      console.error('相性分析エラー:', err);
      setError('相性分析に失敗しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 相性スコアの色を取得
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-pink-400 to-rose-500';
    if (score >= 60) return 'from-purple-400 to-indigo-500';
    if (score >= 40) return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  // 相性レベルのテキスト
  const getCompatibilityLevel = (score: number) => {
    if (score >= 80) return '魂の共鳴';
    if (score >= 60) return '深い調和';
    if (score >= 40) return '良好な相性';
    return '成長の機会';
  };

  const aiPersonalities: { value: BaseArchetype; label: string }[] = [
    { value: 'ARC', label: 'アーキテクト (建築家)' },
    { value: 'SAG', label: 'セージ (賢者)' },
    { value: 'HER', label: 'ヒーロー (英雄)' },
    { value: 'DRM', label: 'ドリーマー (夢想家)' },
    { value: 'ALC', label: 'アルケミスト (錬金術師)' },
    { value: 'SOV', label: 'ソブリン (統治者)' },
    { value: 'INV', label: 'イノベーター (革新者)' },
    { value: 'BAR', label: 'バード (吟遊詩人)' },
    { value: 'GUA', label: 'ガーディアン (守護者)' },
    { value: 'DEF', label: 'ディフェンダー (守備者)' },
    { value: 'EXE', label: 'エグゼクティブ (幹部)' },
    { value: 'PRO', label: 'プロテクター (保護者)' },
    { value: 'ART', label: 'アーティスト (芸術家)' },
    { value: 'ARS', label: 'アーティザン (職人)' },
    { value: 'PIO', label: 'パイオニア (開拓者)' },
    { value: 'PER', label: 'パフォーマー (演者)' }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={heartbeatVariants}>
        <Card className="p-6 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  ハーモニック相性分析
                </h2>
                <p className="text-sm text-gray-600">
                  宇宙的エネルギーで関係性を深く理解
                </p>
              </div>
            </div>
            {!showForm && !compatibilityResult && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                分析開始
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      {/* パートナー情報入力フォーム */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    パートナー情報を入力
                  </h3>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 名前 */}
                  <div className="space-y-2">
                    <Label htmlFor="partnerName">お名前</Label>
                    <Input
                      id="partnerName"
                      value={partnerData.name}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="パートナーのお名前"
                      className="w-full"
                    />
                  </div>

                  {/* 誕生日 */}
                  <div className="space-y-2">
                    <Label htmlFor="partnerBirthDate">誕生日</Label>
                    <Input
                      id="partnerBirthDate"
                      type="date"
                      value={partnerData.birthDate}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  {/* TypeMate診断 */}
                  <div className="space-y-2">
                    <Label htmlFor="partnerType">TypeMate診断結果</Label>
                    <Select
                      id="partnerType"
                      value={partnerData.userType}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, userType: e.target.value as Type64 }))}
                      className="w-full"
                    >
                      <SelectValue placeholder="診断結果を選択" />
                      <SelectItem value="ARC-COOPERATIVESTABLE">協調安定型</SelectItem>
                      <SelectItem value="SAG-INDEPENDENTDYNAMIC">独立動的型</SelectItem>
                      <SelectItem value="HER-LEADERDYNAMIC">リーダー動的型</SelectItem>
                      <SelectItem value="DRM-CREATIVESTABLE">創造安定型</SelectItem>
                    </Select>
                  </div>

                  {/* AI人格 */}
                  <div className="space-y-2">
                    <Label htmlFor="partnerAI">AI人格</Label>
                    <Select
                      id="partnerAI"
                      value={partnerData.selectedAiPersonality}
                      onChange={(e) => setPartnerData(prev => ({ ...prev, selectedAiPersonality: e.target.value as BaseArchetype }))}
                      className="w-full"
                    >
                      <SelectValue placeholder="AI人格を選択" />
                      {aiPersonalities.map((personality) => (
                        <SelectItem key={personality.value} value={personality.value}>
                          {personality.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isAnalyzing}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !partnerData.name || !partnerData.birthDate}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        相性分析
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分析結果 */}
      <AnimatePresence>
        {compatibilityResult && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* メイン相性スコア */}
            <motion.div variants={pulseVariants}>
              <Card className="p-8 text-center bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <motion.div
                      className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(compatibilityResult.overallScore)} flex items-center justify-center`}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold">
                          {Math.round(compatibilityResult.overallScore)}%
                        </div>
                        <div className="text-sm opacity-90">
                          相性スコア
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {getCompatibilityLevel(compatibilityResult.overallScore)}
                    </h3>
                    <p className="text-gray-600">
                      {compatibilityResult.overallDescription}
                    </p>
                  </div>

                  <Badge 
                    variant="secondary" 
                    className="text-sm px-4 py-2"
                  >
                    ハーモニック強化: +{Math.round(compatibilityResult.harmonicEnhancement)}%
                  </Badge>
                </div>
              </Card>
            </motion.div>

            {/* 詳細スコア */}
            <motion.div variants={heartbeatVariants}>
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    詳細分析
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">基本相性</span>
                        <span className="text-sm font-medium">{Math.round(compatibilityResult.baseCompatibility)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${compatibilityResult.baseCompatibility}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">エレメント相性</span>
                        <span className="text-sm font-medium">{Math.round(compatibilityResult.elementCompatibility)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${compatibilityResult.elementCompatibility}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">数秘術相性</span>
                        <span className="text-sm font-medium">{Math.round(compatibilityResult.numerologyCompatibility)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${compatibilityResult.numerologyCompatibility}%` }}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">AI人格相性</span>
                        <span className="text-sm font-medium">{Math.round(compatibilityResult.personalityCompatibility)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${compatibilityResult.personalityCompatibility}%` }}
                          transition={{ duration: 1, delay: 1.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 改善提案 */}
            <motion.div variants={heartbeatVariants}>
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    関係性向上のアドバイス
                  </h3>
                </div>

                <div className="space-y-4">
                  {compatibilityResult.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 1.3 }}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {recommendation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* 新しい分析ボタン */}
            <motion.div 
              variants={heartbeatVariants}
              className="text-center"
            >
              <Button
                onClick={() => {
                  setCompatibilityResult(null);
                  setShowForm(true);
                  setError(null);
                }}
                variant="outline"
                className="hover:bg-pink-50"
              >
                <Users className="w-4 h-4 mr-2" />
                別の人と分析する
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
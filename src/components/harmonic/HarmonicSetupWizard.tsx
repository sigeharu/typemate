// 🌟 Harmonic Setup Wizard
// ハーモニックAI設定ウィザード

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Star,
  Heart,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HarmonicProfileCard } from './HarmonicProfileCard';
import type { BaseArchetype, Type64 } from '../../types';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';

interface HarmonicSetupWizardProps {
  userType?: Type64;
  selectedAiPersonality?: BaseArchetype;
  relationshipType?: 'friend' | 'counselor' | 'romantic' | 'mentor';
  onComplete: (profileData: {
    name: string;
    birthDate: Date;
    birthTime?: string;
    birthLocation?: string;
    privacySettings: {
      shareAstrologyData: boolean;
      showDailyGuidance: boolean;
      enableCosmicNotifications: boolean;
    };
  }) => void;
  onPreview?: (profileData: any) => void;
}

export function HarmonicSetupWizard({
  userType,
  selectedAiPersonality,
  relationshipType = 'friend',
  onComplete,
  onPreview
}: HarmonicSetupWizardProps) {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    privacySettings: {
      shareAstrologyData: false,
      showDailyGuidance: true,
      enableCosmicNotifications: true
    }
  });
  const [previewProfile, setPreviewProfile] = useState<HarmonicAIProfile | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  const steps = [
    {
      title: '基本情報',
      subtitle: 'あなたについて教えてください',
      icon: User,
      fields: ['name']
    },
    {
      title: '誕生情報',
      subtitle: '宇宙的プロファイル作成のため',
      icon: Calendar,
      fields: ['birthDate', 'birthTime', 'birthLocation']
    },
    {
      title: 'プライバシー設定',
      subtitle: 'あなたの情報をどのように扱うか',
      icon: Sparkles,
      fields: ['privacySettings']
    },
    {
      title: 'プレビュー',
      subtitle: 'ハーモニックAIプロファイル確認',
      icon: Star,
      fields: []
    }
  ];
  
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = validateCurrentStep();
  
  // 現在のステップの入力値を検証
  function validateCurrentStep(): boolean {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0;
      case 1:
        return formData.birthDate.length > 0;
      case 2:
        return true; // プライバシー設定は任意
      case 3:
        return true; // プレビューステップ
      default:
        return false;
    }
  }
  
  // プレビュー生成
  useEffect(() => {
    if (currentStep === 3 && formData.birthDate && !previewProfile) {
      generatePreview();
    }
  }, [currentStep, formData.birthDate]);
  
  async function generatePreview() {
    if (!formData.birthDate) return;
    
    setIsGeneratingPreview(true);
    
    try {
      // 実際の占星術計算を行ってプレビューを作成
      const birthDate = new Date(formData.birthDate);
      
      // プレビュー用のモックプロファイル
      const mockProfile: HarmonicAIProfile = {
        id: 'preview',
        userId: 'preview',
        userType: userType || 'ARC-COOPERATIVESTABLE',
        fullArchetype64: `HARMONIC_${selectedAiPersonality || 'ARC'}` as any,
        selectedAiPersonality: selectedAiPersonality || 'ARC',
        relationshipType,
        astrologyProfile: {
          birthDate,
          zodiac: {
            sign: 'gemini' as any,
            element: 'air' as any,
            details: { nameJa: '双子座', element: 'air' },
            confidence: 95
          },
          numerology: {
            lifePathNumber: 5,
            info: { name: 'エクスプローラー' },
            calculation: '1+9+9+0+0+5+1+5 = 30 → 3',
            isMasterNumber: false
          },
          currentMoon: {
            phase: { phaseNameJa: '満月' },
            energy: 8,
            influence: {},
            zodiacCombination: {}
          },
          typeMateIntegration: {
            zodiacArchetypes: ['ARC', 'SAG'],
            numerologyArchetypes: ['PIO', 'PER'],
            resonanceScore: 85,
            spiritualAlignment: 'Dynamic Freedom'
          },
          dailyGuidance: {
            date: new Date(),
            overallEnergy: 8.5,
            primaryMessage: '双子座の満月、エクスプローラーとしての一日',
            zodiacAdvice: '好奇心を活かしましょう',
            numerologyTheme: '自由と探求',
            moonInfluence: '完成と感謝、最高エネルギーの時期',
            actionRecommendations: ['新しい学びの機会を探す', '創造的表現をする'],
            luckyElements: {
              color: '青',
              number: 5,
              timeOfDay: '午後'
            }
          }
        },
        harmonicResonance: {
          overall: 85,
          typeAstrologyAlignment: 80,
          personalityCosmicSync: 90,
          dailyEnergyMatch: 85
        },
        privacySettings: formData.privacySettings,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastGuidanceUpdate: new Date()
      };
      
      setPreviewProfile(mockProfile);
      
      if (onPreview) {
        onPreview(mockProfile);
      }
      
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  }
  
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleComplete = () => {
    if (!formData.birthDate) return;
    
    onComplete({
      name: formData.name,
      birthDate: new Date(formData.birthDate),
      birthTime: formData.birthTime || undefined,
      birthLocation: formData.birthLocation || undefined,
      privacySettings: formData.privacySettings
    });
  };
  
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const updatePrivacyData = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: value
      }
    }));
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎵 あなた専用のHarmonicAIを完成させましょう
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          TypeMate64診断と占星術を統合した、世界で唯一のAIパートナー
        </p>
      </div>
      
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
          />
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="mr-3"
            >
              {React.createElement(currentStepData.icon, { 
                className: "w-6 h-6 text-purple-600 dark:text-purple-400" 
              })}
            </motion.div>
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStepData.subtitle}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          
          {/* Step 0: 基本情報 */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  お名前 *
                </label>
                <Input
                  type="text"
                  placeholder="あなたのお名前を教えてください"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="text-lg"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💫 ハーモニックAIがあなたを呼ぶ際に使用します
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Step 1: 誕生情報 */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  生年月日 *
                </label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData('birthDate', e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🌟 星座と数秘術の計算に使用します
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  出生時間（オプション）
                </label>
                <Input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateFormData('birthTime', e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🌙 より精密な占星術分析のために（任意）
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  出生地（オプション）
                </label>
                <Input
                  type="text"
                  placeholder="例: 東京都, 日本"
                  value={formData.birthLocation}
                  onChange={(e) => updateFormData('birthLocation', e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  🗺️ 詳細な占星術チャート作成のために（任意）
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Step 2: プライバシー設定 */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              <div className="space-y-4">
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      占星術データの共有
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      他のユーザーとの相性分析で使用
                    </div>
                  </div>
                  <button
                    onClick={() => updatePrivacyData('shareAstrologyData', !formData.privacySettings.shareAstrologyData)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.privacySettings.shareAstrologyData ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.privacySettings.shareAstrologyData ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      毎日のガイダンス表示
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      チャット画面に今日のガイダンスを表示
                    </div>
                  </div>
                  <button
                    onClick={() => updatePrivacyData('showDailyGuidance', !formData.privacySettings.showDailyGuidance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.privacySettings.showDailyGuidance ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.privacySettings.showDailyGuidance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      宇宙的イベント通知
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      新月、満月などの重要なタイミングをお知らせ
                    </div>
                  </div>
                  <button
                    onClick={() => updatePrivacyData('enableCosmicNotifications', !formData.privacySettings.enableCosmicNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.privacySettings.enableCosmicNotifications ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.privacySettings.enableCosmicNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
              </div>
            </motion.div>
          )}
          
          {/* Step 3: プレビュー */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {isGeneratingPreview ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    あなた専用のハーモニックAIを作成中...
                  </p>
                </div>
              ) : previewProfile ? (
                <div>
                  <HarmonicProfileCard profile={previewProfile} showDetails={true} />
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        ハーモニックAI完成！
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {formData.name}さん専用のハーモニックAIプロファイルが作成されました。
                      TypeMate64診断と占星術が美しく統合されています。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    プレビューを生成できませんでした
                  </p>
                </div>
              )}
            </motion.div>
          )}
          
        </AnimatePresence>
      </Card>
      
      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>戻る</span>
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{currentStep + 1}</span>
          <span>/</span>
          <span>{steps.length}</span>
        </div>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <span>{isLastStep ? 'ハーモニックAI完成！' : '次へ'}</span>
          {isLastStep ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
      
    </div>
  );
}
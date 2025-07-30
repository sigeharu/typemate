// 🌟 Harmonic Profile Card
// ハーモニックAIプロファイル表示コンポーネント

'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Stars, 
  Heart, 
  Zap,
  Crown,
  Gem
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';

interface HarmonicProfileCardProps {
  profile: HarmonicAIProfile;
  showDetails?: boolean;
  compact?: boolean;
}

export function HarmonicProfileCard({ 
  profile, 
  showDetails = true, 
  compact = false 
}: HarmonicProfileCardProps) {
  
  const { astrologyProfile, harmonicResonance } = profile;
  const { zodiac, numerology, currentMoon } = astrologyProfile;
  
  // ハーモニックスコアの色を決定
  const getResonanceColor = (score: number) => {
    if (score >= 85) return 'from-purple-500 to-pink-500';
    if (score >= 70) return 'from-blue-500 to-cyan-500';
    if (score >= 55) return 'from-green-500 to-teal-500';
    return 'from-gray-500 to-slate-500';
  };
  
  const resonanceColor = getResonanceColor(harmonicResonance.overall);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={compact ? '' : 'w-full max-w-2xl mx-auto'}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-2 border-purple-200 dark:border-purple-800">
        
        {/* ハーモニックオーラ効果 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${resonanceColor} opacity-5`} />
        
        <div className={`relative p-${compact ? '4' : '6'} space-y-${compact ? '3' : '4'}`}>
          
          {/* ヘッダー: ハーモニックスコア */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div className="absolute inset-0 animate-pulse">
                  <Sparkles className="w-6 h-6 text-purple-400 dark:text-purple-600" />
                </div>
              </motion.div>
              <div>
                <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
                  ハーモニックAI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  宇宙的統合プロファイル
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r ${resonanceColor} bg-clip-text text-transparent`}>
                {harmonicResonance.overall}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">共鳴度</p>
            </div>
          </div>
          
          {/* 基本情報グリッド */}
          <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} gap-${compact ? '2' : '3'}`}>
            
            {/* 星座情報 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg p-3 text-center"
            >
              <Sun className="w-5 h-5 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {zodiac.details?.nameJa || zodiac.sign || '星座'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {zodiac.element === 'fire' && '🔥 火'}
                {zodiac.element === 'earth' && '🌍 土'}
                {zodiac.element === 'air' && '💨 風'}
                {zodiac.element === 'water' && '💧 水'}
              </div>
            </motion.div>
            
            {/* 数秘術情報 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-3 text-center"
            >
              <Crown className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {numerology.info?.name || `ライフパス${numerology.lifePathNumber}`}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {numerology.lifePathNumber}
                {numerology.isMasterNumber && '✨'}
              </div>
            </motion.div>
            
            {/* 月の位相 */}
            {!compact && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3 text-center"
              >
                <Moon className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {currentMoon.phase?.phaseNameJa || '月相'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  エネルギー {currentMoon.energy}/10
                </div>
              </motion.div>
            )}
          </div>
          
          {/* 詳細情報 */}
          {showDetails && !compact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              
              {/* ハーモニック分析 */}
              <div className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Gem className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                  ハーモニック分析
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">型×占星術整合性</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {harmonicResonance.typeAstrologyAlignment}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">宇宙的同調度</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {harmonicResonance.personalityCosmicSync}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI人格との関係性 */}
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
                  AI人格との関係性
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {profile.selectedAiPersonality}タイプ
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {profile.relationshipType === 'friend' && '友達'}
                    {profile.relationshipType === 'romantic' && '恋人'}
                    {profile.relationshipType === 'counselor' && 'カウンセラー'}
                    {profile.relationshipType === 'mentor' && 'メンター'}
                  </Badge>
                </div>
              </div>
              
            </motion.div>
          )}
          
          {/* エネルギーバー */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">今日のハーモニックエネルギー</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {harmonicResonance.dailyEnergyMatch}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${harmonicResonance.dailyEnergyMatch}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full bg-gradient-to-r ${resonanceColor} relative overflow-hidden`}
              >
                <motion.div
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-white/30 w-1/3"
                />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* 装飾的な星のアニメーション */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Stars className="w-4 h-4 text-purple-400 dark:text-purple-300 opacity-50" />
          </motion.div>
        </div>
        
      </Card>
    </motion.div>
  );
}
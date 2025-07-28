// 🎵 TypeMate Self-Affirmation Display Component
// 自己肯定感向上コンテンツ表示コンポーネント

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  Heart, 
  Briefcase, 
  Users, 
  User,
  Lightbulb,
  Target,
  Award,
  Zap
} from 'lucide-react';
import type { DetailedDiagnosisResult } from '@/types';
import { getSelfAffirmationContent } from '@/lib/self-affirmation-content';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { TITLE_DATA } from '@/lib/title-data';

interface SelfAffirmationDisplayProps {
  detailedResult: DetailedDiagnosisResult;
  className?: string;
}

export function SelfAffirmationDisplay({ 
  detailedResult, 
  className = '' 
}: SelfAffirmationDisplayProps) {
  const content = getSelfAffirmationContent(detailedResult.fullArchetype64);
  const baseArchetypeData = ARCHETYPE_DATA[detailedResult.baseArchetype];
  const titleData = TITLE_DATA[detailedResult.title];

  return (
    <div className={className}>
      <Card className="p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">あなたの才能と可能性</h3>
            <Star className="text-purple-500" size={24} />
          </div>
          <p className="text-slate-600 text-sm">
            あなたの特別な価値と、それを活かす方法をご紹介します
          </p>
        </motion.div>

        {/* 独自性・特別さ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border border-blue-300">
            <div className="flex items-start gap-3">
              <Award className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">✨ あなたの独自性</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {content.uniqueness}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 核心的な能力 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-purple-600" size={18} />
            <h4 className="font-semibold text-slate-800">🚀 核心的な能力</h4>
          </div>
          <div className="grid gap-2">
            {content.coreAbilities.map((ability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                <span className="text-slate-700">{ability}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 発揮される場面 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="text-green-600" size={18} />
            <h4 className="font-semibold text-slate-800">🎯 力を発揮する場面</h4>
          </div>
          <div className="grid gap-2">
            {content.activationScenes.map((scene, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <span className="text-slate-700">{scene}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 社会的価値 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border border-green-300">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-green-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">📈 現代社会での価値</h4>
                <p className="text-green-700 text-sm leading-relaxed">
                  {content.socialValue}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 成長ポテンシャル */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-orange-600" size={18} />
            <h4 className="font-semibold text-slate-800">💡 成長ポテンシャル</h4>
          </div>
          <div className="grid gap-2">
            {content.growthPotential.map((potential, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <span className="text-slate-700">{potential}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 日常での活かし方 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-6"
        >
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Heart className="text-red-500" size={18} />
            💡 日常でこの能力を活かすヒント
          </h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* 仕事・学習 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="text-blue-600" size={16} />
                <h5 className="font-medium text-slate-800 text-sm">仕事・学習</h5>
              </div>
              <div className="space-y-1">
                {content.dailyApplication.work.map((item, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-start gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 人間関係 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-purple-600" size={16} />
                <h5 className="font-medium text-slate-800 text-sm">人間関係</h5>
              </div>
              <div className="space-y-1">
                {content.dailyApplication.relationships.map((item, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-start gap-1">
                    <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 個人の成長 */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="text-green-600" size={16} />
                <h5 className="font-medium text-slate-800 text-sm">個人の成長</h5>
              </div>
              <div className="space-y-1">
                {content.dailyApplication.personal.map((item, index) => (
                  <div key={index} className="text-xs text-slate-600 flex items-start gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 励ましのメッセージ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg border border-pink-300">
            <div className="flex items-start gap-3">
              <Heart className="text-pink-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-semibold text-pink-800 mb-2">💖 あなたへのメッセージ</h4>
                <p className="text-pink-700 text-sm leading-relaxed">
                  {content.motivationalMessage}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 特性バッジ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-6 flex flex-wrap gap-2 justify-center"
        >
          {[...baseArchetypeData.traits, ...titleData.traits].map((trait, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-700"
            >
              {trait}
            </Badge>
          ))}
        </motion.div>
      </Card>
    </div>
  );
}

// コンパクト版（設定画面用の簡略表示）
export function SelfAffirmationDisplayCompact({ 
  detailedResult, 
  className = '' 
}: SelfAffirmationDisplayProps) {
  const content = getSelfAffirmationContent(detailedResult.fullArchetype64);
  
  return (
    <div className={className}>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-blue-500" size={18} />
            <h4 className="font-semibold text-slate-800">あなたの価値</h4>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {content.uniqueness}
            </p>
          </div>

          <div>
            <h5 className="font-medium text-slate-800 text-sm mb-2 flex items-center gap-1">
              <Zap className="text-purple-600" size={14} />
              核心的な能力
            </h5>
            <div className="text-xs text-slate-600 space-y-1">
              {content.coreAbilities.slice(0, 2).map((ability, index) => (
                <div key={index} className="flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                  <span>{ability}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-200">
            <p className="text-xs text-pink-700 leading-relaxed">
              {content.motivationalMessage}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
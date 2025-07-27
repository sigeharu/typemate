// 🎵 TypeMate Type Detail Display Component
// 64タイプ詳細表示コンポーネント

'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Crown, Heart, Gem, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { DetailedDiagnosisResult } from '@/types';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import { formatDetailedResult } from '@/lib/type-display-utils';

interface TypeDetailDisplayProps {
  detailedResult: DetailedDiagnosisResult;
  className?: string;
  showTitle?: boolean;
}

export function TypeDetailDisplay({ 
  detailedResult, 
  className = '',
  showTitle = true 
}: TypeDetailDisplayProps) {
  const formattedData = formatDetailedResult(detailedResult);
  const baseArchetypeData = ARCHETYPE_DATA[detailedResult.baseArchetype];
  
  const getGroupIcon = (group: string) => {
    switch (group) {
      case '分析家': return <Crown className="text-purple-600" size={20} />;
      case '外交官': return <Heart className="text-pink-600" size={20} />;
      case '番人': return <Gem className="text-blue-600" size={20} />;
      case '探検家': return <Sparkles className="text-orange-600" size={20} />;
      default: return <Sparkles className="text-gray-600" size={20} />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-blue-400';
    if (percentage >= 40) return 'bg-gray-400';
    return 'bg-purple-400';
  };

  return (
    <div className={className}>
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            あなたのタイプは
          </h2>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
            {getGroupIcon(baseArchetypeData.group)}
            <span className="text-xl font-bold text-slate-800">
              【{formattedData.titleName}{baseArchetypeData.name}】
            </span>
          </div>
          <p className="text-slate-600 mt-2">です。</p>
        </motion.div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-blue-500" size={20} />
          <h3 className="text-lg font-bold text-slate-800">あなたの特性バランス</h3>
          <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
            信頼度 {detailedResult.confidence}%
          </Badge>
        </div>

        <div className="space-y-5">
          {formattedData.axisData.map((axis, index) => (
            <motion.div
              key={axis.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-700 text-sm">
                  {axis.axisLabel}
                </div>
                <div className="flex items-center gap-2">
                  {axis.isBalance && (
                    <Badge variant="outline" className="text-xs bg-gray-50 border-gray-300 text-gray-600">
                      バランス型
                    </Badge>
                  )}
                  <span className={`text-sm font-semibold ${axis.strengthLevel.color}`}>
                    {axis.dominantLabel}: {axis.dominantPercentage}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <Progress 
                  value={axis.progressValue} 
                  className="h-3 bg-gray-200"
                />
                <div 
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(axis.dominantPercentage)}`}
                  style={{ width: `${axis.progressValue}%` }}
                />
                
                {/* 中心線（50%マーク） */}
                <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-gray-400 transform -translate-x-0.5"></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>{axis.weakerLabel}: {axis.weakerPercentage}%</span>
                <span>{axis.dominantLabel}: {axis.dominantPercentage}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        {detailedResult.balanceTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-gray-600" size={16} />
              <span className="text-sm font-medium text-gray-700">バランス型の特徴</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              以下の軸でバランスの取れた特性を持っています：
            </p>
            <div className="flex flex-wrap gap-1">
              {detailedResult.balanceTypes.map((balanceType, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs bg-gray-100 border-gray-300 text-gray-600"
                >
                  {balanceType}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Sparkles className="text-blue-600" size={16} />
            あなたの特徴
          </h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            {baseArchetypeData.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {baseArchetypeData.traits.map((trait, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-blue-100 border-blue-300 text-blue-700"
              >
                {trait}
              </Badge>
            ))}
          </div>
        </motion.div>
      </Card>
    </div>
  );
}

// 簡易版（設定画面用）
export function TypeDetailDisplayCompact({ 
  detailedResult, 
  className = '' 
}: TypeDetailDisplayProps) {
  const baseArchetypeData = ARCHETYPE_DATA[detailedResult.baseArchetype];
  const formattedData = formatDetailedResult(detailedResult);

  return (
    <div className={className}>
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-slate-800">
          【{formattedData.titleName}{baseArchetypeData.name}】
        </div>
        <div className="text-sm text-slate-600">
          {baseArchetypeData.nameEn} • {baseArchetypeData.group}
        </div>
      </div>

      <div className="space-y-3">
        {formattedData.axisData.map((axis) => (
          <div key={axis.name} className="flex items-center justify-between text-sm">
            <span className="text-slate-600 min-w-0 flex-1">
              {axis.axisLabel}
            </span>
            <span className="text-slate-800 font-medium">
              {axis.dominantLabel}: {axis.dominantPercentage}%
            </span>
          </div>
        ))}
      </div>

      {detailedResult.balanceTypes.length > 0 && (
        <div className="mt-4 text-xs text-slate-500">
          バランス型: {detailedResult.balanceTypes.join('、')}
        </div>
      )}
    </div>
  );
}
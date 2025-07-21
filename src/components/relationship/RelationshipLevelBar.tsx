// 💕 TypeMate Relationship Level Bar
// 関係性レベル表示コンポーネント

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { RelationshipLevel, RelationshipData } from '@/types';

interface RelationshipLevelBarProps {
  currentLevel: RelationshipLevel;
  relationshipData: RelationshipData;
  compact?: boolean;
}

export function RelationshipLevelBar({ 
  currentLevel, 
  relationshipData,
  compact = false 
}: RelationshipLevelBarProps) {
  // 現在のレベル内での進捗計算
  const progressInLevel = currentLevel.level < 6 
    ? ((relationshipData.totalPoints - currentLevel.points) / 
       (currentLevel.maxPoints - currentLevel.points)) * 100
    : 100;

  if (compact) {
    // コンパクト表示（チャット画面用）
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
      >
        <span className="text-2xl">{currentLevel.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {currentLevel.name}
            </span>
            <span className="text-xs text-gray-500">
              {relationshipData.totalPoints}pt
            </span>
          </div>
          <Progress 
            value={progressInLevel} 
            className={`h-1.5 ${currentLevel.color.replace('bg-', '[&>div]:bg-')}`}
          />
        </div>
      </motion.div>
    );
  }

  // フル表示
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-slate-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-4xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentLevel.icon}
            </motion.span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {currentLevel.name}
              </h3>
              <p className="text-sm text-gray-600">
                {currentLevel.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              {relationshipData.totalPoints}
            </p>
            <p className="text-xs text-gray-500">ポイント</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">レベル {currentLevel.level}/6</span>
            <span className="text-gray-600">
              {currentLevel.level < 6 
                ? `次のレベルまで ${currentLevel.maxPoints - relationshipData.totalPoints}pt`
                : '最高レベル達成！'
              }
            </span>
          </div>
          <Progress 
            value={progressInLevel} 
            className={`h-3 ${currentLevel.color.replace('bg-', '[&>div]:bg-')}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500">継続日数</p>
            <p className="text-lg font-semibold text-gray-800">
              {relationshipData.dailyStreak}日
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">マイルストーン</p>
            <p className="text-lg font-semibold text-gray-800">
              {relationshipData.milestones.length}個
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">思い出</p>
            <p className="text-lg font-semibold text-gray-800">
              {Object.keys(relationshipData.specialDates).length}個
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
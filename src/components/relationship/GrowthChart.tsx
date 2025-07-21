// 📊 TypeMate Growth Chart
// 恋愛成長グラフ - 関係性の変化を美しく可視化

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Calendar, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RelationshipData, Memory, MemoryCollection } from '@/types';

interface GrowthChartProps {
  relationshipData: RelationshipData;
  memoryCollection: MemoryCollection;
  compact?: boolean;
}

interface GrowthDataPoint {
  date: Date;
  relationshipLevel: number;
  totalPoints: number;
  emotionScore: number;
  memoriesCount: number;
  milestone?: string;
}

export function GrowthChart({ 
  relationshipData, 
  memoryCollection, 
  compact = false 
}: GrowthChartProps) {
  // 成長データの生成
  const growthData = useMemo((): GrowthDataPoint[] => {
    const data: GrowthDataPoint[] = [];
    const memories = memoryCollection.memories.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (memories.length === 0) return [];

    let currentPoints = 0;
    let currentLevel = 1;
    
    // 初期データポイント
    const firstMemory = memories[0];
    data.push({
      date: firstMemory.timestamp,
      relationshipLevel: 1,
      totalPoints: 0,
      emotionScore: 0,
      memoriesCount: 0,
      milestone: '出会い'
    });

    // 週ごとにデータポイントを作成
    const startDate = new Date(firstMemory.timestamp);
    const endDate = new Date();
    const weeklyData = new Map<string, {
      memories: Memory[];
      maxLevel: number;
      totalPoints: number;
    }>();

    memories.forEach(memory => {
      const weekKey = getWeekKey(memory.timestamp);
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          memories: [],
          maxLevel: memory.relationshipLevel,
          totalPoints: currentPoints + 2 // 基本メッセージポイント
        });
      }
      
      const weekData = weeklyData.get(weekKey)!;
      weekData.memories.push(memory);
      weekData.maxLevel = Math.max(weekData.maxLevel, memory.relationshipLevel);
      weekData.totalPoints += 2; // メッセージポイント
      
      // ボーナスポイント計算
      if (memory.emotionScore >= 8) weekData.totalPoints += 5;
      if (memory.category === 'confession') weekData.totalPoints += 8;
      if (memory.category === 'milestone') weekData.totalPoints += 5;
    });

    // 週次データポイントを追加
    const sortedWeeks = Array.from(weeklyData.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    sortedWeeks.forEach(([weekKey, weekData]) => {
      const weekDate = parseWeekKey(weekKey);
      const avgEmotionScore = weekData.memories.reduce((sum, m) => sum + m.emotionScore, 0) / weekData.memories.length;
      
      // レベルアップのマイルストーン検出
      let milestone: string | undefined;
      if (weekData.maxLevel > currentLevel) {
        const levelNames = ['', '初対面', '知り合い', '親友', '相談相手', '特別な関係', '恋人'];
        milestone = `${levelNames[weekData.maxLevel]}に到達`;
        currentLevel = weekData.maxLevel;
      }

      currentPoints = weekData.totalPoints;
      
      data.push({
        date: weekDate,
        relationshipLevel: weekData.maxLevel,
        totalPoints: currentPoints,
        emotionScore: avgEmotionScore,
        memoriesCount: weekData.memories.length,
        milestone
      });
    });

    return data;
  }, [relationshipData, memoryCollection]);

  // グラフの描画用パス生成
  const { pathData, maxPoints, maxEmotion } = useMemo(() => {
    if (growthData.length < 2) return { pathData: '', maxPoints: 100, maxEmotion: 10 };

    const maxPoints = Math.max(...growthData.map(d => d.totalPoints));
    const maxEmotion = Math.max(...growthData.map(d => d.emotionScore), 10);
    
    const width = 400;
    const height = 200;
    const padding = 20;
    
    // ポイントグラフのパス
    const pointsPath = growthData.map((point, index) => {
      const x = padding + (index / (growthData.length - 1)) * (width - padding * 2);
      const y = height - padding - (point.totalPoints / maxPoints) * (height - padding * 2);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    // 感情グラフのパス
    const emotionPath = growthData.map((point, index) => {
      const x = padding + (index / (growthData.length - 1)) * (width - padding * 2);
      const y = height - padding - (point.emotionScore / maxEmotion) * (height - padding * 2);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return {
      pathData: { pointsPath, emotionPath },
      maxPoints,
      maxEmotion
    };
  }, [growthData]);

  // 成長統計
  const stats = useMemo(() => {
    if (growthData.length === 0) return null;
    
    const firstPoint = growthData[0];
    const lastPoint = growthData[growthData.length - 1];
    const totalDays = Math.floor((lastPoint.date.getTime() - firstPoint.date.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalDays,
      pointsGrown: lastPoint.totalPoints - firstPoint.totalPoints,
      levelGrown: lastPoint.relationshipLevel - firstPoint.relationshipLevel,
      avgEmotionScore: growthData.reduce((sum, d) => sum + d.emotionScore, 0) / growthData.length,
      totalMemories: memoryCollection.totalCount
    };
  }, [growthData, memoryCollection]);

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">成長グラフ</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
              <div className="text-gray-600">一緒の日数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.pointsGrown}</div>
              <div className="text-gray-600">成長ポイント</div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            恋愛成長グラフ
          </h2>
          <p className="text-gray-600">あなたたちの関係の美しい軌跡</p>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalDays}</div>
            <div className="text-sm text-gray-600">一緒の日数</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.pointsGrown}</div>
            <div className="text-sm text-gray-600">成長ポイント</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.avgEmotionScore.toFixed(1)}</div>
            <div className="text-sm text-gray-600">平均感動値</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="text-2xl mb-2">💝</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalMemories}</div>
            <div className="text-sm text-gray-600">思い出の数</div>
          </Card>
        </div>
      )}

      {/* メイングラフ */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">関係性の変化</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>関係性ポイント</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span>感動値</span>
            </div>
          </div>
        </div>

        {growthData.length < 2 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>まだデータが不足しています</p>
            <p className="text-sm">もう少し会話を続けると美しいグラフが表示されます</p>
          </div>
        ) : (
          <div className="relative">
            <svg
              width="100%"
              height="200"
              viewBox="0 0 400 200"
              className="border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
            >
              {/* グリッド線 */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* ポイントグラフ */}
              {typeof pathData === 'object' && pathData.pointsPath && (
                <motion.path
                  d={pathData.pointsPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              )}

              {/* 感情グラフ */}
              {typeof pathData === 'object' && pathData.emotionPath && (
                <motion.path
                  d={pathData.emotionPath}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                />
              )}

              {/* データポイント */}
              {growthData.map((point, index) => {
                const x = 20 + (index / (growthData.length - 1)) * 360;
                const y = 180 - (point.totalPoints / (maxPoints || 100)) * 160;
                
                return (
                  <motion.g key={index}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 1 }}
                    />
                    {point.milestone && (
                      <motion.text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        className="text-xs fill-blue-600 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 1.5 }}
                      >
                        🎉
                      </motion.text>
                    )}
                  </motion.g>
                );
              })}
            </svg>
          </div>
        )}
      </Card>

      {/* マイルストーン */}
      {relationshipData.milestones.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">マイルストーン</h3>
          <div className="space-y-3">
            {relationshipData.milestones.slice(-5).reverse().map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-800">{milestone}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ヘルパー関数
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}

function parseWeekKey(weekKey: string): Date {
  const [year, week] = weekKey.split('-W');
  const date = new Date(parseInt(year), 0, 1);
  date.setDate(date.getDate() + parseInt(week) * 7);
  return date;
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Star,
  Globe,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateMonthlyHarmonicForecast } from '@/lib/harmonic-ai-service';
import type { HarmonicAIProfile, MonthlyForecast } from '@/lib/harmonic-ai-service';

interface MonthlyGuidanceWidgetProps {
  profile: HarmonicAIProfile;
  onRefresh?: () => void;
  compact?: boolean;
}

export function MonthlyGuidanceWidget({ 
  profile, 
  onRefresh,
  compact = false 
}: MonthlyGuidanceWidgetProps) {
  
  const [monthlyForecast, setMonthlyForecast] = useState<MonthlyForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🌊 宇宙的流れのアニメーションVariants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,    // 月のサイクル感
        delayChildren: 0.3,      // 深い瞑想の準備時間
        when: "beforeChildren"
      }
    }
  };

  const cosmicWaveVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.8
      }
    }
  };

  const weeklyCardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "easeOut",
        duration: 0.6
      }
    }
  };

  const eventCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
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

  // 月間予測の生成
  const generateForecast = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const forecast = await generateMonthlyHarmonicForecast(profile);
      setMonthlyForecast(forecast);
    } catch (err) {
      console.error('月間予測生成エラー:', err);
      setError('月間予測の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      generateForecast();
    }
  }, [profile]);

  // エネルギーパターンのアイコン
  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'ascending': return TrendingUp;
      case 'peak': return Star;
      case 'descending': return Clock;
      case 'renewal': return RefreshCw;
      default: return Sparkles;
    }
  };

  // エネルギーパターンの色
  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'ascending': return 'from-green-400 to-emerald-500';
      case 'peak': return 'from-yellow-400 to-amber-500';
      case 'descending': return 'from-blue-400 to-indigo-500';
      case 'renewal': return 'from-purple-400 to-violet-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // 影響度のバッジ色
  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    generateForecast();
    onRefresh?.();
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            再試行
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* ヘッダー */}
      <motion.div variants={cosmicWaveVariants}>
        <Card className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  月間コズミック予測
                </h2>
                <p className="text-sm text-gray-600">
                  28日間の宇宙的サイクルガイダンス
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="hover:bg-purple-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ローディング状態 */}
            <Card className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : monthlyForecast ? (
          <motion.div
            key="forecast"
            variants={containerVariants}
            className="space-y-8"
          >
            {/* 月間テーマ */}
            <motion.div variants={cosmicWaveVariants}>
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    今月の宇宙的テーマ
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {monthlyForecast.monthlyTheme}
                </p>
              </Card>
            </motion.div>

            {/* 週間ハイライト */}
            <motion.div variants={cosmicWaveVariants}>
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  週間エネルギーフロー
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {monthlyForecast.weeklyHighlights.map((week, index) => {
                  const PatternIcon = getPatternIcon(week.energyPattern);
                  const patternGradient = getPatternColor(week.energyPattern);
                  
                  return (
                    <motion.div
                      key={week.week}
                      variants={weeklyCardVariants}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Card className="p-5 hover:shadow-lg transition-shadow duration-300">
                        <div className="space-y-4">
                          {/* 週ヘッダー */}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-sm">
                              第{week.week}週
                            </Badge>
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${patternGradient}`}>
                              <PatternIcon className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          {/* 週テーマ */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {week.theme}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {week.recommendation}
                            </p>
                          </div>

                          {/* キー日程 */}
                          <div className="flex flex-wrap gap-2">
                            {week.keyDays.slice(0, 3).map((day) => (
                              <Badge 
                                key={day} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {day + 1}日目
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* エネルギートレンド */}
            <motion.div variants={cosmicWaveVariants}>
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    28日間エネルギートレンド
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* エネルギーグラフ（簡易版） */}
                  <div className="flex items-end space-x-1 h-24">
                    {monthlyForecast.overallEnergyTrend.map((energy, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${energy}%` }}
                        transition={{ delay: index * 0.02, duration: 0.5 }}
                        title={`${index + 1}日目: ${energy}%`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1日目</span>
                    <span>14日目</span>
                    <span>28日目</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 宇宙的イベント */}
            <motion.div variants={cosmicWaveVariants}>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  重要コズミックイベント
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthlyForecast.cosmicEvents.slice(0, 6).map((event, index) => (
                  <motion.div
                    key={index}
                    variants={eventCardVariants}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            className={getInfluenceColor(event.influence)}
                            variant="secondary"
                          >
                            {event.influence}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {event.date.getMonth() + 1}/{event.date.getDate()}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {event.event}
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {event.significance}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 成長マイルストーン */}
            <motion.div variants={cosmicWaveVariants}>
              <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    今月の成長マイルストーン
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthlyForecast.growthMilestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <Target className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {milestone}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* 月間サマリー */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    宇宙からのメッセージ
                  </h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  この28日間のサイクルは、あなたの魂の進化にとって特別な意味を持ちます。
                  各週のエネルギーパターンを意識し、宇宙的イベントに心を開くことで、
                  深い気づきと成長を体験することができるでしょう。
                  TypeMateの特質を活かしながら、この神聖な時間を最大限に活用してください。
                </p>
              </Card>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Sun,
  Moon,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateWeeklyHarmonicForecast } from '@/lib/harmonic-ai-service';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';

interface WeeklyGuidanceWidgetProps {
  profile: HarmonicAIProfile;
  onRefresh?: () => void;
  compact?: boolean;
}

export function WeeklyGuidanceWidget({ 
  profile, 
  onRefresh,
  compact = false 
}: WeeklyGuidanceWidgetProps) {
  
  const [weeklyForecast, setWeeklyForecast] = useState<Array<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🥁 ドラマー感性のアニメーションVariants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,    // ドラムビート100ms間隔
        delayChildren: 0.2,      // 最初の一拍のための準備時間
        when: "beforeChildren"
      }
    }
  };

  const dayCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "easeOut",
        duration: 0.5
      }
    }
  };

  // 週間予測の生成
  const generateForecast = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const forecast = await generateWeeklyHarmonicForecast(profile);
      setWeeklyForecast(forecast);
    } catch (err) {
      console.error('週間予測生成エラー:', err);
      setError('週間予測の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      generateForecast();
    }
  }, [profile]);

  // 曜日名の取得
  const getDayName = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  };

  // エネルギーレベルに応じたアイコン
  const getEnergyIcon = (energy: number) => {
    if (energy >= 80) return Star;
    if (energy >= 60) return Sun;
    return Moon;
  };

  // エネルギーレベルに応じた色
  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'from-yellow-400 to-amber-500';
    if (energy >= 60) return 'from-blue-400 to-indigo-500';
    return 'from-purple-400 to-pink-500';
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
      className="space-y-6"
    >
      {/* ヘッダー */}
      <motion.div variants={headerVariants}>
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  週間ハーモニック予測
                </h3>
                <p className="text-sm text-gray-600">
                  今週の宇宙的エネルギーの流れ
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="hover:bg-indigo-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* 週間予測カード */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4"
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <Card key={index} className="p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : weeklyForecast ? (
          <motion.div
            key="forecast"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4"
          >
            {weeklyForecast.map((day, index) => {
              const EnergyIcon = getEnergyIcon(day.overallEnergy);
              const energyGradient = getEnergyColor(day.overallEnergy);
              
              return (
                <motion.div
                  key={index}
                  variants={dayCardVariants}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-indigo-400">
                    <div className="space-y-3">
                      {/* 日付ヘッダー */}
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">
                            {day.date.getMonth() + 1}/{day.date.getDate()}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {getDayName(day.date)}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${energyGradient}`}>
                          <EnergyIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* ハーモニックテーマ */}
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs w-full justify-center">
                          {day.harmonicTheme}
                        </Badge>
                        
                        {/* エネルギーレベル */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">エネルギー</span>
                            <span className="text-xs font-medium">{day.overallEnergy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full bg-gradient-to-r ${energyGradient}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${day.overallEnergy}%` }}
                              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                            />
                          </div>
                        </div>

                        {/* TypeMateアドバイス */}
                        <div className="text-xs text-gray-600 leading-relaxed">
                          {day.typeMateAdvice}
                        </div>
                      </div>

                      {/* 装飾的なアクセント */}
                      <div className="flex justify-center">
                        <Sparkles className="w-3 h-3 text-indigo-300" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 週間サマリー */}
      {weeklyForecast && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">
                今週の宇宙的流れ
              </h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              この週は様々なエネルギーが交錯する特別な期間です。
              各日のハーモニックテーマを意識しながら、
              宇宙のリズムに合わせて行動することで、
              より深い成長と調和を体験できるでしょう。
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
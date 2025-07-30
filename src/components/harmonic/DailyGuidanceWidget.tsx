// 🌟 Daily Guidance Widget
// 今日のハーモニック・ガイダンス表示ウィジェット

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Sunset, 
  Lightbulb,
  Heart,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DailyHarmonicGuidance } from '@/lib/harmonic-ai-service';

interface DailyGuidanceWidgetProps {
  guidance: DailyHarmonicGuidance;
  onRefresh?: () => void;
  compact?: boolean;
}

export function DailyGuidanceWidget({ 
  guidance, 
  onRefresh,
  compact = false 
}: DailyGuidanceWidgetProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'affirmations'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // 現在の時間帯を判定
  const getCurrentTimeSlot = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };
  
  const currentTimeSlot = getCurrentTimeSlot();
  const timeSlotIcons = {
    morning: Sun,
    afternoon: Lightbulb,
    evening: Moon
  };
  
  const timeSlotColors = {
    morning: 'from-yellow-400 to-orange-400',
    afternoon: 'from-blue-400 to-indigo-400',
    evening: 'from-purple-400 to-pink-400'
  };
  
  const currentActions = guidance.actionItems[currentTimeSlot];
  const CurrentIcon = timeSlotIcons[currentTimeSlot];
  const currentGradient = timeSlotColors[currentTimeSlot];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800">
        
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentGradient} rounded-full blur-3xl`} />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full blur-2xl" />
        </div>
        
        <div className={`relative p-${compact ? '4' : '6'}`}>
          
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <CurrentIcon className={`w-6 h-6 text-indigo-600 dark:text-indigo-400`} />
              </motion.div>
              <div>
                <h3 className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
                  今日のハーモニック・ガイダンス
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {guidance.date.toLocaleDateString('ja-JP', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </p>
              </div>
            </div>
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* タブナビゲーション */}
          {!compact && (
            <div className="flex space-x-1 mb-4 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
              {[
                { key: 'overview', label: '概要', icon: Target },
                { key: 'actions', label: 'アクション', icon: Clock },
                { key: 'affirmations', label: 'アファメーション', icon: Heart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* コンテンツエリア */}
          <AnimatePresence mode="wait">
            
            {/* 概要タブ */}
            {(activeTab === 'overview' || compact) && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                
                {/* コズミック天気 */}
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    コズミック天気
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {guidance.cosmicGuidance.cosmicWeather}
                  </p>
                </div>
                
                {/* 個人メッセージ */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
                    あなたへのメッセージ
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {guidance.cosmicGuidance.personalMessage}
                  </p>
                </div>
                
                {/* エネルギー予報 */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(guidance.cosmicGuidance.energyForecast).map(([time, energy]) => {
                    const Icon = timeSlotIcons[time as keyof typeof timeSlotIcons];
                    const isActive = time === currentTimeSlot;
                    
                    return (
                      <div
                        key={time}
                        className={`text-center p-3 rounded-lg transition-all ${
                          isActive 
                            ? 'bg-white dark:bg-gray-700 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-700' 
                            : 'bg-white/50 dark:bg-gray-800/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <div className={`text-lg font-bold ${
                          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {energy}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {time === 'morning' && '朝'}
                          {time === 'afternoon' && '昼'}
                          {time === 'evening' && '夜'}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
              </motion.div>
            )}
            
            {/* アクションタブ */}
            {activeTab === 'actions' && !compact && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                
                {/* 現在の時間帯のアクション */}
                <div className={`bg-gradient-to-r ${currentGradient} bg-opacity-10 rounded-lg p-4`}>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <CurrentIcon className="w-4 h-4 mr-2" />
                    今の時間におすすめ
                  </h4>
                  <ul className="space-y-2">
                    {currentActions.map((action, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span>{action}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                {/* TypeMate統合アドバイス */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(guidance.typeMateIntegration).map(([key, advice]) => (
                    <div key={key} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {key === 'archetypeAdvice' && 'アーキタイプ'}
                        {key === 'relationshipTip' && '関係性'}
                        {key === 'personalGrowth' && '成長'}
                        {key === 'energyAlignment' && 'エネルギー'}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{advice}</p>
                    </div>
                  ))}
                </div>
                
              </motion.div>
            )}
            
            {/* アファメーションタブ */}
            {activeTab === 'affirmations' && !compact && (
              <motion.div
                key="affirmations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {guidance.affirmations.map((affirmation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-lg p-4"
                  >
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center">
                      ✨ {affirmation}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
          </AnimatePresence>
          
          {/* ラッキーエレメンツ */}
          {!compact && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">今日のラッキーエレメント</span>
                <div className="flex space-x-3">
                  <Badge variant="outline" className="text-xs">
                    🎨 {guidance.cosmicGuidance.luckyElements.color}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    🔢 {guidance.cosmicGuidance.luckyElements.number}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    🧭 {guidance.cosmicGuidance.luckyElements.direction}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </Card>
    </motion.div>
  );
}
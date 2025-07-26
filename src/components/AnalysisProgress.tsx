// 🔬 TypeMate AI理解度分析プログレス表示
// 清潔感・ラボ感のある科学的デザインで4段階分析を視覚化

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AnalysisStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
  glowColor: string;
}

interface AnalysisProgressProps {
  className?: string;
}

export function AnalysisProgress({ className = '' }: AnalysisProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 4段階分析の定義
  const stages: AnalysisStage[] = [
    {
      id: 'basic',
      name: '基本データ',
      description: '基礎情報を解析中',
      icon: <Search className="w-4 h-4" />,
      progress: 60,
      color: 'bg-blue-500',
      glowColor: 'shadow-blue-200'
    },
    {
      id: 'preference',
      name: '嗜好理解',
      description: '好みパターンを分析',
      icon: <Brain className="w-4 h-4" />,
      progress: 40,
      color: 'bg-emerald-500',
      glowColor: 'shadow-emerald-200'
    },
    {
      id: 'values',
      name: '価値観把握',
      description: '深層心理を探索',
      icon: <Heart className="w-4 h-4" />,
      progress: 20,
      color: 'bg-purple-500',
      glowColor: 'shadow-purple-200'
    },
    {
      id: 'deep',
      name: '深層理解',
      description: '本質的理解を構築',
      icon: <Sparkles className="w-4 h-4" />,
      progress: 0,
      color: 'bg-amber-500',
      glowColor: 'shadow-amber-200'
    }
  ];

  // ENFPサポート: 30秒でプログレスバー視覚変化
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage(prev => (prev + 1) % stages.length);
    }, 7500); // 30秒で4段階循環

    return () => clearInterval(interval);
  }, []);

  // アニメーション効果
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const stageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (progress: number) => ({
      width: `${progress}%`,
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full max-w-md ${className}`}
    >
      <Card className="border border-stone-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-medium text-stone-700">
              AI理解度分析
            </h3>
            <div className="ml-auto text-xs text-stone-500">
              実行中
            </div>
          </div>

          {/* 分析段階表示 */}
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                variants={stageVariants}
                className={`relative ${
                  index === currentStage 
                    ? 'ring-1 ring-blue-200 bg-blue-50/30' 
                    : ''
                } rounded-lg p-2 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`
                      p-1.5 rounded-full text-white transition-all duration-300
                      ${stage.color} 
                      ${index === currentStage ? `${stage.glowColor} shadow-md` : 'opacity-60'}
                    `}>
                      {stage.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-700">
                        {stage.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {stage.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* プログレス表示（●●○○○形式） */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          dotIndex < Math.floor(stage.progress / 20)
                            ? stage.color
                            : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* プログレスバー */}
                <div className="relative h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    variants={progressVariants}
                    custom={stage.progress}
                    className={`h-full ${stage.color} rounded-full`}
                    initial="hidden"
                    animate="visible"
                  />
                  
                  {/* アニメーション効果 - 現在のステージのみ */}
                  {index === currentStage && (
                    <motion.div
                      className="absolute top-0 left-0 h-full w-8 bg-white/30 rounded-full"
                      animate={{
                        x: ['-100%', `${stage.progress + 10}%`],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </div>

                {/* パーセンテージ表示 */}
                <div className="text-right mt-1">
                  <span className="text-xs font-medium text-stone-600">
                    {stage.progress}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 総合進捗 */}
          <div className="mt-4 pt-3 border-t border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>総合理解度</span>
              <span className="font-medium">
                {Math.round(stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length)}%
              </span>
            </div>
            <div className="mt-1 h-1 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 via-purple-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length}%` 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ラボ感のある装飾 */}
          <div className="absolute top-2 right-2 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-60"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
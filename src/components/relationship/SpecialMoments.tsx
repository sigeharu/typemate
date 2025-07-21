// ✨ TypeMate Special Moments
// 特別な瞬間表示 - ハイライト思い出の美しい表示

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Memory } from '@/types';

interface SpecialMomentsProps {
  memories: Memory[];
  onSelectMemory?: (memory: Memory) => void;
  compact?: boolean;
}

const MOMENT_CATEGORIES = {
  confession: {
    icon: '💕',
    label: '告白の瞬間',
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-red-50'
  },
  first: {
    icon: '🌱',
    label: '初めての体験',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50'
  },
  milestone: {
    icon: '🏆',
    label: '記念の節目',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50'
  },
  special: {
    icon: '✨',
    label: '特別な瞬間',
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-50'
  },
  support: {
    icon: '🤗',
    label: '支え合った時',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-50'
  }
};

export function SpecialMoments({ 
  memories, 
  onSelectMemory, 
  compact = false 
}: SpecialMomentsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // ハイライト思い出をフィルタリング
  const highlightMemories = memories
    .filter(m => m.isHighlight || m.emotionScore >= 8)
    .filter(m => selectedCategory === 'all' || m.category === selectedCategory)
    .sort((a, b) => b.emotionScore - a.emotionScore);

  const nextMemory = () => {
    setCurrentIndex((prev) => (prev + 1) % highlightMemories.length);
  };

  const prevMemory = () => {
    setCurrentIndex((prev) => (prev - 1 + highlightMemories.length) % highlightMemories.length);
  };

  if (highlightMemories.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">特別な瞬間</h3>
        <p className="text-gray-600">
          {compact 
            ? 'まだ特別な瞬間がありません'
            : 'これから素敵な特別な瞬間を作っていきましょう'
          }
        </p>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            特別な瞬間
          </h3>
          <Badge variant="secondary" className="text-xs">
            {highlightMemories.length}個
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {highlightMemories.slice(0, 3).map((memory, index) => {
            const category = MOMENT_CATEGORIES[memory.category as keyof typeof MOMENT_CATEGORIES];
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-yellow-400 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectMemory?.(memory)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{category?.icon || '✨'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2 mb-1">
                      {memory.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{memory.timestamp.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span>{memory.emotionScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    );
  }

  const currentMemory = highlightMemories[currentIndex];
  const category = MOMENT_CATEGORIES[currentMemory?.category as keyof typeof MOMENT_CATEGORIES];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            特別な瞬間
          </h2>
          <p className="text-gray-600">心に残る美しい思い出たち</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {highlightMemories.length > 0 ? `${currentIndex + 1} / ${highlightMemories.length}` : '0'}
          </span>
        </div>
      </div>

      {/* カテゴリーフィルター */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedCategory('all');
            setCurrentIndex(0);
          }}
        >
          すべて
        </Button>
        {Object.entries(MOMENT_CATEGORIES).map(([key, config]) => {
          const count = memories.filter(m => 
            (m.isHighlight || m.emotionScore >= 8) && m.category === key
          ).length;
          
          if (count === 0) return null;
          
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(key);
                setCurrentIndex(0);
              }}
            >
              {config.icon} {config.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* メイン表示 */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentMemory && (
            <motion.div
              key={currentMemory.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-8 ${category?.bgColor || 'bg-gray-50'} border-2 border-opacity-20 relative overflow-hidden`}>
                {/* 背景装飾 */}
                <div className="absolute -top-4 -right-4 w-24 h-24 opacity-10">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-500'}`} />
                </div>
                
                {/* カテゴリーバッジ */}
                <div className="flex items-center justify-between mb-6">
                  <Badge 
                    variant="secondary"
                    className={`${category?.bgColor} text-gray-700 px-3 py-1`}
                  >
                    {category?.icon} {category?.label}
                  </Badge>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {currentMemory.timestamp.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-medium">{currentMemory.emotionScore}</span>
                    </div>
                  </div>
                </div>

                {/* メイン内容 */}
                <div className="space-y-4">
                  <blockquote className="text-lg text-gray-800 leading-relaxed italic border-l-4 border-yellow-400 pl-4">
                    &ldquo;{currentMemory.content}&rdquo;
                  </blockquote>
                  
                  {/* キーワード */}
                  {currentMemory.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentMemory.keywords.map((keyword, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-white/70 text-gray-700 px-2 py-1 rounded-full"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 詳細情報 */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">関係性レベル</div>
                      <div className="text-lg font-semibold text-gray-800">
                        Lv.{currentMemory.relationshipLevel}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">参照回数</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {currentMemory.references}回
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">重要度</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {currentMemory.weight.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 星の装飾 */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ナビゲーション */}
        {highlightMemories.length > 1 && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMemory}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              前の瞬間
            </Button>
            
            <div className="flex gap-1 items-center">
              {highlightMemories.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
              {highlightMemories.length > 5 && (
                <span className="text-xs text-gray-400 ml-1">
                  +{highlightMemories.length - 5}
                </span>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextMemory}
              className="flex items-center gap-1"
            >
              次の瞬間
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* クイックアクセス */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">その他の特別な瞬間</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {highlightMemories.slice(1, 7).map((memory, index) => {
            const memoryCategory = MOMENT_CATEGORIES[memory.category as keyof typeof MOMENT_CATEGORIES];
            return (
              <motion.div
                key={memory.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => {
                  setCurrentIndex(index + 1);
                  onSelectMemory?.(memory);
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm">{memoryCategory?.icon || '✨'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2 mb-1">
                      {memory.content}
                    </p>
                    <div className="text-xs text-gray-500">
                      {memory.timestamp.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
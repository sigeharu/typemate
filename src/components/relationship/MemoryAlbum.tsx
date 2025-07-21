// 💝 TypeMate Memory Album
// 思い出アルバム - 美しく表示される思い出コレクション

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Star, Search, Filter, ArrowLeft, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Memory, MemoryCollection } from '@/types';

interface MemoryAlbumProps {
  memoryCollection: MemoryCollection;
  onSelectMemory?: (memory: Memory) => void;
  onClose?: () => void;
  compact?: boolean;
}

const CATEGORY_CONFIG: Record<Memory['category'], { 
  label: string; 
  icon: string; 
  color: string;
  bgColor: string;
}> = {
  first: { label: '初めて', icon: '🌱', color: 'text-green-600', bgColor: 'bg-green-100' },
  special: { label: '特別', icon: '✨', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  growth: { label: '成長', icon: '🌳', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  emotion: { label: '感情', icon: '💝', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  milestone: { label: '節目', icon: '🏆', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  confession: { label: '告白', icon: '💕', color: 'text-red-600', bgColor: 'bg-red-100' },
  support: { label: '支え', icon: '🤗', color: 'text-indigo-600', bgColor: 'bg-indigo-100' }
};

export function MemoryAlbum({ 
  memoryCollection, 
  onSelectMemory, 
  onClose, 
  compact = false 
}: MemoryAlbumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Memory['category'] | 'all'>('all');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // フィルタリングされた思い出
  const filteredMemories = memoryCollection.memories.filter(memory => {
    const matchesSearch = searchQuery === '' || 
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 思い出カードコンポーネント
  const MemoryCard = ({ memory, index }: { memory: Memory; index: number }) => {
    const config = CATEGORY_CONFIG[memory.category];
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
          onClick={() => {
            setSelectedMemory(memory);
            onSelectMemory?.(memory);
          }}
        >
          {/* カテゴリーバッジ */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`${config.bgColor} ${config.color} text-xs`}
            >
              {config.icon} {config.label}
            </Badge>
          </div>

          {/* ハイライト表示 */}
          {memory.isHighlight && (
            <div className="absolute top-2 left-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          )}

          {/* メイン内容 */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed">
              {memory.content}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {memory.timestamp.toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              
              <div className="flex items-center gap-2">
                {/* 感情スコア */}
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>{memory.emotionScore}</span>
                </div>
                
                {/* 参照回数 */}
                {memory.references > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{memory.references}</span>
                  </div>
                )}
              </div>
            </div>

            {/* キーワード */}
            {memory.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {memory.keywords.slice(0, 3).map((keyword, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 重み表示（デバッグ用） */}
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                 style={{ opacity: memory.weight / 10 }} />
          </div>
        </Card>
      </motion.div>
    );
  };

  if (compact) {
    // コンパクト表示
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">思い出アルバム</h3>
          <span className="text-sm text-gray-500">{memoryCollection.totalCount}個の思い出</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memoryCollection.highlightMemories.slice(0, 4).map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* ヘッダー */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft size={20} />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">思い出アルバム</h1>
                <p className="text-sm text-gray-600">
                  {memoryCollection.totalCount}個の美しい思い出
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                グリッド
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                タイムライン
              </Button>
            </div>
          </div>

          {/* 検索とフィルター */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="思い出を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                すべて
              </Button>
              {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category as Memory['category'])}
                >
                  {config.icon} {config.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* メイン内容 */}
      <main className="max-w-6xl mx-auto p-4">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchQuery || selectedCategory !== 'all' 
                ? '該当する思い出が見つかりません'
                : 'まだ思い出がありません'
              }
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all'
                ? '検索条件を変更してみてください'
                : 'これから素敵な思い出を作っていきましょう'
              }
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
            }
          >
            {filteredMemories.map((memory, index) => (
              <MemoryCard key={memory.id} memory={memory} index={index} />
            ))}
          </motion.div>
        )}
      </main>

      {/* 詳細モーダル */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {CATEGORY_CONFIG[selectedMemory.category].icon}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`${CATEGORY_CONFIG[selectedMemory.category].bgColor} ${CATEGORY_CONFIG[selectedMemory.category].color}`}
                    >
                      {CATEGORY_CONFIG[selectedMemory.category].label}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMemory(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedMemory.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedMemory.timestamp.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      感動値: {selectedMemory.emotionScore}
                    </div>
                  </div>

                  {selectedMemory.keywords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">キーワード</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMemory.keywords.map((keyword, i) => (
                          <span 
                            key={i}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    参照回数: {selectedMemory.references} | 
                    重み: {selectedMemory.weight.toFixed(1)} |
                    関係性Lv.{selectedMemory.relationshipLevel}の時の思い出
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
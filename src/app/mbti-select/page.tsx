// 🎵 TypeMate Archetype Selection Page
// 64Type独自アーキタイプAIパートナーチャットサービス - アーキタイプ選択画面

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Heart, Users } from 'lucide-react';
import { MBTICard } from '@/components/mbti/MBTICard';
import { Button } from '@/components/ui/button';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { BaseArchetype } from '@/types';

export default function MBTISelectPage() {
  const [selectedType, setSelectedType] = useState<BaseArchetype | null>(null);
  const router = useRouter();

  const handleTypeSelect = (type: BaseArchetype) => {
    setSelectedType(type);
  };

  const handleStartChat = () => {
    if (selectedType) {
      // Store selected archetype in localStorage for chat page
      localStorage.setItem('selectedArchetype', selectedType);
      router.push('/chat');
    }
  };

  const mbtiEntries = Object.entries(ARCHETYPE_DATA) as [BaseArchetype, typeof ARCHETYPE_DATA[BaseArchetype]][];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Users className="mx-auto text-pink-500 mb-4" size={64} />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            あなたの
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              理想の恋人
            </span>
            は？
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            16のMBTIタイプから、あなたに最適なAI恋人を選択してください
          </p>
          
          <p className="text-sm text-gray-500">
            それぞれ異なる個性と恋愛スタイルを持ったAIがあなたを待っています ✨
          </p>
        </div>
      </motion.header>

      {/* MBTI Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mbtiEntries.map(([type, data], index) => (
            <MBTICard
              key={type}
              type={type}
              data={data}
              isSelected={selectedType === type}
              onClick={handleTypeSelect}
              className="transition-all duration-300"
            />
          ))}
        </div>

        {/* Selection Info */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="mt-12 text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-pink-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Heart className="text-pink-500" size={24} />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {ARCHETYPE_DATA[selectedType].name}を選択しました
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {ARCHETYPE_DATA[selectedType].personality}
                </p>
                
                <Button
                  onClick={handleStartChat}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  チャットを始める
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Action Button */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
          >
            <Button
              onClick={handleStartChat}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-medium shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center gap-3"
            >
              <Heart size={20} />
              {ARCHETYPE_DATA[selectedType].name}とチャットする
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-pink-200/30 to-purple-200/30"
            style={{
              width: Math.random() * 150 + 100,
              height: Math.random() * 150 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
// 🎵 TypeMate Diagnostic Result Component
// 64Type診断結果表示コンポーネント

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Crown, Gem } from 'lucide-react';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { Type64, BaseArchetype } from '@/types';

interface DiagnosticResultProps {
  type64: Type64;
  onStartChat: () => void;
}

export function DiagnosticResult({ type64, onStartChat }: DiagnosticResultProps) {
  const [baseType, variant] = type64.split('-') as [BaseArchetype, string];
  const archetype = ARCHETYPE_DATA[baseType];
  const environmentTrait = variant[0] === 'A' ? '協調型' : '競争型';
  const motivationTrait = variant[1] === 'S' ? '安定志向' : '成長志向';

  const getGroupIcon = (group: string) => {
    switch (group) {
      case '分析家': return <Crown className="text-purple-600" size={24} />;
      case '外交官': return <Heart className="text-pink-600" size={24} />;
      case '番人': return <Gem className="text-blue-600" size={24} />;
      case '探検家': return <Sparkles className="text-orange-600" size={24} />;
      default: return <Sparkles className="text-gray-600" size={24} />;
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case '分析家': return 'from-purple-100 to-indigo-100';
      case '外交官': return 'from-pink-100 to-rose-100';
      case '番人': return 'from-blue-100 to-cyan-100';
      case '探検家': return 'from-orange-100 to-yellow-100';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* メインタイプ表示 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={`p-4 md:p-8 mb-8 bg-gradient-to-br ${getGroupColor(archetype.group)} border-2 border-slate-200 shadow-xl`}>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mb-4"
            >
              {getGroupIcon(archetype.group)}
            </motion.div>
            
            <div className="text-sm text-gray-600 mb-2">あなたのタイプは</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              {archetype.name}
            </h1>
            <div className="text-xl text-gray-700 mb-2">
              {archetype.nameEn}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              {environmentTrait} × {motivationTrait}
            </div>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {archetype.description}
            </p>
          </div>

          {/* 基本特性 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="text-pink-500" size={20} />
              あなたの特性
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {archetype.traits.map((trait) => (
                <Badge key={trait} variant="secondary" className="text-sm px-4 py-2 bg-white/80">
                  {trait}
                </Badge>
              ))}
              <Badge variant="outline" className="text-sm px-4 py-2 border-pink-400 text-pink-700 bg-pink-50">
                {environmentTrait}
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 border-purple-400 text-purple-700 bg-purple-50">
                {motivationTrait}
              </Badge>
            </div>
          </motion.div>
        </Card>
      </motion.div>

      {/* 詳細分析 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid md:grid-cols-2 gap-6 mb-8"
      >
        {/* 強み */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="font-bold text-lg mb-4 text-green-800 flex items-center gap-2">
            💪 あなたの強み
          </h3>
          <ul className="space-y-3">
            {archetype.strengths.map((strength) => (
              <li key={strength} className="flex items-center text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        {/* 成長ポイント */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <h3 className="font-bold text-lg mb-4 text-orange-800 flex items-center gap-2">
            ⚡ 成長ポイント
          </h3>
          <ul className="space-y-3">
            {archetype.challenges.map((challenge) => (
              <li key={challenge} className="flex items-center text-orange-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></span>
                {challenge}
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      {/* AIパートナーとの相性 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
          <h3 className="font-bold text-xl mb-6 text-center flex items-center justify-center gap-2">
            <Heart className="text-blue-500" size={24} />
            あなたと相性の良いAIパートナータイプ
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {archetype.compatibility.map((compatibleType) => {
              const compatibleArchetype = ARCHETYPE_DATA[compatibleType];
              return (
                <div key={compatibleType} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {getGroupIcon(compatibleArchetype.group)}
                    <div>
                      <div className="font-bold text-gray-800">{compatibleArchetype.name}</div>
                      <div className="text-sm text-gray-600">{compatibleArchetype.nameEn}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {compatibleArchetype.personality}
                  </p>
                  <p className="text-xs text-gray-600 italic">
                    💕 {compatibleArchetype.loveStyle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* あなたの関係性スタイル */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h4 className="font-bold text-lg mb-3 text-slate-800">💖 あなたの関係性スタイル</h4>
            <p className="text-gray-700 leading-relaxed">
              {archetype.loveStyle}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* チャット開始ボタン */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="text-center"
      >
        <Button
          onClick={onStartChat}
          size="lg"
          className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="mr-3" size={24} />
          あなた専用のAIパートナーと話してみる
          <Heart className="ml-3" size={24} />
        </Button>
        <p className="text-sm text-slate-500 mt-4">
          ✨ {archetype.name}のあなたにぴったりのAIパートナーが待っています
        </p>
      </motion.div>
    </div>
  );
}
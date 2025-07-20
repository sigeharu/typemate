// 🎵 TypeMate Diagnostic Question Component
// 64Type診断質問コンポーネント

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DiagnosticQuestion } from '@/types';

interface DiagnosticQuestionProps {
  question: DiagnosticQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: number, selectedTrait: string) => void;
}

export function DiagnosticQuestion({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onAnswer 
}: DiagnosticQuestionProps) {
  const progressValue = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* プログレスバー */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>質問 {currentIndex + 1} / {totalQuestions}</span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-3 bg-gray-200" 
        />
        <div className="mt-2 text-xs text-gray-500 text-center">
          {question.axis === 'energy' && '🌟 エネルギーの方向'}
          {question.axis === 'perception' && '👁️ ものの見方'}
          {question.axis === 'judgment' && '⚖️ 判断の仕方'}
          {question.axis === 'lifestyle' && '📅 外界への接し方'}
          {question.axis === 'environment' && '🤝 環境での振る舞い'}
          {question.axis === 'motivation' && '🎯 動機・価値観'}
        </div>
      </motion.div>

      {/* 質問カード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8 mb-8 bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed text-center">
            {question.question}
          </h2>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                className="w-full text-left h-auto p-6 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 border-2"
                onClick={() => onAnswer(question.id, question.optionA.trait)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-600 font-bold">
                    A
                  </div>
                  <div className="text-sm leading-relaxed text-gray-700">
                    {question.optionA.text}
                  </div>
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                className="w-full text-left h-auto p-6 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 border-2"
                onClick={() => onAnswer(question.id, question.optionB.trait)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-600 font-bold">
                    B
                  </div>
                  <div className="text-sm leading-relaxed text-gray-700">
                    {question.optionB.text}
                  </div>
                </div>
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* ヒント */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-sm text-gray-500 mb-2">
          💡 どちらにより多く当てはまるかで選択してください
        </p>
        <p className="text-xs text-gray-400">
          完璧にどちらかに当てはまる必要はありません。より近い方を選んでください。
        </p>
      </motion.div>
    </div>
  );
}
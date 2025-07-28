// 🎵 TypeMate Diagnostic Question Component
// 64Type診断質問コンポーネント

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DiagnosticQuestion, DiagnosticScore } from '@/types';

interface DiagnosticQuestionProps {
  question: DiagnosticQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (questionId: number, score: DiagnosticScore) => void;
}

export function DiagnosticQuestion({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onAnswer 
}: DiagnosticQuestionProps) {
  const progressValue = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* プログレスバー */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 lg:mb-8"
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
        <Card className="p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-musical mb-4 sm:mb-6 lg:mb-8 leading-normal sm:leading-relaxed text-center">
            {question.question}
          </h2>
          
          {/* 5段階評価選択肢 */}
          <div className="space-y-3">
            {/* Option A の説明 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 flex items-center justify-center text-purple-700 font-bold text-sm">
                  A
                </div>
                <div className="text-sm leading-relaxed text-gray-700">
                  {question.optionA.text}
                </div>
              </div>
            </div>

            {/* 5段階評価ボタン */}
            <div className="grid grid-cols-1 gap-3">
              {/* A に強く同意 (+2) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-center h-auto min-h-12 p-3 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 border-2 border-purple-300"
                  onClick={() => onAnswer(question.id, 2)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                      +2
                    </div>
                    <span className="text-sm font-medium text-purple-700">A に強く同意する</span>
                  </div>
                </Button>
              </motion.div>

              {/* A にやや同意 (+1) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-center h-auto min-h-12 p-3 hover:bg-purple-25 hover:border-purple-300 transition-all duration-300 border border-purple-200"
                  onClick={() => onAnswer(question.id, 1)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-300 text-white flex items-center justify-center text-xs font-bold">
                      +1
                    </div>
                    <span className="text-sm text-purple-600">A にやや同意する</span>
                  </div>
                </Button>
              </motion.div>

              {/* どちらともいえない (0) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-center h-auto min-h-12 p-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 border-2 border-gray-300 bg-gray-25"
                  onClick={() => onAnswer(question.id, 0)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-bold">
                      0
                    </div>
                    <span className="text-sm font-medium text-gray-600">どちらともいえない</span>
                  </div>
                </Button>
              </motion.div>

              {/* B にやや同意 (-1) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-center h-auto min-h-12 p-3 hover:bg-blue-25 hover:border-blue-300 transition-all duration-300 border border-blue-200"
                  onClick={() => onAnswer(question.id, -1)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-300 text-white flex items-center justify-center text-xs font-bold">
                      -1
                    </div>
                    <span className="text-sm text-blue-600">B にやや同意する</span>
                  </div>
                </Button>
              </motion.div>

              {/* B に強く同意 (-2) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="outline"
                  className="w-full text-center h-auto min-h-12 p-3 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 border-2 border-blue-300"
                  onClick={() => onAnswer(question.id, -2)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                      -2
                    </div>
                    <span className="text-sm font-medium text-blue-700">B に強く同意する</span>
                  </div>
                </Button>
              </motion.div>
            </div>

            {/* Option B の説明 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 font-bold text-sm">
                  B
                </div>
                <div className="text-sm leading-relaxed text-gray-700">
                  {question.optionB.text}
                </div>
              </div>
            </div>
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
          💡 5段階であなたの傾向を選択してください
        </p>
        <p className="text-xs text-gray-400">
          強い同意（±2）、やや同意（±1）、中立（0）の中から最も近いものを選んでください。
        </p>
      </motion.div>
    </div>
  );
}
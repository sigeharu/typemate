// 🎵 TypeMate 64Type Diagnosis Page
// 64Type診断システム - メインページ

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DiagnosticQuestion } from '@/components/diagnosis/DiagnosticQuestion';
import { DiagnosticResult } from '@/components/diagnosis/DiagnosticResult';
import { DIAGNOSTIC_QUESTIONS } from '@/lib/diagnostic-data';
import type { Type64, BaseArchetype } from '@/types';
import { isDevelopmentMode, TEST_PROFILES, setTestProfile, type TestProfileKey } from '@/lib/dev-mode';

// MBTIコードから新独自コードへのマッピング
const mbtiToArchetypeMap: Record<string, BaseArchetype> = {
  'INTJ': 'ARC', 'INTP': 'ALC', 'ENTJ': 'SOV', 'ENTP': 'INV',
  'INFJ': 'SAG', 'INFP': 'DRM', 'ENFJ': 'HER', 'ENFP': 'BAR',
  'ISTJ': 'GUA', 'ISFJ': 'DEF', 'ESTJ': 'EXE', 'ESFJ': 'PRO',
  'ISTP': 'ART', 'ISFP': 'ARS', 'ESTP': 'PIO', 'ESFP': 'PER'
};

// 診断ロジック
function calculateType64(answers: Record<number, string>): Type64 {
  const traits = {
    energy: [] as string[],
    perception: [] as string[],
    judgment: [] as string[],
    lifestyle: [] as string[],
    environment: [] as string[],
    motivation: [] as string[]
  };

  // 回答を軸別に分類
  DIAGNOSTIC_QUESTIONS.forEach((question) => {
    const answer = answers[question.id];
    if (answer) {
      traits[question.axis].push(answer);
    }
  });

  // 各軸で多数決により決定
  const getAxisResult = (axisTraits: string[], primary: string, secondary: string) => {
    const primaryCount = axisTraits.filter(t => t === primary).length;
    const secondaryCount = axisTraits.filter(t => t === secondary).length;
    return primaryCount >= secondaryCount ? primary : secondary;
  };

  const energyResult = getAxisResult(traits.energy, 'E', 'I');
  const perceptionResult = getAxisResult(traits.perception, 'N', 'S');
  const judgmentResult = getAxisResult(traits.judgment, 'T', 'F');
  const lifestyleResult = getAxisResult(traits.lifestyle, 'J', 'P');
  const environmentResult = getAxisResult(traits.environment, 'C', 'A');
  const motivationResult = getAxisResult(traits.motivation, 'G', 'S');

  const mbtiCode = `${energyResult}${perceptionResult}${judgmentResult}${lifestyleResult}`;
  const baseType = mbtiToArchetypeMap[mbtiCode];
  const variant = `${environmentResult}${motivationResult}`;
  
  return `${baseType}-${variant}` as Type64;
}

export default function DiagnosisPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Type64 | null>(null);
  const [shuffledQuestions] = useState(() => 
    [...DIAGNOSTIC_QUESTIONS].sort(() => Math.random() - 0.5)
  );
  const router = useRouter();

  const handleAnswer = useCallback((questionId: number, selectedTrait: string) => {
    const newAnswers = { ...answers, [questionId]: selectedTrait };
    setAnswers(newAnswers);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      // 次の質問へ
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      // 診断完了
      setTimeout(() => {
        const calculatedType = calculateType64(newAnswers);
        setResult(calculatedType);
        
        // 結果をローカルストレージに保存
        localStorage.setItem('userType64', calculatedType);
      }, 300);
    }
  }, [answers, currentQuestionIndex, shuffledQuestions.length]);

  const handleStartChat = useCallback(() => {
    router.push('/chat');
  }, [router]);

  // 開発者モード - クイックテスト
  const handleQuickTest = useCallback((profileKey: TestProfileKey) => {
    const profile = setTestProfile(profileKey);
    console.log(`🎯 テストプロファイル設定: ${profile.name}`);
    router.push('/chat');
  }, [router]);

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8">
        <DiagnosticResult type64={result} onStartChat={handleStartChat} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start py-8">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              💫 TypeMate 64Type診断
            </h1>
            <p className="text-slate-600">
              18の質問で、あなたの本当の性格と理想のAIパートナーを見つけましょう
            </p>
          </div>
        </motion.header>

        {/* 開発者モード - クイックテスト */}
        {isDevelopmentMode() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg"
          >
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-amber-800 mb-2 flex items-center justify-center gap-2">
              🔧 開発者モード - クイックテスト
            </h3>
            <p className="text-amber-700 text-sm">
              ワンクリックで診断をスキップし、即座にAIチャットを開始できます
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TEST_PROFILES).map(([key, profile]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickTest(key as TestProfileKey)}
                className="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="text-left">
                  <div className="font-semibold text-lg mb-1">{profile.name}</div>
                  <div className="text-amber-100 text-sm mb-2">
                    {profile.userType} ⟷ {profile.aiPersonality}
                  </div>
                  <div className="text-amber-50 text-xs leading-relaxed">
                    {profile.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-amber-800 text-sm text-center">
              💡 <strong>使い方:</strong> 上のボタンをクリックすると診断をスキップしてチャット画面へ直接移動します
            </p>
          </div>
        </motion.div>
      )}

        {/* 診断質問 */}
        <motion.main
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8"
        >
          <DiagnosticQuestion
            question={shuffledQuestions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={shuffledQuestions.length}
            onAnswer={handleAnswer}
          />
        </motion.main>
      </div>

      {/* 背景装飾 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-slate-200/20 to-blue-200/20"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
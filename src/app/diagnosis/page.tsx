// 🎵 TypeMate 64Type Diagnosis Page
// 64Type診断システム - メインページ

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DiagnosticQuestion } from '@/components/diagnosis/DiagnosticQuestion';
import { DiagnosticResult } from '@/components/diagnosis/DiagnosticResult';
import { DIAGNOSTIC_QUESTIONS } from '@/lib/diagnostic-data';
import type { 
  Type64, 
  BaseArchetype, 
  DiagnosticScore, 
  DetailedDiagnosisResult, 
  AxisScore,
  EnergyAxis,
  PerceptionAxis, 
  JudgmentAxis,
  LifestyleAxis,
  EnvironmentAxis,
  MotivationAxis,
  FullArchetype64
} from '@/types';
import { isDevelopmentMode, TEST_PROFILES, setTestProfile, type TestProfileKey } from '@/lib/dev-mode';
import { diagnosisService } from '@/lib/diagnosis-service';
import { determineTitleType } from '@/lib/title-data';

// MBTIコードから新独自コードへのマッピング
const mbtiToArchetypeMap: Record<string, BaseArchetype> = {
  'INTJ': 'ARC', 'INTP': 'ALC', 'ENTJ': 'SOV', 'ENTP': 'INV',
  'INFJ': 'SAG', 'INFP': 'DRM', 'ENFJ': 'HER', 'ENFP': 'BAR',
  'ISTJ': 'GUA', 'ISFJ': 'DEF', 'ESTJ': 'EXE', 'ESFJ': 'PRO',
  'ISTP': 'ART', 'ISFP': 'ARS', 'ESTP': 'PIO', 'ESFP': 'PER'
};

// 質問重み付け設定（精度向上のため）
const QUESTION_WEIGHTS: Record<number, number> = {
  // エネルギー軸 (E/I) - 基本質問
  1: 1.0, 2: 1.0, 3: 1.0,
  // エネルギー軸 - 強化質問（高重み）
  19: 1.3, 20: 1.2,
  
  // ものの見方軸 (S/N) - 基本質問
  4: 1.0, 5: 1.0, 6: 1.0,
  // ものの見方軸 - 強化質問
  23: 1.1,
  
  // 判断軸 (T/F) - 基本質問
  7: 1.0, 8: 1.0, 9: 1.0,
  // 判断軸 - 強化質問
  24: 1.1,
  
  // 外界への接し方軸 (J/P) - 基本質問
  10: 1.0, 11: 1.0, 12: 1.0,
  // 外界への接し方軸 - 内面思考スタイル強化質問（最高重み）
  21: 1.5, 22: 1.4,
  
  // 環境軸 (A/C) - 基本質問
  13: 1.0, 14: 1.0, 15: 1.0,
  // 環境軸 - 追加質問
  25: 1.0,
  
  // 動機軸 (S/G) - 基本質問
  16: 1.0, 17: 1.0, 18: 1.0,
  // 動機軸 - 追加質問
  26: 1.0
};

// 64タイプ対応の新診断ロジック（独自軸システム）
function calculateDetailedType64(answers: Record<number, DiagnosticScore>): DetailedDiagnosisResult {
  // 軸別スコア計算用のオブジェクト
  const rawScores = {
    energy: { positive: 0, negative: 0, neutral: 0 },
    perception: { positive: 0, negative: 0, neutral: 0 },
    judgment: { positive: 0, negative: 0, neutral: 0 },
    lifestyle: { positive: 0, negative: 0, neutral: 0 },
    environment: { positive: 0, negative: 0, neutral: 0 },
    motivation: { positive: 0, negative: 0, neutral: 0 }
  };

  // 5段階スコアの重み付け計算
  DIAGNOSTIC_QUESTIONS.forEach((question) => {
    const score = answers[question.id];
    const weight = QUESTION_WEIGHTS[question.id] || 1.0;
    
    if (score !== undefined) {
      const axis = question.axis;
      const weightedScore = score * weight;
      
      if (score > 0) {
        rawScores[axis].positive += weightedScore;
      } else if (score < 0) {
        rawScores[axis].negative += Math.abs(weightedScore);
      } else {
        rawScores[axis].neutral += weight;
      }
    }
  });

  // 軸別詳細スコア計算（独自軸システム対応）
  const calculateAxisScore = <T extends string>(
    raw: { positive: number; negative: number; neutral: number },
    positiveAxis: T,
    negativeAxis: T
  ): AxisScore & { result: T } => {
    const total = raw.positive + raw.negative + raw.neutral;
    const netScore = raw.positive - raw.negative;
    
    // パーセンテージ計算（50%基準で調整）
    const percentage = total > 0 ? Math.round(((raw.positive + raw.neutral * 0.5) / total) * 100) : 50;
    
    // バランス型判定（±3未満の境界線）
    const isBalance = Math.abs(netScore) < 3;
    
    // 結果決定
    const result = netScore >= 0 ? positiveAxis : negativeAxis;
    
    return {
      positive: raw.positive,
      negative: raw.negative,
      neutral: raw.neutral,
      total: netScore,
      percentage,
      isBalance,
      result
    };
  };

  // 各軸のスコア計算（独自軸システム）
  const energyAxis = calculateAxisScore(rawScores.energy, 'OUTWARD' as EnergyAxis, 'INWARD' as EnergyAxis);
  const perceptionAxis = calculateAxisScore(rawScores.perception, 'INTUITION' as PerceptionAxis, 'SENSING' as PerceptionAxis);
  const judgmentAxis = calculateAxisScore(rawScores.judgment, 'THINKING' as JudgmentAxis, 'FEELING' as JudgmentAxis);
  const lifestyleAxis = calculateAxisScore(rawScores.lifestyle, 'JUDGING' as LifestyleAxis, 'PERCEIVING' as LifestyleAxis);
  const environmentAxis = calculateAxisScore(rawScores.environment, 'COMPETITIVE' as EnvironmentAxis, 'COOPERATIVE' as EnvironmentAxis);
  const motivationAxis = calculateAxisScore(rawScores.motivation, 'GROWTH' as MotivationAxis, 'STABLE' as MotivationAxis);

  // BaseArchetype決定（独自軸→MBTI変換→BaseArchetype）
  const mbtiEnergyCode = energyAxis.result === 'OUTWARD' ? 'E' : 'I';
  const mbtiPerceptionCode = perceptionAxis.result === 'INTUITION' ? 'N' : 'S';
  const mbtiJudgmentCode = judgmentAxis.result === 'THINKING' ? 'T' : 'F';
  const mbtiLifestyleCode = lifestyleAxis.result === 'JUDGING' ? 'J' : 'P';
  
  const mbtiCode = `${mbtiEnergyCode}${mbtiPerceptionCode}${mbtiJudgmentCode}${mbtiLifestyleCode}`;
  const baseType = mbtiToArchetypeMap[mbtiCode];
  
  // 称号決定
  const titleType = determineTitleType(environmentAxis.result, motivationAxis.result);
  
  // FullArchetype64作成
  const fullArchetype64 = `${titleType}_${baseType}` as FullArchetype64;
  
  // Type64（後方互換性維持）
  const environmentCode = environmentAxis.result === 'COMPETITIVE' ? 'C' : 'A';
  const motivationCode = motivationAxis.result === 'GROWTH' ? 'G' : 'S';
  const variant = `${environmentCode}${motivationCode}`;
  const type64 = `${baseType}-${variant}` as Type64;

  // 信頼度計算（バランス型の数に基づく）
  const balanceCount = [energyAxis, perceptionAxis, judgmentAxis, lifestyleAxis, environmentAxis, motivationAxis]
    .filter(axis => axis.isBalance).length;
  const confidence = Math.max(60, 100 - (balanceCount * 10));

  // バランス型軸のリスト（独自軸名）
  const balanceTypes = [];
  if (energyAxis.isBalance) balanceTypes.push('エネルギー方向');
  if (perceptionAxis.isBalance) balanceTypes.push('認知スタイル');
  if (judgmentAxis.isBalance) balanceTypes.push('判断基準');
  if (lifestyleAxis.isBalance) balanceTypes.push('生活スタイル');
  if (environmentAxis.isBalance) balanceTypes.push('環境適応');
  if (motivationAxis.isBalance) balanceTypes.push('動機・価値観');

  // デバッグログ
  console.log('🎯 64タイプ診断スコア詳細:', {
    energy: energyAxis,
    perception: perceptionAxis,
    judgment: judgmentAxis,
    lifestyle: lifestyleAxis,
    environment: environmentAxis,
    motivation: motivationAxis,
    baseType,
    titleType,
    fullArchetype64,
    type64,
    confidence,
    balanceTypes
  });

  return {
    type64,
    fullArchetype64,
    title: titleType,
    baseArchetype: baseType,
    axisScores: {
      energy: energyAxis as AxisScore & { result: EnergyAxis },
      perception: perceptionAxis as AxisScore & { result: PerceptionAxis },
      judgment: judgmentAxis as AxisScore & { result: JudgmentAxis },
      lifestyle: lifestyleAxis as AxisScore & { result: LifestyleAxis },
      environment: environmentAxis as AxisScore & { result: EnvironmentAxis },
      motivation: motivationAxis as AxisScore & { result: MotivationAxis },
    },
    confidence,
    balanceTypes
  };
}

// 後方互換性のための簡易関数
// function calculateType64(answers: Record<number, string | DiagnosticScore>): Type64 {
//   // DiagnosticScoreに変換
//   const scoreAnswers: Record<number, DiagnosticScore> = {};
//   Object.entries(answers).forEach(([key, value]) => {
//     if (typeof value === 'string') {
//       // 既存の文字列回答を5段階スコアに変換（A系統=+1, B系統=-1）
//       scoreAnswers[parseInt(key)] = (value === 'E' || value === 'N' || value === 'T' || value === 'J' || value === 'C' || value === 'G') ? 1 : -1;
//     } else {
//       scoreAnswers[parseInt(key)] = value;
//     }
//   });
//   
//   const detailedResult = calculateDetailedType64(scoreAnswers);
//   return detailedResult.type64;
// }

export default function DiagnosisPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, DiagnosticScore>>({});
  const [result, setResult] = useState<Type64 | null>(null);
  // const [detailedResult, setDetailedResult] = useState<DetailedDiagnosisResult | null>(null);
  const [shuffledQuestions] = useState(() => 
    [...DIAGNOSTIC_QUESTIONS].sort(() => Math.random() - 0.5)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  const handleAnswer = useCallback((questionId: number, score: DiagnosticScore) => {
    const newAnswers = { ...answers, [questionId]: score };
    setAnswers(newAnswers);

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      // 次の質問へ
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      // 診断完了
      setTimeout(async () => {
        const calculatedDetailedResult = calculateDetailedType64(newAnswers);
        // setDetailedResult(calculatedDetailedResult);
        setResult(calculatedDetailedResult.type64);
        
        // 🔬 診断結果をデータベースに保存（後方互換性のため文字列形式も保存）
        setIsSaving(true);
        try {
          // 5段階スコアを文字列形式に変換（データベース互換性のため）
          const stringAnswers: Record<number, string> = {};
          Object.entries(newAnswers).forEach(([key, score]) => {
            const questionId = parseInt(key);
            const question = DIAGNOSTIC_QUESTIONS.find(q => q.id === questionId);
            if (question) {
              // 正のスコアはoptionA.trait、負のスコアはoptionB.traitに変換
              stringAnswers[questionId] = score >= 0 ? question.optionA.trait : question.optionB.trait;
            }
          });
          
          const success = await diagnosisService.saveDiagnosisResult(calculatedDetailedResult.type64, stringAnswers);
          setSaveSuccess(success);
          console.log(success ? '✅ 64タイプ診断結果保存成功' : '⚠️ 診断結果ローカル保存のみ');
          console.log('📊 64タイプ詳細診断結果:', calculatedDetailedResult);
          
          // LocalStorageにも保存
          localStorage.setItem('userType64', calculatedDetailedResult.type64);
          localStorage.setItem('detailedDiagnosisResult', JSON.stringify(calculatedDetailedResult));
          
          // 🎯 重要: DB反映を確実にするため少し待機
          if (success) {
            console.log('⏱️ DB反映確保のため500ms待機');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
        } catch (error) {
          console.error('❌ 診断結果保存エラー:', error);
          // フォールバック: LocalStorageのみ保存
          localStorage.setItem('userType64', calculatedDetailedResult.type64);
          localStorage.setItem('detailedDiagnosisResult', JSON.stringify(calculatedDetailedResult));
        } finally {
          setIsSaving(false);
        }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8">
        <DiagnosticResult 
          type64={result} 
          onStartChat={handleStartChat}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start py-4 sm:py-6 md:py-8">
        {/* ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-musical mb-2">
              ⚡ TypeMate 64Type診断
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
            className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-lg"
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
          className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6"
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
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-slate-200/20 to-blue-200/20"
            style={{
              width: Math.random() * 100 + 80,
              height: Math.random() * 100 + 80,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
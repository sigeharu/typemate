// 🎵 TypeMate Type Display Utilities
// 64タイプ表示用ユーティリティ関数

import type { 
  AxisScore,
  DetailedDiagnosisResult,
  TitleType
} from '@/types';

// 軸名の日本語変換
export const AXIS_LABELS = {
  energy: 'エネルギーの方向',
  perception: 'ものの見方', 
  judgment: '判断の仕方',
  lifestyle: '外界への接し方',
  environment: '心の環境',
  motivation: '成長への動機'
} as const;

// 軸結果の日本語変換
export const AXIS_RESULT_LABELS = {
  // エネルギー軸
  OUTWARD: '外向傾向',
  INWARD: '内向傾向',
  
  // 認知軸
  INTUITION: '直観傾向',
  SENSING: '感覚傾向',
  
  // 判断軸
  THINKING: '思考傾向',
  FEELING: '感情傾向',
  
  // ライフスタイル軸
  JUDGING: '計画的な姿勢',
  PERCEIVING: '柔軟な姿勢',
  
  // 環境軸
  COOPERATIVE: '協調を好む',
  COMPETITIVE: '競争を好む',
  
  // 動機軸
  STABLE: '安定を求める',
  GROWTH: '変化を求める'
} as const;

// 称号の日本語変換
export const TITLE_LABELS: Record<TitleType, string> = {
  HARMONIC: '調和の',
  PIONEERING: '開拓の', 
  SOLITARY: '孤高の',
  CHALLENGING: '挑戦の'
} as const;

// 軸結果の対立軸ラベル取得
export function getAxisPairLabels(axis: string): { positive: string; negative: string } {
  switch (axis) {
    case 'energy':
      return { positive: AXIS_RESULT_LABELS.OUTWARD, negative: AXIS_RESULT_LABELS.INWARD };
    case 'perception':
      return { positive: AXIS_RESULT_LABELS.INTUITION, negative: AXIS_RESULT_LABELS.SENSING };
    case 'judgment':
      return { positive: AXIS_RESULT_LABELS.THINKING, negative: AXIS_RESULT_LABELS.FEELING };
    case 'lifestyle':
      return { positive: AXIS_RESULT_LABELS.JUDGING, negative: AXIS_RESULT_LABELS.PERCEIVING };
    case 'environment':
      return { positive: AXIS_RESULT_LABELS.COMPETITIVE, negative: AXIS_RESULT_LABELS.COOPERATIVE };
    case 'motivation':
      return { positive: AXIS_RESULT_LABELS.GROWTH, negative: AXIS_RESULT_LABELS.STABLE };
    default:
      return { positive: '正の傾向', negative: '負の傾向' };
  }
}

// パーセンテージからプログレスバーの値計算
export function calculateProgressValue(percentage: number): number {
  // 50%を中心として、0-100%の範囲で表示
  return Math.max(0, Math.min(100, percentage));
}

// バランス型判定のテキスト取得
export function getBalanceTypeText(isBalance: boolean): string {
  return isBalance ? 'バランス型' : '';
}

// 特性の強度レベル取得
export function getStrengthLevel(percentage: number): { level: string; color: string } {
  if (percentage >= 75) {
    return { level: '強い傾向', color: 'text-blue-600' };
  } else if (percentage >= 60) {
    return { level: '中程度の傾向', color: 'text-blue-500' };
  } else if (percentage >= 40) {
    return { level: 'バランス型', color: 'text-gray-600' };
  } else if (percentage >= 25) {
    return { level: '中程度の傾向', color: 'text-purple-500' };
  } else {
    return { level: '強い傾向', color: 'text-purple-600' };
  }
}

// 軸スコアから表示用データ作成
export function formatAxisScore(
  axisName: string,
  axisScore: AxisScore & { result: string }
) {
  const labels = getAxisPairLabels(axisName);
  const percentage = axisScore.percentage;
  const isPositiveDominant = percentage >= 50;
  
  return {
    axisLabel: AXIS_LABELS[axisName as keyof typeof AXIS_LABELS],
    dominantLabel: isPositiveDominant ? labels.positive : labels.negative,
    dominantPercentage: isPositiveDominant ? percentage : 100 - percentage,
    weakerLabel: isPositiveDominant ? labels.negative : labels.positive,
    weakerPercentage: isPositiveDominant ? 100 - percentage : percentage,
    isBalance: axisScore.isBalance,
    progressValue: calculateProgressValue(percentage),
    strengthLevel: getStrengthLevel(isPositiveDominant ? percentage : 100 - percentage)
  };
}

// DetailedDiagnosisResultから表示用データ作成
export function formatDetailedResult(result: DetailedDiagnosisResult) {
  const axisData = [
    { name: 'energy', ...formatAxisScore('energy', result.axisScores.energy) },
    { name: 'perception', ...formatAxisScore('perception', result.axisScores.perception) },
    { name: 'judgment', ...formatAxisScore('judgment', result.axisScores.judgment) },
    { name: 'lifestyle', ...formatAxisScore('lifestyle', result.axisScores.lifestyle) },
    { name: 'environment', ...formatAxisScore('environment', result.axisScores.environment) },
    { name: 'motivation', ...formatAxisScore('motivation', result.axisScores.motivation) }
  ];

  return {
    titleName: TITLE_LABELS[result.title],
    fullTypeName: `${TITLE_LABELS[result.title]}${result.baseArchetype}`, // ここは後でアーキタイプ名に変換
    confidence: result.confidence,
    balanceTypes: result.balanceTypes,
    axisData
  };
}

// Type64から基本的な表示データ作成（フォールバック用）
export function formatBasicType64(type64: string) {
  const [baseType, variant] = type64.split('-');
  const environmentTrait = variant[0] === 'A' ? '協調型' : '競争型';
  const motivationTrait = variant[1] === 'S' ? '安定志向' : '成長志向';
  
  return {
    baseType,
    environmentTrait,
    motivationTrait,
    isBasicFormat: true
  };
}
// 🌟 Enhanced Zodiac Calculator
// 精密な星座判定システム（既存システム強化版）

import { format, isWithinInterval } from 'date-fns';
import { ZodiacSign, ZodiacElement } from '../../types';

// 星座定義（正確な日付境界）
export interface ZodiacInfo {
  sign: ZodiacSign;
  element: ZodiacElement;
  name: string;
  nameJa: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  traits: string[];
  strengths: string[];
  challenges: string[];
}

// 12星座データ（正確な境界日付）
export const ZODIAC_DATA: ZodiacInfo[] = [
  {
    sign: 'aries',
    element: 'fire',
    name: 'Aries',
    nameJa: '牡羊座',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
    traits: ['積極的', 'リーダーシップ', '冒険的', '直接的'],
    strengths: ['行動力', '決断力', '勇気', '開拓精神'],
    challenges: ['せっかち', '短気', '自己中心的', '計画性不足']
  },
  {
    sign: 'taurus',
    element: 'earth',
    name: 'Taurus',
    nameJa: '牡牛座',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
    traits: ['安定志向', '忍耐強い', '現実的', '感覚的'],
    strengths: ['持続力', '信頼性', '美的センス', '堅実性'],
    challenges: ['頑固', '変化への抵抗', '保守的', '物質主義']
  },
  {
    sign: 'gemini',
    element: 'air',
    name: 'Gemini',
    nameJa: '双子座',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 21 },
    traits: ['多様性', 'コミュニケーション', '知的好奇心', '適応性'],
    strengths: ['情報収集力', '社交性', '柔軟性', '機転'],
    challenges: ['移り気', '表面的', '一貫性不足', '神経質']
  },
  {
    sign: 'cancer',
    element: 'water',
    name: 'Cancer',
    nameJa: '蟹座',
    startDate: { month: 6, day: 22 },
    endDate: { month: 7, day: 22 },
    traits: ['感情豊か', '保護的', '直感的', '家族重視'],
    strengths: ['共感力', '献身性', '記憶力', '想像力'],
    challenges: ['感情的すぎる', '過保護', '内向的', '傷つきやすい']
  },
  {
    sign: 'leo',
    element: 'fire',
    name: 'Leo',
    nameJa: '獅子座',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    traits: ['自信満々', 'クリエイティブ', '華やか', '寛大'],
    strengths: ['リーダーシップ', '創造力', '魅力', '熱意'],
    challenges: ['自己顕示欲', 'プライド', '支配的', '注目欲']
  },
  {
    sign: 'virgo',
    element: 'earth',
    name: 'Virgo',
    nameJa: '乙女座',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    traits: ['完璧主義', '分析的', 'サービス精神', '実用的'],
    strengths: ['注意深さ', '効率性', '責任感', '技術力'],
    challenges: ['神経質', '批判的', '心配性', '完璧主義すぎる']
  },
  {
    sign: 'libra',
    element: 'air',
    name: 'Libra',
    nameJa: '天秤座',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 23 },
    traits: ['バランス重視', '美的感覚', '協調性', '外交的'],
    strengths: ['調和力', '公平性', '美意識', '社交性'],
    challenges: ['優柔不断', '依存的', '対立回避', '表面的']
  },
  {
    sign: 'scorpio',
    element: 'water',
    name: 'Scorpio',
    nameJa: '蠍座',
    startDate: { month: 10, day: 24 },
    endDate: { month: 11, day: 22 },
    traits: ['深い感情', '神秘的', '集中力', '変容力'],
    strengths: ['洞察力', '集中力', '回復力', '忠誠心'],
    challenges: ['嫉妬深い', '執念深い', '秘密主義', '復讐心']
  },
  {
    sign: 'sagittarius',
    element: 'fire',
    name: 'Sagittarius',
    nameJa: '射手座',
    startDate: { month: 11, day: 23 },
    endDate: { month: 12, day: 21 },
    traits: ['冒険心', '楽観的', '自由', '哲学的'],
    strengths: ['探求心', '楽観性', '独立性', '知識欲'],
    challenges: ['無責任', '軽率', '束縛嫌い', '現実逃避']
  },
  {
    sign: 'capricorn',
    element: 'earth',
    name: 'Capricorn',
    nameJa: '山羊座',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
    traits: ['野心的', '責任感', '伝統重視', '現実的'],
    strengths: ['計画性', '忍耐力', '責任感', '実行力'],
    challenges: ['悲観的', '堅苦しい', '野心的すぎる', '感情抑制']
  },
  {
    sign: 'aquarius',
    element: 'air',
    name: 'Aquarius',
    nameJa: '水瓶座',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
    traits: ['独立心', '革新的', '人道的', '未来志向'],
    strengths: ['独創性', '人道性', '客観性', '理想主義'],
    challenges: ['感情的距離', '変わり者', '頑固', '非現実的']
  },
  {
    sign: 'pisces',
    element: 'water',
    name: 'Pisces',
    nameJa: '魚座',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    traits: ['直感的', '想像力豊か', '共感的', 'スピリチュアル'],
    strengths: ['直感力', '芸術性', '共感力', '適応性'],
    challenges: ['現実逃避', '優柔不断', '依存的', '被害者意識']
  }
];

// エレメント特性
export const ELEMENT_TRAITS = {
  fire: {
    name: '火',
    traits: ['情熱的', 'エネルギッシュ', 'リーダーシップ', '直感的'],
    energy: 'Yang',
    nature: 'Active'
  },
  earth: {
    name: '土',
    traits: ['現実的', '安定志向', '実用的', '慎重'],
    energy: 'Yin',
    nature: 'Stable'
  },
  air: {
    name: '風',
    traits: ['知的', 'コミュニケーション', '社交的', '理論的'],
    energy: 'Yang',
    nature: 'Flexible'
  },
  water: {
    name: '水',
    traits: ['感情的', '直感的', '共感的', '流動的'],
    energy: 'Yin',
    nature: 'Adaptive'
  }
};

/**
 * 🌟 生年月日から星座を精密計算
 */
export function calculateZodiacSign(birthDate: Date): {
  zodiac: ZodiacInfo;
  confidence: number;
} {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  for (const zodiacInfo of ZODIAC_DATA) {
    const { startDate, endDate } = zodiacInfo;
    
    // 年をまたぐ星座（山羊座）の特別処理
    if (zodiacInfo.sign === 'capricorn') {
      if ((month === 12 && day >= startDate.day) || 
          (month === 1 && day <= endDate.day)) {
        return {
          zodiac: zodiacInfo,
          confidence: calculateConfidence(month, day, zodiacInfo)
        };
      }
    } else {
      // 通常の星座判定
      if ((month === startDate.month && day >= startDate.day) ||
          (month === endDate.month && day <= endDate.day) ||
          (month > startDate.month && month < endDate.month)) {
        return {
          zodiac: zodiacInfo,
          confidence: calculateConfidence(month, day, zodiacInfo)
        };
      }
    }
  }
  
  // フォールバック（通常ここには到達しない）
  return {
    zodiac: ZODIAC_DATA.find(z => z.sign === 'gemini')!,
    confidence: 50
  };
}

/**
 * 星座判定の信頼度計算（境界日付での精度）
 */
function calculateConfidence(month: number, day: number, zodiac: ZodiacInfo): number {
  const { startDate, endDate } = zodiac;
  
  // 境界日付から離れるほど信頼度が高い
  let distanceFromStart = 0;
  let distanceFromEnd = 0;
  
  if (zodiac.sign === 'capricorn') {
    // 山羊座の特別計算
    if (month === 12) {
      distanceFromStart = day - startDate.day;
    } else if (month === 1) {
      distanceFromEnd = endDate.day - day;
    }
  } else {
    if (month === startDate.month) {
      distanceFromStart = day - startDate.day;
    } else if (month === endDate.month) {
      distanceFromEnd = endDate.day - day;
    } else {
      // 中間月の場合は最高信頼度
      return 100;
    }
  }
  
  const minDistance = Math.min(distanceFromStart, distanceFromEnd);
  return Math.max(70, Math.min(100, 70 + minDistance * 5));
}

/**
 * 🌟 星座から詳細情報を取得
 */
export function getZodiacDetails(sign: ZodiacSign): ZodiacInfo {
  const details = ZODIAC_DATA.find(z => z.sign === sign);
  if (!details) {
    console.warn(`⚠️ 星座${sign}の情報が見つかりません。デフォルト値を使用します。`);
    return ZODIAC_DATA[0]; // 牡羊座をデフォルトとして使用
  }
  return details;
}

/**
 * 🌟 エレメント詳細情報を取得
 */
export function getElementDetails(element: ZodiacElement) {
  return ELEMENT_TRAITS[element];
}

/**
 * 🌟 星座相性判定
 */
export function calculateZodiacCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): {
  score: number;
  reason: string;
  elementHarmony: string;
} {
  const zodiac1 = getZodiacDetails(sign1);
  const zodiac2 = getZodiacDetails(sign2);
  
  // エレメント相性マトリックス
  const elementCompatibility: Record<ZodiacElement, Record<ZodiacElement, number>> = {
    fire: { fire: 85, earth: 60, air: 90, water: 45 },
    earth: { fire: 60, earth: 80, air: 55, water: 85 },
    air: { fire: 90, earth: 55, air: 85, water: 60 },
    water: { fire: 45, earth: 85, air: 60, water: 90 }
  };
  
  const baseScore = elementCompatibility[zodiac1.element][zodiac2.element];
  
  // 同じ星座の場合は特別処理
  if (sign1 === sign2) {
    return {
      score: 95,
      reason: '同じ星座同士の深い理解',
      elementHarmony: '完全な調和'
    };
  }
  
  const elementHarmonyMap = {
    fire: {
      fire: 'エネルギーの共鳴',
      earth: '安定化の効果',
      air: '情熱の拡散',
      water: '蒸気化の緊張'
    },
    earth: {
      fire: '成長の促進',
      earth: '安定の倍増',
      air: '軽やかな刺激',
      water: '豊穣な結合'
    },
    air: {
      fire: '炎の拡大',
      earth: '新風の導入',
      air: '知的な共鳴',
      water: '霧の創造'
    },
    water: {
      fire: '対立する力',
      earth: '肥沃な組み合わせ',
      air: '雲の形成',
      water: '深い流れ'
    }
  };
  
  return {
    score: baseScore,
    reason: generateCompatibilityReason(baseScore),
    elementHarmony: elementHarmonyMap[zodiac1.element][zodiac2.element]
  };
}

function generateCompatibilityReason(score: number): string {
  if (score >= 85) return '素晴らしい相性です';
  if (score >= 70) return '良い相性です';
  if (score >= 55) return '普通の相性です';
  return 'お互いの理解に努力が必要です';
}

/**
 * 🌟 今日の星座運勢（日付ベース）
 */
export function getDailyZodiacEnergy(sign: ZodiacSign, date: Date = new Date()): {
  energy: number;
  advice: string;
  luckyColor: string;
  challenges: string;
} {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const zodiac = getZodiacDetails(sign);
  
  // 星座の基本エネルギー + 日付による変動
  const baseEnergy = 5;
  const dailyVariation = Math.sin(dayOfYear * Math.PI / 182.5) * 2;
  const energy = Math.max(1, Math.min(10, Math.round(baseEnergy + dailyVariation)));
  
  const adviceList = zodiac.strengths.map(strength => 
    `${strength}を活かして`
  );
  
  const challengesList = zodiac.challenges.map(challenge =>
    `${challenge}に注意`
  );
  
  const colors = ['青', '赤', '緑', '金', '紫', '白', 'オレンジ'];
  const luckyColor = colors[dayOfYear % colors.length];
  
  return {
    energy,
    advice: adviceList[dayOfYear % adviceList.length],
    luckyColor,
    challenges: challengesList[dayOfYear % challengesList.length]
  };
}

/**
 * 🌟 TypeMate64診断との統合用データ
 */
export function getZodiacArchetypeCorrelation(sign: ZodiacSign) {
  // 星座とTypeMatearchetypeの相関関係
  const correlations: Record<ZodiacSign, string[]> = {
    aries: ['HER', 'PIO', 'EXE'], // ヒーロー、パイオニア、エグゼクティブ
    taurus: ['GUA', 'DEF', 'ARS'], // ガーディアン、ディフェンダー、アーティスト
    gemini: ['ARC', 'SAG', 'PER'], // アーキテクト、セージ、パフォーマー
    cancer: ['HER', 'GUA', 'ARS'], // ヒーロー、ガーディアン、アーティスト
    leo: ['BAR', 'PER', 'HER'], // バード、パフォーマー、ヒーロー
    virgo: ['ARC', 'ALC', 'DEF'], // アーキテクト、アルケミスト、ディフェンダー
    libra: ['SAG', 'DRM', 'BAR'], // セージ、ドリーマー、バード
    scorpio: ['INV', 'ALC', 'HER'], // イノベーター、アルケミスト、ヒーロー
    sagittarius: ['PIO', 'DRM', 'PER'], // パイオニア、ドリーマー、パフォーマー
    capricorn: ['SOV', 'EXE', 'GUA'], // ソブリン、エグゼクティブ、ガーディアン
    aquarius: ['INV', 'SOV', 'ARC'], // イノベーター、ソブリン、アーキテクト
    pisces: ['DRM', 'ARS', 'ALC'] // ドリーマー、アーティスト、アルケミスト
  };
  
  return correlations[sign] || [];
}
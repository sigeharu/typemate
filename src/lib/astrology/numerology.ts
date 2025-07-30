// 🔢 Numerology Calculator
// 数秘術ライフパスナンバー計算システム

import { format } from 'date-fns';

// ライフパスナンバーの詳細情報
export interface LifePathInfo {
  number: number;
  name: string;
  description: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  soulPurpose: string;
  compatibility: number[];
  careerPaths: string[];
  relationships: string;
  spiritualTheme: string;
}

// マスターナンバー（特別な意味を持つ数字）
const MASTER_NUMBERS = [11, 22, 33];

// ライフパスナンバー詳細データ
export const LIFE_PATH_DATA: Record<number, LifePathInfo> = {
  1: {
    number: 1,
    name: 'リーダー',
    description: '独立心が強く、新しい道を切り開く開拓者',
    traits: ['独立', 'リーダーシップ', '創造性', '決断力'],
    strengths: ['開拓精神', '自立性', '創造力', '勇気'],
    challenges: ['自己中心的', '支配的', 'せっかち', '孤独感'],
    soulPurpose: '他者を導き、新しい可能性を創造すること',
    compatibility: [3, 5, 6],
    careerPaths: ['起業家', 'リーダー', 'アーティスト', 'イノベーター'],
    relationships: '独立を尊重し合える関係を好む',
    spiritualTheme: '個性と自立'
  },
  2: {
    number: 2,
    name: 'サポーター',
    description: '協調性があり、平和と調和を重視する仲介者',
    traits: ['協調性', '感受性', '外交的', '親切'],
    strengths: ['協力性', '直感力', '平和主義', '思いやり'],
    challenges: ['優柔不断', '依存的', '過敏', '自信不足'],
    soulPurpose: '人々の架け橋となり、調和をもたらすこと',
    compatibility: [1, 6, 8],
    careerPaths: ['カウンセラー', '外交官', '教師', 'ヒーラー'],
    relationships: 'パートナーシップを深く大切にする',
    spiritualTheme: '協力と調和'
  },
  3: {
    number: 3,
    name: 'クリエイター',
    description: '表現力豊かで、人を楽しませることが得意な芸術家',
    traits: ['創造性', '表現力', '楽観的', '社交的'],
    strengths: ['芸術性', 'コミュニケーション', '想像力', '魅力'],
    challenges: ['散漫', '表面的', '気分屋', '集中力不足'],
    soulPurpose: '美と喜びを世界にもたらすこと',
    compatibility: [1, 5, 9],
    careerPaths: ['アーティスト', 'エンターテイナー', 'ライター', 'デザイナー'],
    relationships: '楽しさと創造性を共有できる関係',
    spiritualTheme: '創造と表現'
  },
  4: {
    number: 4,
    name: 'ビルダー',
    description: '実用的で組織的、確固とした基盤を築く建設者',
    traits: ['実用性', '組織力', '責任感', '忍耐力'],
    strengths: ['計画性', '信頼性', '持続力', '実行力'],
    challenges: ['頑固', '融通が利かない', '完璧主義', '保守的'],
    soulPurpose: '安定した基盤を作り、秩序をもたらすこと',
    compatibility: [2, 6, 8],
    careerPaths: ['エンジニア', '会計士', '建築家', 'マネージャー'],
    relationships: '安定と信頼を基盤とした関係',
    spiritualTheme: '安定と基盤'
  },
  5: {
    number: 5,
    name: 'エクスプローラー',
    description: '自由を愛し、多様な経験を求める冒険者',
    traits: ['自由', '冒険心', '好奇心', '多様性'],
    strengths: ['適応性', '多才', '進歩性', '魅力'],
    challenges: ['落ち着きがない', '責任回避', '浅く広く', '衝動的'],
    soulPurpose: '新しい経験を通じて自由の価値を伝えること',
    compatibility: [1, 3, 7],
    careerPaths: ['旅行業', 'ジャーナリスト', 'セールス', 'コンサルタント'],
    relationships: '自由度の高い関係を好む',
    spiritualTheme: '自由と探求'
  },
  6: {
    number: 6,
    name: 'ナートゥラー',
    description: '愛情深く、責任感があり、他者をケアする育成者',
    traits: ['愛情', '責任感', 'ケア', '家族重視'],
    strengths: ['思いやり', '責任感', '美的センス', '治癒力'],
    challenges: ['過保護', '心配性', '犠牲的', '批判的'],
    soulPurpose: '愛とケアを通じて人々を癒すこと',
    compatibility: [1, 2, 4],
    careerPaths: ['看護師', '教師', 'ソーシャルワーカー', 'セラピスト'],
    relationships: '深い愛情と献身的な関係',
    spiritualTheme: '愛と奉仕'
  },
  7: {
    number: 7,
    name: 'シーカー',
    description: '内省的で精神的、真理を探求する神秘家',
    traits: ['内省', '分析', '直感', '神秘性'],
    strengths: ['洞察力', '直感', '精神性', '独立性'],
    challenges: ['孤立', '批判的', '完璧主義', '現実逃避'],
    soulPurpose: '内なる知恵を深め、真理を探求すること',
    compatibility: [5, 9],
    careerPaths: ['研究者', '哲学者', 'スピリチュアルティーチャー', 'アナリスト'],
    relationships: '精神的なつながりを重視',
    spiritualTheme: '知恵と真理'
  },
  8: {
    number: 8,
    name: 'アチーバー',
    description: '野心的で物質的成功を追求する実現者',
    traits: ['野心', '実現力', '組織力', '権威'],
    strengths: ['実行力', 'リーダーシップ', '組織力', '決断力'],
    challenges: ['物質主義', '支配的', 'ワーカホリック', '感情軽視'],
    soulPurpose: '物質世界で成功を収め、豊かさを分かち合うこと',
    compatibility: [2, 4, 6],
    careerPaths: ['経営者', '投資家', '政治家', 'エグゼクティブ'],
    relationships: '成功と成長を共有できる関係',
    spiritualTheme: '成功と豊かさ'
  },
  9: {
    number: 9,
    name: 'ヒューマニタリアン',
    description: '人道的で理想主義、世界をより良くしようとする奉仕者',
    traits: ['人道主義', '理想', 'スピリチュアル', '寛大'],
    strengths: ['慈悲深さ', '理想主義', '芸術性', 'カリスマ'],
    challenges: ['理想と現実のギャップ', '感情的', '完璧主義', '犠牲的'],
    soulPurpose: '人類全体の幸福と進歩に貢献すること',
    compatibility: [3, 7],
    careerPaths: ['慈善活動家', 'アーティスト', 'ヒーラー', '教師'],
    relationships: '精神的な成長を共にする関係',
    spiritualTheme: '奉仕と完成'
  },
  11: {
    number: 11,
    name: 'インスピレーター（マスターナンバー）',
    description: '高い直感力とカリスマを持つ精神的指導者',
    traits: ['直感', 'カリスマ', 'インスピレーション', '精神性'],
    strengths: ['直感力', 'インスピレーション', 'カリスマ', '精神的洞察'],
    challenges: ['神経質', '理想主義', '現実逃避', '不安定'],
    soulPurpose: '他者にインスピレーションを与え、精神的覚醒を促すこと',
    compatibility: [2, 6, 9],
    careerPaths: ['スピリチュアルティーチャー', 'アーティスト', 'ヒーラー', 'カウンセラー'],
    relationships: '深い精神的つながりを求める',
    spiritualTheme: '直感と啓示'
  },
  22: {
    number: 22,
    name: 'マスタービルダー（マスターナンバー）',
    description: '実用的な理想主義者で、大きな夢を現実化する建築家',
    traits: ['実現力', '理想', '組織力', 'ビジョン'],
    strengths: ['実現力', 'ビジョン', '組織力', 'カリスマ'],
    challenges: ['プレッシャー', '完璧主義', '責任過多', '燃え尽き'],
    soulPurpose: '大きなビジョンを現実世界で実現すること',
    compatibility: [4, 6, 8],
    careerPaths: ['建築家', 'エンジニア', '社会起業家', 'ビジョナリー'],
    relationships: '共通のビジョンを持つパートナー',
    spiritualTheme: '実現とビジョン'
  },
  33: {
    number: 33,
    name: 'マスターティーチャー（マスターナンバー）',
    description: '無条件の愛と癒しの力を持つ教師',
    traits: ['愛', '癒し', '教育', 'スピリチュアル'],
    strengths: ['愛情', '癒し力', '教育力', 'スピリチュアル'],
    challenges: ['犠牲的', '感情的負担', '理想主義', '完璧主義'],
    soulPurpose: '無条件の愛を通じて人類を教育し癒すこと',
    compatibility: [6, 9, 11],
    careerPaths: ['教師', 'ヒーラー', 'セラピスト', 'スピリチュアルガイド'],
    relationships: '深い愛と理解に基づく関係',
    spiritualTheme: '愛と教育'
  }
};

/**
 * 🔢 ピタゴラス式ライフパスナンバー計算
 */
export function calculateLifePathNumber(birthDate: Date): {
  lifePathNumber: number;
  calculation: string;
  isMasterNumber: boolean;
  reducedNumber?: number;
} {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // 年、月、日をそれぞれ単数に還元
  const reducedYear = reduceToSingleDigit(year);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedDay = reduceToSingleDigit(day);
  
  // 合計を計算
  const total = reducedYear + reducedMonth + reducedDay;
  
  // マスターナンバーチェック
  if (MASTER_NUMBERS.includes(total)) {
    return {
      lifePathNumber: total,
      calculation: `${year}(${reducedYear}) + ${month}(${reducedMonth}) + ${day}(${reducedDay}) = ${total}`,
      isMasterNumber: true
    };
  }
  
  // 通常の還元
  const finalNumber = reduceToSingleDigit(total);
  
  return {
    lifePathNumber: finalNumber,
    calculation: `${year}(${reducedYear}) + ${month}(${reducedMonth}) + ${day}(${reducedDay}) = ${total} → ${finalNumber}`,
    isMasterNumber: false,
    reducedNumber: total !== finalNumber ? total : undefined
  };
}

/**
 * 🔢 カルデア式ライフパスナンバー計算（代替計算法）
 */
export function calculateChaldeanLifePath(birthDate: Date): {
  lifePathNumber: number;
  calculation: string;
  method: 'chaldean';
} {
  const dateString = format(birthDate, 'ddMMyyyy');
  let sum = 0;
  let calculation = '';
  
  // カルデア数秘術の数値対応（1-8のみ使用、9は除外）
  const chaldeanValues: Record<string, number> = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
  };
  
  for (let i = 0; i < dateString.length; i++) {
    const digit = parseInt(dateString[i]);
    sum += digit;
    calculation += digit + (i < dateString.length - 1 ? ' + ' : '');
  }
  
  const finalNumber = reduceToSingleDigitChaldean(sum);
  
  return {
    lifePathNumber: finalNumber,
    calculation: `${calculation} = ${sum} → ${finalNumber}`,
    method: 'chaldean'
  };
}

/**
 * 数字を単数に還元（ピタゴラス式）
 */
function reduceToSingleDigit(number: number): number {
  while (number > 9 && !MASTER_NUMBERS.includes(number)) {
    number = number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return number;
}

/**
 * 数字を単数に還元（カルデア式 - 9を使わない）
 */
function reduceToSingleDigitChaldean(number: number): number {
  while (number > 9) {
    number = number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    if (number === 9) number = 9; // カルデアでは9も使用
  }
  return number === 0 ? 9 : number; // 0は9に変換
}

/**
 * 🔢 ライフパスナンバーの詳細情報を取得
 */
export function getLifePathInfo(number: number): LifePathInfo {
  const info = LIFE_PATH_DATA[number];
  if (!info) {
    console.warn(`⚠️ ライフパス${number}の情報が見つかりません。デフォルト値を使用します。`);
    return LIFE_PATH_DATA[1];
  }
  return info;
}

/**
 * 🔢 数秘術的相性計算
 */
export function calculateNumerologyCompatibility(number1: number, number2: number): {
  score: number;
  harmony: string;
  challenges: string;
  advice: string;
} {
  const info1 = getLifePathInfo(number1);
  const info2 = getLifePathInfo(number2);
  
  // 基本相性スコア
  let baseScore = 50;
  
  // 相性の良い組み合わせ
  if (info1.compatibility.includes(number2)) {
    baseScore += 30;
  }
  
  // 同じ数字の場合
  if (number1 === number2) {
    baseScore += 20;
  }
  
  // マスターナンバー同士
  if (MASTER_NUMBERS.includes(number1) && MASTER_NUMBERS.includes(number2)) {
    baseScore += 15;
  }
  
  // エレメント的な組み合わせ調整
  const elementScore = calculateElementalScore(number1, number2);
  const finalScore = Math.min(100, Math.max(0, baseScore + elementScore));
  
  return {
    score: finalScore,
    harmony: generateHarmonyDescription(finalScore, number1, number2),
    challenges: generateChallengeDescription(number1, number2),
    advice: generateAdviceDescription(number1, number2)
  };
}

function calculateElementalScore(num1: number, num2: number): number {
  // 奇数（男性エネルギー）と偶数（女性エネルギー）のバランス
  const isOdd1 = num1 % 2 === 1;
  const isOdd2 = num2 % 2 === 1;
  
  if (isOdd1 !== isOdd2) {
    return 10; // 補完関係
  } else {
    return 5; // 同質関係
  }
}

function generateHarmonyDescription(score: number, num1: number, num2: number): string {
  if (score >= 80) return '深い理解と共鳴';
  if (score >= 65) return '良好な関係性';
  if (score >= 50) return '適度な刺激と成長';
  return '学びと成長の機会';
}

function generateChallengeDescription(num1: number, num2: number): string {
  const challenges1 = getLifePathInfo(num1).challenges;
  const challenges2 = getLifePathInfo(num2).challenges;
  
  // 共通の課題を見つける
  const commonChallenges = challenges1.filter(c => challenges2.includes(c));
  
  if (commonChallenges.length > 0) {
    return `共通の課題: ${commonChallenges[0]}`;
  }
  
  return '異なる価値観の調整';
}

function generateAdviceDescription(num1: number, num2: number): string {
  const info1 = getLifePathInfo(num1);
  const info2 = getLifePathInfo(num2);
  
  return `${info1.name}の${info1.strengths[0]}と${info2.name}の${info2.strengths[0]}を活かし合う`;
}

/**
 * 🔢 今年の個人年数計算
 */
export function calculatePersonalYear(birthDate: Date, currentYear: number = new Date().getFullYear()): {
  personalYear: number;
  theme: string;
  opportunities: string[];
  focus: string;
} {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  const reducedMonth = reduceToSingleDigit(month);
  const reducedDay = reduceToSingleDigit(day);
  const reducedYear = reduceToSingleDigit(currentYear);
  
  const personalYear = reduceToSingleDigit(reducedMonth + reducedDay + reducedYear);
  
  const yearThemes: Record<number, { theme: string; opportunities: string[]; focus: string }> = {
    1: {
      theme: '新しい始まり',
      opportunities: ['新しいプロジェクト', '独立', '自己発見'],
      focus: 'イニシアチブを取る'
    },
    2: {
      theme: '協力と忍耐',
      opportunities: ['パートナーシップ', '協力関係', '感情の成長'],
      focus: '他者との調和'
    },
    3: {
      theme: '創造と表現',
      opportunities: ['芸術活動', 'コミュニケーション', '社交性'],
      focus: '創造性の発揮'
    },
    4: {
      theme: '基盤作りと努力',
      opportunities: ['スキル習得', '組織化', '安定化'],
      focus: '実践的な取り組み'
    },
    5: {
      theme: '変化と自由',
      opportunities: ['旅行', '新しい経験', '自由な選択'],
      focus: '柔軟性と適応'
    },
    6: {
      theme: '責任と愛',
      opportunities: ['家族関係', 'ケア', '責任の受け入れ'],
      focus: '愛と奉仕'
    },
    7: {
      theme: '内省と精神性',
      opportunities: ['学習', '瞑想', '精神的成長'],
      focus: '内なる知恵の発見'
    },
    8: {
      theme: '成功と達成',
      opportunities: ['事業拡大', '財政管理', '権威の確立'],
      focus: '物質的成功'
    },
    9: {
      theme: '完成と手放し',
      opportunities: ['奉仕', '人道活動', '精神的完成'],
      focus: '与えることと手放し'
    }
  };
  
  return {
    personalYear,
    ...yearThemes[personalYear]
  };
}

/**
 * 🔢 TypeMate64診断との統合分析
 */
export function getNumerologyArchetypeCorrelation(lifePathNumber: number): {
  correlatedArchetypes: string[];
  resonanceLevel: number;
  spiritualAlignment: string;
} {
  const correlations: Record<number, { archetypes: string[]; resonance: number; alignment: string }> = {
    1: { archetypes: ['HER', 'PIO', 'SOV'], resonance: 85, alignment: 'Individual Leadership' },
    2: { archetypes: ['SAG', 'DEF', 'GUA'], resonance: 80, alignment: 'Supportive Harmony' },
    3: { archetypes: ['ARS', 'PER', 'BAR'], resonance: 90, alignment: 'Creative Expression' },
    4: { archetypes: ['ARC', 'GUA', 'DEF'], resonance: 75, alignment: 'Structured Foundation' },
    5: { archetypes: ['PIO', 'PER', 'INV'], resonance: 85, alignment: 'Dynamic Freedom' },
    6: { archetypes: ['HER', 'GUA', 'SAG'], resonance: 80, alignment: 'Nurturing Service' },
    7: { archetypes: ['ALC', 'DRM', 'ARC'], resonance: 85, alignment: 'Mystical Wisdom' },
    8: { archetypes: ['SOV', 'EXE', 'PRO'], resonance: 90, alignment: 'Material Mastery' },
    9: { archetypes: ['DRM', 'ALC', 'HER'], resonance: 85, alignment: 'Universal Service' },
    11: { archetypes: ['DRM', 'ALC', 'SAG'], resonance: 95, alignment: 'Spiritual Inspiration' },
    22: { archetypes: ['ARC', 'SOV', 'INV'], resonance: 95, alignment: 'Visionary Building' },
    33: { archetypes: ['SAG', 'HER', 'ALC'], resonance: 95, alignment: 'Master Teaching' }
  };
  
  const correlation = correlations[lifePathNumber] || correlations[1];
  
  return {
    correlatedArchetypes: correlation.archetypes,
    resonanceLevel: correlation.resonance,
    spiritualAlignment: correlation.alignment
  };
}
// ⭐ Integrated Astrology Service
// TypeMate占星術統合サービス - 既存システムとの完全統合

import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { 
  calculateZodiacSign, 
  getZodiacDetails, 
  calculateZodiacCompatibility,
  getDailyZodiacEnergy,
  getZodiacArchetypeCorrelation
} from './zodiac-calculator';
import { 
  calculateLifePathNumber, 
  getLifePathInfo, 
  calculateNumerologyCompatibility,
  calculatePersonalYear,
  getNumerologyArchetypeCorrelation
} from './numerology';
import { 
  getCurrentMoonPhase, 
  getMoonZodiacInfluence,
  getMoon28DayCycle
} from './moon-phase';
import { BaseArchetype, ZodiacSign, ZodiacElement, ExtendedUserProfile } from '../../types';

// 統合占星術プロファイル
export interface IntegratedAstrologyProfile {
  // 基本情報
  birthDate: Date;
  
  // 西洋占星術
  zodiac: {
    sign: ZodiacSign;
    element: ZodiacElement;
    details: any;
    confidence: number;
  };
  
  // 数秘術
  numerology: {
    lifePathNumber: number;
    info: any;
    calculation: string;
    isMasterNumber: boolean;
  };
  
  // 月の影響
  currentMoon: {
    phase: any;
    energy: number;
    influence: any;
    zodiacCombination: any;
  };
  
  // TypeMate統合
  typeMateIntegration: {
    zodiacArchetypes: string[];
    numerologyArchetypes: string[];
    resonanceScore: number;
    spiritualAlignment: string;
  };
  
  // 日別運勢
  dailyGuidance: {
    date: Date;
    overallEnergy: number;
    primaryMessage: string;
    zodiacAdvice: string;
    numerologyTheme: string;
    moonInfluence: string;
    actionRecommendations: string[];
    luckyElements: {
      color: string;
      number: number;
      timeOfDay: string;
    };
  };
}

// 相性分析結果
export interface CompatibilityAnalysis {
  overall: {
    score: number;
    description: string;
    harmony: string;
  };
  zodiacCompatibility: {
    score: number;
    reason: string;
    elementHarmony: string;
  };
  numerologyCompatibility: {
    score: number;
    harmony: string;
    challenges: string;
    advice: string;
  };
  typeMateArchetypes: {
    resonance: number;
    sharedArchetypes: string[];
    complementaryPairs: string[];
  };
  recommendations: {
    strengthAreas: string[];
    growthAreas: string[];
    communicationStyle: string;
    conflictResolution: string;
  };
}

/**
 * ⭐ 統合占星術プロファイルを生成
 */
export async function generateIntegratedProfile(
  birthDate: Date,
  userArchetype?: BaseArchetype
): Promise<IntegratedAstrologyProfile> {
  console.log('🔮 generateIntegratedProfile started:', { birthDate, userArchetype });
  
  try {
    // 西洋占星術計算
    const zodiacResult = calculateZodiacSign(birthDate);
    console.log('🌟 zodiacResult:', zodiacResult);
    
    const zodiacDetails = getZodiacDetails(zodiacResult.zodiac.sign);
    console.log('🌟 zodiacDetails:', zodiacDetails);
    
    const dailyZodiacEnergy = getDailyZodiacEnergy(zodiacResult.zodiac.sign);
    console.log('🌟 dailyZodiacEnergy:', dailyZodiacEnergy);
  
    // 数秘術計算
    const numerologyResult = calculateLifePathNumber(birthDate);
    console.log('🔢 numerologyResult:', numerologyResult);
    
    const numerologyInfo = getLifePathInfo(numerologyResult.lifePathNumber);
    console.log('🔢 numerologyInfo:', numerologyInfo);
    
    const personalYear = calculatePersonalYear(birthDate);
    console.log('🔢 personalYear:', personalYear);
  
  // 月の位相計算
  const currentMoon = getCurrentMoonPhase();
  const moonZodiacInfluence = getMoonZodiacInfluence(
    currentMoon.phase, 
    zodiacDetails?.nameJa || '星座'
  );
  
  // TypeMate統合分析
  const zodiacArchetypes = getZodiacArchetypeCorrelation(zodiacResult.zodiac.sign);
  const numerologyCorrelation = getNumerologyArchetypeCorrelation(numerologyResult.lifePathNumber);
  
  // 統合共鳴スコア計算
  const resonanceScore = calculateIntegratedResonance(
    zodiacArchetypes,
    numerologyCorrelation.correlatedArchetypes,
    userArchetype
  );
  
  // 日別ガイダンス生成
  const dailyGuidance = generateDailyGuidance(
    zodiacResult.zodiac,
    numerologyResult,
    currentMoon,
    personalYear
  );
  
    return {
      birthDate,
      zodiac: {
        sign: zodiacResult.zodiac.sign,
        element: zodiacResult.zodiac.element,
        details: zodiacDetails || { nameJa: '星座', name: 'Zodiac' },
        confidence: zodiacResult.confidence
      },
      numerology: {
        lifePathNumber: numerologyResult.lifePathNumber,
        info: numerologyInfo || { name: `ライフパス${numerologyResult.lifePathNumber}` },
        calculation: numerologyResult.calculation,
        isMasterNumber: numerologyResult.isMasterNumber
      },
    currentMoon: {
      phase: currentMoon,
      energy: currentMoon.energy?.level || 5,
      influence: currentMoon.influence || {},
      zodiacCombination: moonZodiacInfluence || {}
    },
    typeMateIntegration: {
      zodiacArchetypes,
      numerologyArchetypes: numerologyCorrelation.correlatedArchetypes,
      resonanceScore,
      spiritualAlignment: numerologyCorrelation.spiritualAlignment
    },
    dailyGuidance
  };
  } catch (error) {
    console.error('❌ Error in generateIntegratedProfile:', error);
    
    // フォールバック：基本的なプロファイルを返す
    return {
      birthDate,
      zodiac: {
        sign: 'aries',
        element: 'fire',
        details: { nameJa: '牡羊座', name: 'Aries' },
        confidence: 50
      },
      numerology: {
        lifePathNumber: 1,
        info: { name: 'リーダー' },
        calculation: 'エラーのため計算不可',
        isMasterNumber: false
      },
      currentMoon: {
        phase: { phaseNameJa: '新月' },
        energy: 5,
        influence: {},
        zodiacCombination: {}
      },
      typeMateIntegration: {
        zodiacArchetypes: ['ARC'],
        numerologyArchetypes: ['ARC'],
        resonanceScore: 50,
        spiritualAlignment: 'Basic'
      },
      dailyGuidance: {
        date: new Date(),
        overallEnergy: 5,
        primaryMessage: '基本的なガイダンス',
        zodiacAdvice: 'あなたらしく過ごしましょう',
        numerologyTheme: '新しい始まり',
        moonInfluence: '穏やかなエネルギー',
        actionRecommendations: ['深呼吸をする'],
        luckyElements: {
          color: '白',
          number: 1,
          timeOfDay: '朝'
        }
      }
    };
  }
}

/**
 * ⭐ 相性分析（2人の統合占星術比較）
 */
export function analyzeCompatibility(
  profile1: IntegratedAstrologyProfile,
  profile2: IntegratedAstrologyProfile,
  archetype1?: BaseArchetype,
  archetype2?: BaseArchetype
): CompatibilityAnalysis {
  
  // 星座相性
  const zodiacComp = calculateZodiacCompatibility(
    profile1.zodiac.sign,
    profile2.zodiac.sign
  );
  
  // 数秘術相性
  const numerologyComp = calculateNumerologyCompatibility(
    profile1.numerology.lifePathNumber,
    profile2.numerology.lifePathNumber
  );
  
  // TypeMateアーキタイプ相性
  const archetypeCompatibility = calculateArchetypeCompatibility(
    profile1.typeMateIntegration.zodiacArchetypes,
    profile2.typeMateIntegration.zodiacArchetypes,
    profile1.typeMateIntegration.numerologyArchetypes,
    profile2.typeMateIntegration.numerologyArchetypes
  );
  
  // 総合スコア計算
  const overallScore = calculateOverallCompatibilityScore(
    zodiacComp.score,
    numerologyComp.score,
    archetypeCompatibility.resonance
  );
  
  return {
    overall: {
      score: overallScore,
      description: generateOverallDescription(overallScore),
      harmony: generateHarmonyDescription(overallScore)
    },
    zodiacCompatibility: zodiacComp,
    numerologyCompatibility: numerologyComp,
    typeMateArchetypes: archetypeCompatibility,
    recommendations: generateCompatibilityRecommendations(
      zodiacComp,
      numerologyComp,
      archetypeCompatibility
    )
  };
}

/**
 * ⭐ 今日のコズミックガイダンス生成
 */
export function generateTodayCosmicGuidance(
  profile: IntegratedAstrologyProfile,
  userArchetype?: BaseArchetype
): {
  cosmicWeather: string;
  personalMessage: string;
  actionItems: string[];
  energyForecast: { morning: number; afternoon: number; evening: number };
  luckyElements: { color: string; number: number; direction: string };
  challenges: string[];
  opportunities: string[];
} {
  
  const { zodiac, numerology, currentMoon } = profile;
  
  // コズミック天気予報
  const cosmicWeather = generateCosmicWeather(
    currentMoon.phase?.phase || 'new_moon',
    zodiac.sign,
    currentMoon.energy
  );
  
  // 個人メッセージ
  const personalMessage = generatePersonalMessage(
    zodiac.details?.nameJa || '星座',
    numerology.info?.name || 'ライフパス',
    currentMoon.phase?.phaseNameJa || '月相',
    userArchetype
  );
  
  // エネルギー予報
  const energyForecast = calculateDailyEnergyForecast(
    currentMoon.energy,
    zodiac.element,
    numerology.lifePathNumber
  );
  
  // 今日のチャレンジと機会を生成
  const challenges = generateDailyChallenges(zodiac, numerology, currentMoon);
  const opportunities = generateDailyOpportunities(zodiac, numerology, currentMoon);
  
  return {
    cosmicWeather,
    personalMessage,
    actionItems: profile.dailyGuidance.actionRecommendations || [
      '宇宙のエネルギーと調和する',
      '直感に従って行動する',
      '今日の特別な瞬間を大切にする'
    ],
    energyForecast,
    luckyElements: {
      color: profile.dailyGuidance.luckyElements.color,
      number: profile.dailyGuidance.luckyElements.number,
      direction: generateLuckyDirection(zodiac.element)
    },
    challenges,
    opportunities
  };
}

/**
 * ⭐ 週間/月間サイクル予測
 */
export function generateCycleForecast(
  profile: IntegratedAstrologyProfile,
  days: number = 28
): Array<{
  date: Date;
  overallEnergy: number;
  primaryTheme: string;
  recommendations: string[];
  challenges: string[];
  opportunities: string[];
}> {
  
  const moonCycle = getMoon28DayCycle();
  const forecast = [];
  
  for (let i = 0; i < Math.min(days, 28); i++) {
    const date = addDays(new Date(), i);
    const moonDay = moonCycle[i];
    
    forecast.push({
      date,
      overallEnergy: calculateDayEnergy(
        moonDay.energy,
        profile.zodiac.element,
        profile.numerology.lifePathNumber,
        i
      ),
      primaryTheme: generateDayTheme(
        moonDay.moonPhase,
        profile.zodiac.sign,
        i
      ),
      recommendations: generateDayRecommendations(
        moonDay.moonPhase,
        profile.zodiac.details,
        profile.numerology.info
      ),
      challenges: generateDayChallenges(moonDay.moonPhase, i),
      opportunities: generateDayOpportunities(moonDay.moonPhase, i)
    });
  }
  
  return forecast;
}

// ==================== Helper Functions ==================== //

function calculateIntegratedResonance(
  zodiacArchetypes: string[],
  numerologyArchetypes: string[],
  userArchetype?: BaseArchetype
): number {
  if (!userArchetype) return 70; // 基本スコア
  
  const zodiacMatch = zodiacArchetypes.includes(userArchetype) ? 20 : 0;
  const numerologyMatch = numerologyArchetypes.includes(userArchetype) ? 20 : 0;
  
  return Math.min(100, 70 + zodiacMatch + numerologyMatch);
}

function generateDailyGuidance(
  zodiac: any,
  numerology: any,
  moon: any,
  personalYear: any
): IntegratedAstrologyProfile['dailyGuidance'] {
  
  const overallEnergy = Math.round(((moon.energy?.level || 5) + 5) / 2 * 10) / 10;
  
  return {
    date: new Date(),
    overallEnergy,
    primaryMessage: `${zodiac.nameJa || '星座'}の${moon.phaseNameJa || '月相'}、${numerology.info?.name || 'ライフパス'}としての一日`,
    zodiacAdvice: (zodiac.traits?.[0] || 'あなたらしさ') + 'を活かしましょう',
    numerologyTheme: personalYear?.theme || '新しい始まり',
    moonInfluence: moon.energy?.description || '穏やかなエネルギー',
    actionRecommendations: [
      ...(moon.energy?.recommendations?.slice(0, 2) || ['今日を大切に過ごす']),
      (numerology.info?.strengths?.[0] || 'あなたの強み') + 'を発揮する'
    ],
    luckyElements: {
      color: generateLuckyColor(zodiac.element || 'fire'),
      number: numerology.lifePathNumber || 1,
      timeOfDay: generateLuckyTime(moon.phase || {})
    }
  };
}

function calculateArchetypeCompatibility(
  zodiac1: string[],
  zodiac2: string[],
  numerology1: string[],
  numerology2: string[]
): {
  resonance: number;
  sharedArchetypes: string[];
  complementaryPairs: string[];
} {
  
  const allArchetypes1 = [...zodiac1, ...numerology1];
  const allArchetypes2 = [...zodiac2, ...numerology2];
  
  const shared = allArchetypes1.filter(a => allArchetypes2.includes(a));
  const resonance = shared.length > 0 ? 70 + (shared.length * 10) : 50;
  
  return {
    resonance: Math.min(100, resonance),
    sharedArchetypes: shared,
    complementaryPairs: findComplementaryPairs(allArchetypes1, allArchetypes2)
  };
}

function calculateOverallCompatibilityScore(
  zodiacScore: number,
  numerologyScore: number,
  archetypeScore: number
): number {
  // 重み付き平均
  return Math.round((zodiacScore * 0.4 + numerologyScore * 0.3 + archetypeScore * 0.3));
}

function generateOverallDescription(score: number): string {
  if (score >= 85) return '非常に調和的で深いつながりが期待できる関係';
  if (score >= 70) return '良好で成長し合える関係性';
  if (score >= 55) return 'お互いの理解と努力により発展する関係';
  return '異なる価値観から学び合える挑戦的な関係';
}

function generateHarmonyDescription(score: number): string {
  if (score >= 85) return '深い精神的共鳴';
  if (score >= 70) return '自然な調和';
  if (score >= 55) return '相互補完関係';
  return '成長のための刺激';
}

function generateCompatibilityRecommendations(
  zodiacComp: any,
  numerologyComp: any,
  archetypeComp: any
): {
  strengthAreas: string[];
  growthAreas: string[];
  communicationStyle: string;
  conflictResolution: string;
} {
  
  return {
    strengthAreas: [
      zodiacComp.elementHarmony,
      numerologyComp.harmony,
      `共通アーキタイプ: ${archetypeComp.sharedArchetypes.join(', ')}`
    ].filter(Boolean),
    growthAreas: [
      numerologyComp.challenges,
      '異なる価値観の受容'
    ],
    communicationStyle: zodiacComp.score > 70 ? '直感的で自然な対話' : '丁寧で意識的な対話',
    conflictResolution: numerologyComp.advice
  };
}

// 英語月相名を日本語に変換
function convertMoonPhaseToJapanese(moonPhase: string): string {
  const moonPhaseMap: { [key: string]: string } = {
    'new moon': '新月',
    'waxing crescent': '三日月',
    'first quarter': '上弦の月',
    'waxing gibbous': '十三夜月',
    'full moon': '満月',
    'waning gibbous': '小望月',
    'last quarter': '下弦の月',
    'waning crescent': '二十六夜月'
  };
  return moonPhaseMap[moonPhase.toLowerCase()] || moonPhase;
}

// 英語星座名を日本語に変換
function convertZodiacSignToJapanese(zodiacSign: ZodiacSign): string {
  const zodiacMap: { [key in ZodiacSign]: string } = {
    'aries': '牡羊座',
    'taurus': '牡牛座', 
    'gemini': '双子座',
    'cancer': '蟹座',
    'leo': '獅子座',
    'virgo': '乙女座',
    'libra': '天秤座',
    'scorpio': '蠍座',
    'sagittarius': '射手座',
    'capricorn': '山羊座',
    'aquarius': '水瓶座',
    'pisces': '魚座'
  };
  return zodiacMap[zodiacSign] || zodiacSign;
}

// BaseArchetypeコードを親しみやすい日本語表現に変換
function convertArchetypeToFriendlyText(archetype: BaseArchetype): string {
  const archetypeMap: { [key in BaseArchetype]: string } = {
    'ARC': '建築家の才能',
    'ALC': '錬金術師の知恵',
    'SOV': '君主の威厳',
    'INV': '発明家の創造力',
    'SAG': '賢者の洞察',
    'DRM': '夢想家の想像力',
    'HER': '英雄の勇気',
    'BAR': '詩人の感性',
    'GUA': '守護者の優しさ',
    'DEF': '騎士の忠誠心',
    'EXE': '指揮官の統率力',
    'PRO': '管理者の責任感',
    'ART': '職人の技術',
    'ARS': '芸術家の感性',
    'PIO': '開拓者の冒険心',
    'PER': 'エンターテイナーの魅力'
  };
  return archetypeMap[archetype] || '特別な才能';
}

function generateCosmicWeather(moonPhase: string, zodiacSign: ZodiacSign, moonEnergy: number): string {
  const japanesePhase = convertMoonPhaseToJapanese(moonPhase);
  const japaneseZodiac = convertZodiacSignToJapanese(zodiacSign);
  const intensity = moonEnergy > 7 ? '決断力とやる気に満ちた' : moonEnergy > 4 ? '穏やかで心地よい' : '静寂で落ち着いた';
  return `${japanesePhase}と${japaneseZodiac}の影響で、今日は${intensity}一日になりそうです`;
}

function generatePersonalMessage(
  zodiacName: string,
  numerologyName: string,
  moonName: string,
  archetype?: BaseArchetype
): string {
  const archetypeMessage = archetype ? `${convertArchetypeToFriendlyText(archetype)}を活かし、` : '';
  return `${zodiacName}として、${numerologyName}のあなたらしい道を歩むあなたへ。${moonName}の${archetypeMessage}今日という日を大切に過ごしてください。`;
}

function calculateDailyEnergyForecast(
  moonEnergy: number,
  element: ZodiacElement,
  lifePathNumber: number
): { morning: number; afternoon: number; evening: number } {
  
  const elementMultiplier = {
    fire: { morning: 1.2, afternoon: 1.1, evening: 0.9 },
    earth: { morning: 0.9, afternoon: 1.2, evening: 1.0 },
    air: { morning: 1.1, afternoon: 1.2, evening: 1.0 },
    water: { morning: 0.8, afternoon: 1.0, evening: 1.3 }
  };
  
  const multiplier = elementMultiplier[element];
  const base = moonEnergy;
  
  return {
    morning: Math.round(base * multiplier.morning),
    afternoon: Math.round(base * multiplier.afternoon),
    evening: Math.round(base * multiplier.evening)
  };
}

function generateLuckyColor(element: ZodiacElement): string {
  const colors = {
    fire: ['赤', 'オレンジ', '金'],
    earth: ['緑', '茶', 'ベージュ'],
    air: ['青', '白', '銀'],
    water: ['紺', '青緑', '紫']
  };
  
  const elementColors = colors[element];
  return elementColors[Math.floor(Math.random() * elementColors.length)];
}

function generateLuckyTime(moonPhase: any): string {
  const times = {
    new_moon: '早朝',
    waxing_crescent: '午前中',
    first_quarter: '昼',
    waxing_gibbous: '午後',
    full_moon: '夜',
    waning_gibbous: '夕方',
    last_quarter: '夜中',
    waning_crescent: '夜明け前'
  };
  
  return times[moonPhase.phase] || '午後';
}

function generateLuckyDirection(element: ZodiacElement): string {
  const directions = {
    fire: '南',
    earth: '南西',
    air: '東',
    water: '北'
  };
  
  return directions[element];
}

function generateDailyChallenges(zodiac: any, numerology: any, moon: any): string[] {
  return [
    zodiac.details?.challenges?.[0] || 'バランスの調整',
    numerology.info?.challenges?.[0] || '内面の成長',
    '月のエネルギーの過剰または不足'
  ].slice(0, 2);
}

function generateDailyOpportunities(zodiac: any, numerology: any, moon: any): string[] {
  return [
    (zodiac.details?.strengths?.[0] || 'あなたの強み') + 'の発揮',
    (numerology.info?.strengths?.[0] || 'ライフパスの力') + 'の活用',
    moon.influence?.spiritual || '精神的な成長'
  ].slice(0, 2);
}

function findComplementaryPairs(archetypes1: string[], archetypes2: string[]): string[] {
  // アーキタイプの補完関係マッピング（簡略版）
  const complementary: Record<string, string[]> = {
    'ARC': ['PER', 'ARS'], // アーキテクト ↔ パフォーマー、アーティスト
    'SAG': ['HER', 'PIO'], // セージ ↔ ヒーロー、パイオニア
    'HER': ['SAG', 'ALC'], // ヒーロー ↔ セージ、アルケミスト
    'DRM': ['EXE', 'GUA']  // ドリーマー ↔ エグゼクティブ、ガーディアン
  };
  
  const pairs = [];
  for (const arch1 of archetypes1) {
    for (const arch2 of archetypes2) {
      if (complementary[arch1]?.includes(arch2)) {
        pairs.push(`${arch1}-${arch2}`);
      }
    }
  }
  
  return pairs;
}

function calculateDayEnergy(
  moonEnergy: number,
  element: ZodiacElement,
  lifePathNumber: number,
  dayOffset: number
): number {
  const elementBonus = { fire: 1, earth: 0, air: 1, water: 0 }[element];
  const numerologyBonus = lifePathNumber > 5 ? 1 : 0;
  const cycleVariation = Math.sin((dayOffset / 28) * 2 * Math.PI) * 2;
  
  return Math.max(1, Math.min(10, Math.round(moonEnergy + elementBonus + numerologyBonus + cycleVariation)));
}

function generateDayTheme(moonPhase: any, zodiacSign: ZodiacSign, dayOffset: number): string {
  const themes = [
    '新しい可能性の発見',
    '内なる力の活用',
    '関係性の深化',
    '創造性の発揮',
    '安定と成長',
    '変化への適応',
    '智慧の獲得'
  ];
  
  return themes[dayOffset % themes.length];
}

function generateDayRecommendations(moonPhase: any, zodiacDetails: any, numerologyInfo: any): string[] {
  return [
    moonPhase.energy?.recommendations?.[0] || '今日のエネルギーを活かす',
    zodiacDetails.strengths?.[0] + 'を発揮する' || '自分の強みを活かす',
    numerologyInfo.strengths?.[0] + 'を大切にする' || '内なる声に従う'
  ];
}

function generateDayChallenges(moonPhase: any, dayOffset: number): string[] {
  const challenges = [
    'エネルギーのバランス',
    '感情の安定',
    '決断力の発揮',
    '忍耐力の維持'
  ];
  
  return [challenges[dayOffset % challenges.length]];
}

function generateDayOpportunities(moonPhase: any, dayOffset: number): string[] {
  const opportunities = [
    '新しい学びの機会',
    '深いつながりの構築',
    '創造的表現の場',
    '内面の成長'
  ];
  
  return [opportunities[dayOffset % opportunities.length]];
}
// 🌙 Moon Phase Calculator
// 月の位相とエネルギー計算システム

import SunCalc from 'suncalc';
import { addDays, differenceInDays, format } from 'date-fns';
import { MoonPhase } from '../../types';

// 月の位相情報
export interface MoonPhaseInfo {
  phase: MoonPhase;
  phaseName: string;
  phaseNameJa: string;
  illumination: number; // 照明率 0-1
  age: number; // 月齢（日）
  energy: MoonEnergyInfo;
  influence: MoonInfluence;
  nextPhaseDate: Date;
  nextPhaseName: string;
  isWaxing: boolean; // 満ちているか欠けているか
}

// 月のエネルギー情報
export interface MoonEnergyInfo {
  level: number; // 1-10
  type: 'manifesting' | 'releasing' | 'growing' | 'reflecting';
  description: string;
  recommendations: string[];
  affirmations: string[];
}

// 月の影響
export interface MoonInfluence {
  emotional: string;
  physical: string;
  spiritual: string;
  relationships: string;
  creativity: string;
  manifestation: string;
}

// 月のサイクル期間（約29.5日）
const MOON_CYCLE_DAYS = 29.530588853;

// 新月の基準日（2000年1月6日 18:14 UTC）
const NEW_MOON_REFERENCE = new Date('2000-01-06T18:14:00.000Z');

/**
 * 🌙 現在の月の位相を計算
 */
export function getCurrentMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const moonAge = calculateMoonAge(date);
  const phase = determineMoonPhase(moonAge);
  
  return {
    phase,
    phaseName: getMoonPhaseName(phase),
    phaseNameJa: getMoonPhaseNameJa(phase),
    illumination: moonIllumination.fraction,
    age: moonAge,
    energy: getMoonEnergyInfo(phase, moonAge),
    influence: getMoonInfluence(phase),
    nextPhaseDate: calculateNextPhaseDate(date, phase),
    nextPhaseName: getNextPhaseName(phase),
    isWaxing: moonAge < MOON_CYCLE_DAYS / 2
  };
}

/**
 * 🌙 月齢を計算
 */
function calculateMoonAge(date: Date): number {
  const daysSinceReference = differenceInDays(date, NEW_MOON_REFERENCE);
  const moonAge = daysSinceReference % MOON_CYCLE_DAYS;
  return moonAge < 0 ? moonAge + MOON_CYCLE_DAYS : moonAge;
}

/**
 * 🌙 月齢から位相を判定
 */
function determineMoonPhase(moonAge: number): MoonPhase {
  if (moonAge < 1.84566) return 'new_moon';
  if (moonAge < 5.53699) return 'waxing_crescent';
  if (moonAge < 9.22831) return 'first_quarter';
  if (moonAge < 12.91963) return 'waxing_gibbous';
  if (moonAge < 16.61096) return 'full_moon';
  if (moonAge < 20.30228) return 'waning_gibbous';
  if (moonAge < 23.99361) return 'last_quarter';
  if (moonAge < 27.68493) return 'waning_crescent';
  return 'new_moon';
}

/**
 * 🌙 位相名（英語）
 */
function getMoonPhaseName(phase: MoonPhase): string {
  const names: Record<MoonPhase, string> = {
    new_moon: 'New Moon',
    waxing_crescent: 'Waxing Crescent',
    first_quarter: 'First Quarter',
    waxing_gibbous: 'Waxing Gibbous',
    full_moon: 'Full Moon',
    waning_gibbous: 'Waning Gibbous',
    last_quarter: 'Last Quarter',
    waning_crescent: 'Waning Crescent'
  };
  return names[phase];
}

/**
 * 🌙 位相名（日本語）
 */
function getMoonPhaseNameJa(phase: MoonPhase): string {
  const names: Record<MoonPhase, string> = {
    new_moon: '新月',
    waxing_crescent: '三日月',
    first_quarter: '上弦の月',
    waxing_gibbous: '十三夜月',
    full_moon: '満月',
    waning_gibbous: '寝待月',
    last_quarter: '下弦の月',
    waning_crescent: '有明月'
  };
  return names[phase];
}

/**
 * 🌙 月のエネルギー情報を取得
 */
function getMoonEnergyInfo(phase: MoonPhase, moonAge: number): MoonEnergyInfo {
  const energyData: Record<MoonPhase, MoonEnergyInfo> = {
    new_moon: {
      level: 2,
      type: 'manifesting',
      description: '新しい始まりとセッティングの時期',
      recommendations: ['新しい目標設定', '意図の明確化', '瞑想', '内省'],
      affirmations: ['新しい可能性が私に開かれています', '私は新しいサイクルを歓迎します']
    },
    waxing_crescent: {
      level: 4,
      type: 'growing',
      description: '成長と行動開始の時期',
      recommendations: ['計画の実行開始', '小さな行動', '学習', '準備'],
      affirmations: ['私の目標は着実に成長しています', '小さな一歩が大きな変化を生みます']
    },
    first_quarter: {
      level: 6,
      type: 'manifesting',
      description: '決断と行動力の時期',
      recommendations: ['決断を下す', '障害を乗り越える', '積極的行動', '調整'],
      affirmations: ['私は困難を乗り越える力があります', '決断力が私を前進させます']
    },
    waxing_gibbous: {
      level: 8,
      type: 'growing',
      description: '調整と完成に向けた準備の時期',
      recommendations: ['詳細の調整', '品質向上', '関係性の調和', '忍耐'],
      affirmations: ['完璧なタイミングで全てが整います', '私は忍耐強く目標に向かいます']
    },
    full_moon: {
      level: 10,
      type: 'manifesting',
      description: '完成と感謝、最高エネルギーの時期',
      recommendations: ['成果の収穫', '感謝の表現', '祝福', '共有'],
      affirmations: ['私は豊かさを受け取ります', '全てに感謝しています']
    },
    waning_gibbous: {
      level: 8,
      type: 'releasing',
      description: '感謝と分かち合いの時期',
      recommendations: ['知識の共有', '他者への貢献', '感謝の実践', '振り返り'],
      affirmations: ['私の経験が他者の助けになります', '与えることで豊かになります']
    },
    last_quarter: {
      level: 6,
      type: 'releasing',
      description: '手放しと浄化の時期',
      recommendations: ['不要なものの除去', '古いパターンの解放', '浄化', '整理'],
      affirmations: ['私は不要なものを手放します', '空間を作ることで新しいものが入ります']
    },
    waning_crescent: {
      level: 3,
      type: 'reflecting',
      description: '内省と休息の時期',
      recommendations: ['静かな時間', '内省', '休息', 'スピリチュアルな実践'],
      affirmations: ['私は内なる知恵を信頼します', '静寂の中で答えを見つけます']
    }
  };
  
  return energyData[phase];
}

/**
 * 🌙 月の影響を取得
 */
function getMoonInfluence(phase: MoonPhase): MoonInfluence {
  const influences: Record<MoonPhase, MoonInfluence> = {
    new_moon: {
      emotional: '内向的、新しい感情の芽生え',
      physical: '低エネルギー、休息が必要',
      spiritual: '直感が高まり、内なる声を聞きやすい',
      relationships: '新しい出会いや関係の始まり',
      creativity: '新しいアイデアやインスピレーションの種',
      manifestation: '新しい目標設定に最適'
    },
    waxing_crescent: {
      emotional: '希望と期待、前向きなエネルギー',
      physical: 'エネルギーが徐々に増加',
      spiritual: '成長への意欲と学習欲',
      relationships: '関係の発展と深化',
      creativity: 'アイデアの具体化と計画',
      manifestation: '行動の開始と小さな進歩'
    },
    first_quarter: {
      emotional: '決断力と意志力の強化',
      physical: '活動的で行動的なエネルギー',
      spiritual: '困難を乗り越える精神力',
      relationships: '関係の試練と深化',
      creativity: '創造プロジェクトの推進',
      manifestation: '障害の克服と進展'
    },
    waxing_gibbous: {
      emotional: '完成への期待と少しの不安',
      physical: '高いエネルギーレベルを維持',
      spiritual: '忍耐と調和のバランス',
      relationships: '関係の調整と調和',
      creativity: '作品の完成に向けた調整',
      manifestation: '細部の調整と品質向上'
    },
    full_moon: {
      emotional: '感情の高まりと直感の鋭敏化',
      physical: '最高潮のエネルギー、時に過剰',
      spiritual: 'サイキック能力の向上と洞察',
      relationships: '情熱的な交流と深いつながり',
      creativity: '創造力の爆発と表現',
      manifestation: '目標の達成と収穫'
    },
    waning_gibbous: {
      emotional: '満足感と感謝の気持ち',
      physical: 'エネルギーは高いが安定',
      spiritual: '智慧の共有と指導',
      relationships: '深い絆と相互サポート',
      creativity: '作品の共有と影響',
      manifestation: '成果の分かち合い'
    },
    last_quarter: {
      emotional: '解放と浄化の感情',
      physical: 'エネルギーの減少、デトックス',
      spiritual: '古いパターンからの解放',
      relationships: '関係の見直しと整理',
      creativity: '古いプロジェクトの完了',
      manifestation: '不要な要素の除去'
    },
    waning_crescent: {
      emotional: '静寂と内省の時間',
      physical: '低エネルギー、休息と回復',
      spiritual: '深い瞑想と内なる旅',
      relationships: '一人の時間と自己との対話',
      creativity: 'インスピレーションの静かな到来',
      manifestation: '次のサイクルへの準備'
    }
  };
  
  return influences[phase];
}

/**
 * 🌙 次の位相の日付を計算
 */
function calculateNextPhaseDate(currentDate: Date, currentPhase: MoonPhase): Date {
  const phaseSequence: MoonPhase[] = [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ];
  
  const currentIndex = phaseSequence.indexOf(currentPhase);
  const nextIndex = (currentIndex + 1) % phaseSequence.length;
  
  // 各位相は約3.7日間続く
  const daysToNextPhase = 3.7;
  
  return addDays(currentDate, daysToNextPhase);
}

/**
 * 🌙 次の位相名を取得
 */
function getNextPhaseName(currentPhase: MoonPhase): string {
  const phaseSequence: MoonPhase[] = [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ];
  
  const currentIndex = phaseSequence.indexOf(currentPhase);
  const nextIndex = (currentIndex + 1) % phaseSequence.length;
  const nextPhase = phaseSequence[nextIndex];
  
  return getMoonPhaseNameJa(nextPhase);
}

/**
 * 🌙 月の位相と星座の組み合わせ効果
 */
export function getMoonZodiacInfluence(moonPhase: MoonPhase, zodiacSign: string): {
  combinedEnergy: string;
  specialPowers: string[];
  recommendations: string[];
} {
  // 月の位相タイプごとの基本エネルギー
  const phaseEnergyTypes = {
    new_moon: 'new_beginnings',
    waxing_crescent: 'growth',
    first_quarter: 'action',
    waxing_gibbous: 'refinement',
    full_moon: 'manifestation',
    waning_gibbous: 'sharing',
    last_quarter: 'release',
    waning_crescent: 'reflection'
  };
  
  // 星座との組み合わせ効果（簡略版）
  const zodiacMoonEffects: Record<string, { energy: string; powers: string[]; recs: string[] }> = {
    '牡羊座': {
      energy: '行動力の増幅',
      powers: ['決断力', 'リーダーシップ', '新規開拓'],
      recs: ['積極的な行動', '新しい挑戦', 'リーダーシップの発揮']
    },
    '牡牛座': {
      energy: '安定と豊かさ',
      powers: ['持続力', '現実化', '物質的豊かさ'],
      recs: ['着実な積み重ね', '美しいものとの接触', '感覚の活用']
    },
    '双子座': {
      energy: 'コミュニケーションの活性化',
      powers: ['情報収集', '多様性', '適応力'],
      recs: ['学習と教育', '多角的思考', '情報の共有']
    },
    '蟹座': {
      energy: '感情と直感の深化',
      powers: ['共感力', '保護力', '記憶力'],
      recs: ['家族時間', '感情の表現', '直感の信頼']
    },
    '獅子座': {
      energy: '創造力と自己表現',
      powers: ['カリスマ', '創造力', '自信'],
      recs: ['創造的表現', '自己アピール', '楽しさの追求']
    },
    '乙女座': {
      energy: '完璧化と奉仕',
      powers: ['分析力', '実用性', '奉仕'],
      recs: ['詳細への注意', '健康管理', '他者への奉仕']
    },
    '天秤座': {
      energy: 'バランスと調和',
      powers: ['調和力', '美意識', '公平性'],
      recs: ['関係の調整', '美的活動', '平和の促進']
    },
    '蠍座': {
      energy: '変容と深化',
      powers: ['洞察力', '変容力', '集中力'],
      recs: ['深い探求', '変容の受け入れ', '秘密の保持']
    },
    '射手座': {
      energy: '拡大と探求',
      powers: ['冒険心', '楽観性', '智慧'],
      recs: ['新しい体験', '学習の拡大', '旅行や探求']
    },
    '山羊座': {
      energy: '目標達成と権威',
      powers: ['責任感', '実行力', '権威'],
      recs: ['目標への集中', '責任の受け入れ', '長期計画']
    },
    '水瓶座': {
      energy: '革新と独立',
      powers: ['独創性', '革新力', '人道性'],
      recs: ['独自のアプローチ', '技術の活用', '社会貢献']
    },
    '魚座': {
      energy: 'スピリチュアルと直感',
      powers: ['直感力', 'スピリチュアル', '共感'],
      recs: ['瞑想と祈り', '芸術的表現', '他者への共感']
    }
  };
  
  const phaseType = phaseEnergyTypes[moonPhase];
  const zodiacEffect = zodiacMoonEffects[zodiacSign] || zodiacMoonEffects['双子座'];
  
  return {
    combinedEnergy: `${phaseType}の${zodiacEffect.energy}`,
    specialPowers: zodiacEffect.powers,
    recommendations: zodiacEffect.recs
  };
}

/**
 * 🌙 月のサイクルに基づく28日間の運勢
 */
export function getMoon28DayCycle(startDate: Date = new Date()): Array<{
  date: Date;
  moonPhase: MoonPhase;
  dayOfCycle: number;
  energy: number;
  focus: string;
  recommendation: string;
}> {
  const cycle = [];
  
  for (let i = 0; i < 28; i++) {
    const date = addDays(startDate, i);
    const moonInfo = getCurrentMoonPhase(date);
    
    cycle.push({
      date,
      moonPhase: moonInfo.phase,
      dayOfCycle: i + 1,
      energy: moonInfo.energy.level,
      focus: getFocusForDay(i + 1),
      recommendation: getRecommendationForDay(i + 1, moonInfo.phase)
    });
  }
  
  return cycle;
}

function getFocusForDay(dayOfCycle: number): string {
  const focuses = [
    '新しい始まり', '意図設定', '計画立案', '行動開始',
    '成長', '学習', '調整', '進歩',
    '決断', '行動', '推進', '発展',
    '調和', '完成準備', '品質向上', '最終調整',
    '完成', '収穫', '感謝', '祝福',
    '分かち合い', '智慧の伝達', '貢献', '感謝',
    '手放し', '浄化', '整理', '解放'
  ];
  
  return focuses[(dayOfCycle - 1) % focuses.length];
}

function getRecommendationForDay(dayOfCycle: number, phase: MoonPhase): string {
  const phaseRecs = {
    new_moon: '新しい目標を設定し、静かに内省する',
    waxing_crescent: '小さな行動を開始し、成長を意識する',
    first_quarter: '決断を下し、障害を乗り越える',
    waxing_gibbous: '詳細を調整し、完成に向けて努力する',
    full_moon: '成果を収穫し、感謝の気持ちを表現する',
    waning_gibbous: '知識を共有し、他者への貢献を考える',
    last_quarter: '不要なものを手放し、空間を作る',
    waning_crescent: '静かに内省し、次のサイクルに備える'
  };
  
  return phaseRecs[phase];
}
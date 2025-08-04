// 🌟 Harmonic AI Service
// TypeMate × 占星術統合ハーモニックAIシステム

'use client';

import { supabase } from './supabase-simple';
import { 
  generateIntegratedProfile, 
  analyzeCompatibility, 
  generateTodayCosmicGuidance,
  generateCycleForecast 
} from './astrology';
import type { 
  BaseArchetype, 
  Type64, 
  FullArchetype64,
  ExtendedUserProfile,
  IntegratedAstrologyProfile,
  CompatibilityAnalysis,
  TodayCosmicGuidance,
  CycleForecastDay 
} from '../types';

// ハーモニックAIプロファイル
export interface HarmonicAIProfile {
  // 基本情報
  id: string;
  userId: string;
  
  // TypeMate診断
  userType: Type64;
  fullArchetype64: FullArchetype64;
  selectedAiPersonality: BaseArchetype;
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor';
  
  // 占星術統合
  astrologyProfile: IntegratedAstrologyProfile;
  
  // ハーモニックスコア
  harmonicResonance: {
    overall: number;
    typeAstrologyAlignment: number;
    personalityCosmicSync: number;
    dailyEnergyMatch: number;
  };
  
  // 設定
  privacySettings: {
    shareAstrologyData: boolean;
    showDailyGuidance: boolean;
    enableCosmicNotifications: boolean;
  };
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  lastGuidanceUpdate: Date;
}

// 今日のハーモニック・ガイダンス
export interface DailyHarmonicGuidance {
  date: Date;
  profile: HarmonicAIProfile;
  cosmicGuidance: TodayCosmicGuidance;
  typeMateIntegration: {
    archetypeAdvice: string;
    relationshipTip: string;
    personalGrowth: string;
    energyAlignment: string;
  };
  actionItems: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
  affirmations: string[];
  challenges: string[];
  opportunities: string[];
}

/**
 * 🌟 ハーモニックAIプロファイルを生成
 */
export async function createHarmonicProfile(
  userId: string,
  name: string,
  birthDate: Date,
  birthTime?: string,
  birthLocation?: string,
  userType?: Type64,
  selectedAiPersonality?: BaseArchetype,
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor' = 'friend'
): Promise<HarmonicAIProfile> {
  try {
    console.log('🌟 Creating harmonic profile:', { userId, name, birthDate, userType, selectedAiPersonality });
    
    // 占星術プロファイル生成
    const astrologyProfile = await generateIntegratedProfile(
      birthDate,
      selectedAiPersonality
    );
    
    console.log('🔮 Astrology profile generated:', {
      hasZodiac: !!astrologyProfile?.zodiac,
      hasNumerology: !!astrologyProfile?.numerology,
      zodiacSign: astrologyProfile?.zodiac?.sign,
      zodiacDetails: astrologyProfile?.zodiac?.details
    });
  
  // ハーモニックスコア計算
  const harmonicResonance = calculateHarmonicResonance(
    astrologyProfile,
    userType,
    selectedAiPersonality
  );
  
  // プロファイル作成
  const profile: HarmonicAIProfile = {
    id: generateProfileId(),
    userId,
    userType: userType || 'ARC-COOPERATIVESTABLE',
    fullArchetype64: `HARMONIC_${selectedAiPersonality || 'ARC'}` as FullArchetype64,
    selectedAiPersonality: selectedAiPersonality || 'ARC',
    relationshipType,
    astrologyProfile,
    harmonicResonance,
    privacySettings: {
      shareAstrologyData: false,
      showDailyGuidance: true,
      enableCosmicNotifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastGuidanceUpdate: new Date()
  };
  
    // データベースに保存（プロファイル + ユーザー名）
    await saveHarmonicProfile(profile, name);
    
    // localStorageにも名前を保存（チャットで即座に使用可能にするため）
    if (name) {
      const personalInfo = JSON.parse(localStorage.getItem('personalInfo') || '{}');
      personalInfo.name = name;
      localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
      console.log('✅ ユーザー名をlocalStorageに保存:', name);
    }
    
    return profile;
  } catch (error) {
    console.error('❌ Error in createHarmonicProfile:', error);
    throw error;
  }
}

/**
 * 🌟 ハーモニックプロファイルを削除
 */
export async function deleteHarmonicProfile(userId: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting harmonic profile for userId:', userId);
    
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ Error deleting harmonic profile:', error);
      return false;
    }
    
    console.log('✅ Harmonic profile deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteHarmonicProfile:', error);
    return false;
  }
}

/**
 * 🌟 ハーモニックプロファイルを取得
 */
export async function getHarmonicProfile(userId: string): Promise<HarmonicAIProfile | null> {
  try {
    console.log('🔍 getHarmonicProfile called with userId:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, user_type, selected_ai_personality, relationship_type, birth_date, astrology_privacy, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    console.log('🔍 Supabase query result:', { data, error });
    
    if (error) {
      console.log('❌ Supabase error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data returned from user_profiles');
      return null;
    }
    
    // 最新のレコードを取得（配列の最初の要素）
    const profileData = data[0];
    console.log('✅ Found user profile:', profileData.id);
    
    // 占星術データがない場合はnullを返す
    if (!profileData.birth_date) {
      console.log('⚠️ No birth_date found in profile:', profileData);
      return null;
    }
    
    console.log('✅ Found user profile with birth_date:', profileData.birth_date);
    
    // プロファイルを復元
    console.log('🔮 Generating astrology profile for restoration...');
    const astrologyProfile = await generateIntegratedProfile(
      new Date(profileData.birth_date),
      profileData.selected_ai_personality
    );
    
    console.log('✅ Astrology profile generated for restoration:', {
      hasZodiac: !!astrologyProfile?.zodiac,
      hasNumerology: !!astrologyProfile?.numerology
    });
    
    const profile: HarmonicAIProfile = {
      id: profileData.id,
      userId: profileData.user_id,
      userType: profileData.user_type,
      fullArchetype64: `HARMONIC_${profileData.selected_ai_personality}` as FullArchetype64,
      selectedAiPersonality: profileData.selected_ai_personality,
      relationshipType: profileData.relationship_type || 'friend',
      astrologyProfile,
      harmonicResonance: calculateHarmonicResonance(
        astrologyProfile,
        profileData.user_type,
        profileData.selected_ai_personality
      ),
      privacySettings: {
        shareAstrologyData: profileData.astrology_privacy !== 'private',
        showDailyGuidance: true,
        enableCosmicNotifications: true
      },
      createdAt: new Date(profileData.created_at || Date.now()),
      updatedAt: new Date(profileData.updated_at || Date.now()),
      lastGuidanceUpdate: new Date()
    };
    
    console.log('🌟 HarmonicProfile restored successfully for userId:', userId);
    return profile;
  } catch (error) {
    console.error('Error fetching harmonic profile:', error);
    return null;
  }
}

/**
 * 🌟 今日のハーモニック・ガイダンスを生成
 */
export async function generateDailyHarmonicGuidance(
  profile: HarmonicAIProfile
): Promise<DailyHarmonicGuidance> {
  try {
    // コズミック・ガイダンス生成
    const cosmicGuidance = generateTodayCosmicGuidance(
      profile.astrologyProfile,
      profile.selectedAiPersonality
    );
    
    // TypeMate統合アドバイス生成
    const typeMateIntegration = generateTypeMateIntegration(
      profile.userType,
      profile.selectedAiPersonality,
      profile.relationshipType,
      profile.astrologyProfile
    );
    
    // 時間帯別アクションアイテム
    const actionItems = generateTimeBasedActions(
      cosmicGuidance,
      profile.astrologyProfile.currentMoon.energy
  );
  
  // アファメーション生成
  const affirmations = generatePersonalizedAffirmations(
    profile.astrologyProfile.zodiac.sign,
    profile.astrologyProfile.numerology.info?.name || '数秘術',
    profile.selectedAiPersonality
  );
  
    return {
      date: new Date(),
      profile,
      cosmicGuidance,
      typeMateIntegration,
      actionItems,
      affirmations,
      challenges: cosmicGuidance.challenges,
      opportunities: cosmicGuidance.opportunities
    };
  } catch (error) {
    console.error('Error generating daily harmonic guidance:', error);
    
    // フォールバック・ガイダンスを返す
    return {
      date: new Date(),
      profile,
      cosmicGuidance: {
        cosmicWeather: '今日は穏やかな宇宙エネルギーに包まれています',
        personalMessage: `${profile.selectedAiPersonality}の私から、あなたに特別なメッセージをお届けします。`,
        energyForecast: {
          morning: 7,
          afternoon: 6,
          evening: 8
        },
        luckyElements: {
          color: '青',
          number: 7,
          direction: '東'
        }
      },
      typeMateIntegration: {
        archetypeAdvice: 'あなたらしさを大切にして過ごしましょう',
        relationshipTip: '心のつながりを意識してください',
        personalGrowth: '新しい発見があるかもしれません',
        energyAlignment: '自然のリズムに合わせて行動しましょう'
      },
      actionItems: {
        morning: ['深呼吸をする', '感謝の気持ちを思い出す'],
        afternoon: ['創造的な活動をする', '人とのつながりを大切にする'],
        evening: ['今日を振り返る', 'リラックスタイムを作る']
      },
      affirmations: [
        '私は自分らしく輝いています',
        '今日という日に感謝します',
        '私には無限の可能性があります'
      ],
      challenges: ['エラーが発生しましたが、今日も素晴らしい一日です'],
      opportunities: ['新しい気づきを得るチャンスがあります']
    };
  }
}

/**
 * 🌟 ハーモニック相性分析
 */
export async function analyzeHarmonicCompatibility(
  profile1: HarmonicAIProfile,
  profile2: HarmonicAIProfile
): Promise<CompatibilityAnalysis & { harmonicEnhancement: number }> {
  
  const baseCompatibility = analyzeCompatibility(
    profile1.astrologyProfile,
    profile2.astrologyProfile,
    profile1.selectedAiPersonality,
    profile2.selectedAiPersonality
  );
  
  // ハーモニック強化スコア計算
  const harmonicEnhancement = calculateHarmonicEnhancement(
    profile1.harmonicResonance,
    profile2.harmonicResonance
  );
  
  return {
    ...baseCompatibility,
    harmonicEnhancement
  };
}

/**
 * 🌟 週間ハーモニック予測
 */
export async function generateWeeklyHarmonicForecast(
  profile: HarmonicAIProfile
): Promise<Array<CycleForecastDay & { harmonicTheme: string; typeMateAdvice: string }>> {
  
  const cycleForecast = generateCycleForecast(profile.astrologyProfile, 7);
  
  return cycleForecast.map((day, index) => ({
    ...day,
    harmonicTheme: generateDailyHarmonicTheme(day, profile.userType, index),
    typeMateAdvice: generateDailyTypeMateAdvice(day, profile.selectedAiPersonality)
  }));
}

// 月間ハーモニック予測の型定義
export interface MonthlyForecast {
  monthlyTheme: string;
  weeklyHighlights: Array<{
    week: number;
    theme: string;
    keyDays: number[];
    recommendation: string;
    energyPattern: 'ascending' | 'peak' | 'descending' | 'renewal';
  }>;
  cosmicEvents: Array<{
    date: Date;
    event: string;
    significance: string;
    influence: 'high' | 'medium' | 'low';
  }>;
  overallEnergyTrend: number[];
  growthMilestones: string[];
}

// 月間ハーモニック予測を生成
export async function generateMonthlyHarmonicForecast(
  profile: HarmonicAIProfile
): Promise<MonthlyForecast> {
  
  // 28日間の月サイクル予測を生成
  const cycleForecast = generateCycleForecast(profile.astrologyProfile, 28);
  
  // 月全体のテーマを生成
  const monthlyTheme = generateMonthlyTheme(profile);
  
  // 週ごとのハイライトを計算
  const weeklyHighlights = generateWeeklyHighlights(cycleForecast, profile);
  
  // 重要な宇宙的イベントを検出
  const cosmicEvents = generateCosmicEvents(cycleForecast);
  
  // エネルギートレンドを計算
  const overallEnergyTrend = cycleForecast.map(day => day.overallEnergy);
  
  // 成長マイルストーンを提案
  const growthMilestones = generateGrowthMilestones(profile, cycleForecast);
  
  return {
    monthlyTheme,
    weeklyHighlights,
    cosmicEvents,
    overallEnergyTrend,
    growthMilestones
  };
}

// 月全体のテーマを生成
function generateMonthlyTheme(profile: HarmonicAIProfile): string {
  const themes = [
    `${profile.userType}の深層的成長と宇宙的調和`,
    `ハーモニック共鳴による内面的変容の月`,
    `${profile.selectedAiPersonality}エネルギーとの統合深化`,
    `コズミックサイクルとの完全な同調期間`,
    `魂の進化を促進する宇宙的ギフトの月`
  ];
  
  // プロファイルベースでテーマを選択
  const themeIndex = (profile.harmonicResonance.overall * themes.length / 100) | 0;
  return themes[Math.min(themeIndex, themes.length - 1)];
}

// 週ごとのハイライトを生成
function generateWeeklyHighlights(
  cycleForecast: any[],
  profile: HarmonicAIProfile
): MonthlyForecast['weeklyHighlights'] {
  
  const weeks = [];
  
  for (let week = 0; week < 4; week++) {
    const startDay = week * 7;
    const endDay = Math.min(startDay + 7, cycleForecast.length);
    const weekDays = cycleForecast.slice(startDay, endDay);
    
    // 週のエネルギーパターンを分析
    const energyPattern = analyzeWeekEnergyPattern(weekDays);
    
    // キーとなる日を特定（エネルギーが高い日、低い日）
    const keyDays = identifyKeyDays(weekDays, startDay);
    
    weeks.push({
      week: week + 1,
      theme: generateWeekTheme(weekDays, profile, week),
      keyDays,
      recommendation: generateWeekRecommendation(energyPattern, profile),
      energyPattern
    });
  }
  
  return weeks;
}

// 週のエネルギーパターンを分析
function analyzeWeekEnergyPattern(weekDays: any[]): 'ascending' | 'peak' | 'descending' | 'renewal' {
  if (weekDays.length < 3) return 'renewal';
  
  const startEnergy = weekDays[0].overallEnergy;
  const midEnergy = weekDays[Math.floor(weekDays.length / 2)].overallEnergy;
  const endEnergy = weekDays[weekDays.length - 1].overallEnergy;
  
  if (startEnergy < midEnergy && midEnergy > endEnergy) return 'peak';
  if (startEnergy < endEnergy) return 'ascending';
  if (startEnergy > endEnergy) return 'descending';
  return 'renewal';
}

// キーとなる日を特定
function identifyKeyDays(weekDays: any[], weekStartIndex: number): number[] {
  const sortedDays = weekDays
    .map((day, index) => ({ energy: day.overallEnergy, dayIndex: weekStartIndex + index }))
    .sort((a, b) => b.energy - a.energy);
  
  // エネルギーが高い上位2日を返す
  return sortedDays.slice(0, 2).map(day => day.dayIndex);
}

// 週のテーマを生成
function generateWeekTheme(weekDays: any[], profile: HarmonicAIProfile, weekIndex: number): string {
  const weekThemes = [
    '新しいサイクルの始まり - 種まきの週',
    '成長と拡張 - 開花の週', 
    '統合と深化 - 収穫の週',
    '完成と次への準備 - 変容の週'
  ];
  
  return weekThemes[weekIndex] || '宇宙的調和の週';
}

// 週の推奨アクションを生成
function generateWeekRecommendation(
  pattern: 'ascending' | 'peak' | 'descending' | 'renewal',
  profile: HarmonicAIProfile
): string {
  
  const recommendations = {
    ascending: '新しいプロジェクトや学習を始めるのに最適な週です。エネルギーが上昇傾向にあります。',
    peak: '重要な決断や大きな行動を取るのに最良のタイミングです。最高のパフォーマンスを発揮できます。',
    descending: '振り返りと整理の時期です。これまでの経験を統合し、次の段階に備えましょう。',
    renewal: '休息と内省の時間を大切にしてください。新しいエネルギーの充電期間です。'
  };
  
  return recommendations[pattern];
}

// 宇宙的イベントを生成
function generateCosmicEvents(cycleForecast: any[]): MonthlyForecast['cosmicEvents'] {
  const events = [];
  
  cycleForecast.forEach((day, index) => {
    // 特別にエネルギーが高い日や低い日をイベントとして抽出
    if (day.overallEnergy >= 85) {
      events.push({
        date: day.date,
        event: 'ハイエナジー・ハーモニックピーク',
        significance: '宇宙エネルギーが最高潮に達する特別な日。重要な決断や創造的活動に最適。',
        influence: 'high' as const
      });
    } else if (day.overallEnergy <= 30) {
      events.push({
        date: day.date,
        event: 'ディープレスト・コズミックバレー',
        significance: '内省と休息のための神聖な時間。魂の深層からのメッセージを受け取る日。',
        influence: 'medium' as const
      });
    }
    
    // 7日ごとに週間転換点を追加
    if ((index + 1) % 7 === 0) {
      events.push({
        date: day.date,
        event: '週間エネルギー転換点',
        significance: '新しい週のエネルギーサイクルが始まる転換期。方向性を見直す好機。',
        influence: 'low' as const
      });
    }
  });
  
  return events;
}

// 成長マイルストーンを生成
function generateGrowthMilestones(
  profile: HarmonicAIProfile,
  cycleForecast: any[]
): string[] {
  
  const milestones = [
    `${profile.userType}の特性を活かした創造的プロジェクトの開始`,
    'ハーモニック共鳴による直感力の飛躍的向上',
    '宇宙的タイミングを意識した重要な人間関係の深化',
    'コズミックエネルギーとの完全な同調状態の体験'
  ];
  
  // プロファイルに基づいてパーソナライズ
  if (profile.harmonicResonance.overall >= 80) {
    milestones.push('ハーモニックマスターレベルでの宇宙的洞察の獲得');
  }
  
  if (profile.relationshipType === 'romantic') {
    milestones.push('パートナーとの魂レベルでの深い結合の実現');
  }
  
  return milestones;
}

// ==================== Helper Functions ==================== //

function calculateHarmonicResonance(
  astrologyProfile: IntegratedAstrologyProfile,
  userType?: Type64,
  aiPersonality?: BaseArchetype
): HarmonicAIProfile['harmonicResonance'] {
  
  const baseResonance = astrologyProfile.typeMateIntegration.resonanceScore;
  
  // TypeMate診断との整合性
  const typeAlignment = userType && aiPersonality ? 
    calculateTypeAstrologyAlignment(userType, astrologyProfile) : 70;
  
  // AI人格との宇宙的同調
  const cosmicSync = aiPersonality ? 
    calculateCosmicSync(aiPersonality, astrologyProfile) : 75;
  
  // 日々のエネルギーマッチ
  const dailyMatch = astrologyProfile.currentMoon.energy * 10;
  
  return {
    overall: Math.round((baseResonance + typeAlignment + cosmicSync) / 3),
    typeAstrologyAlignment: typeAlignment,
    personalityCosmicSync: cosmicSync,
    dailyEnergyMatch: dailyMatch
  };
}

function generateTypeMateIntegration(
  userType: Type64,
  aiPersonality: BaseArchetype,
  relationshipType: string,
  astrologyProfile: IntegratedAstrologyProfile
): DailyHarmonicGuidance['typeMateIntegration'] {
  
  const zodiacName = astrologyProfile.zodiac.details?.nameJa || '星座';
  const numerologyName = astrologyProfile.numerology.info?.name || '数秘術';
  
  return {
    archetypeAdvice: `${aiPersonality}として、${zodiacName}の特質を活かしましょう`,
    relationshipTip: `${relationshipType}関係において、${numerologyName}の道を歩む相手への理解を深めて`,
    personalGrowth: `今日は${astrologyProfile.currentMoon.phase?.phaseNameJa || '月相'}のエネルギーで内面成長を`,
    energyAlignment: `宇宙のエネルギーレベル${astrologyProfile.currentMoon.energy}に合わせて活動しましょう`
  };
}

function generateTimeBasedActions(
  cosmicGuidance: TodayCosmicGuidance,
  moonEnergy: number
): DailyHarmonicGuidance['actionItems'] {
  
  const baseActions = cosmicGuidance.actionItems;
  
  return {
    morning: [
      baseActions[0] || '朝の瞑想で宇宙のエネルギーと同調する',
      `エネルギーレベル${cosmicGuidance.energyForecast.morning}に合わせた活動を`
    ],
    afternoon: [
      baseActions[1] || '午後は創造的な活動に集中する',
      `エネルギーレベル${cosmicGuidance.energyForecast.afternoon}で最大のパフォーマンスを`
    ],
    evening: [
      baseActions[2] || '夜は感謝と振り返りの時間を',
      `エネルギーレベル${cosmicGuidance.energyForecast.evening}で穏やかに過ごす`
    ]
  };
}

function generatePersonalizedAffirmations(
  zodiacSign: any,
  numerologyName: string,
  aiPersonality: BaseArchetype
): string[] {
  
  return [
    `私は${zodiacSign}として生まれた独特の魅力を持っています`,
    `${numerologyName}の道を歩む私には無限の可能性があります`,
    `宇宙のエネルギーが私の成長をサポートしています`,
    `今日という日は私の人生にとって特別な意味があります`,
    `${aiPersonality}の特質が私の内にも輝いています`
  ];
}

function calculateTypeAstrologyAlignment(userType: Type64, astrology: IntegratedAstrologyProfile): number {
  // TypeMate診断と占星術の整合性を計算
  const zodiacArchetypes = astrology.typeMateIntegration.zodiacArchetypes;
  const numerologyArchetypes = astrology.typeMateIntegration.numerologyArchetypes;
  const baseArchetype = userType.split('-')[0];
  
  let score = 60; // 基本スコア
  
  if (zodiacArchetypes.includes(baseArchetype)) score += 20;
  if (numerologyArchetypes.includes(baseArchetype)) score += 20;
  
  return Math.min(100, score);
}

function calculateCosmicSync(aiPersonality: BaseArchetype, astrology: IntegratedAstrologyProfile): number {
  // AI人格と宇宙的エネルギーの同調度
  const moonEnergy = astrology.currentMoon.energy;
  const zodiacElement = astrology.zodiac.element;
  
  let sync = 70; // 基本同調度
  
  // 月のエネルギーレベルによる調整
  if (moonEnergy >= 8) sync += 10; // 高エネルギー時
  else if (moonEnergy <= 3) sync += 5; // 低エネルギー時でも安定
  
  // エレメントによる調整
  const elementBonus = {
    fire: ['HER', 'PIO'].includes(aiPersonality) ? 10 : 0,
    earth: ['GUA', 'DEF'].includes(aiPersonality) ? 10 : 0,
    air: ['ARC', 'SAG'].includes(aiPersonality) ? 10 : 0,
    water: ['DRM', 'ALC'].includes(aiPersonality) ? 10 : 0
  };
  
  sync += elementBonus[zodiacElement] || 5;
  
  return Math.min(100, sync);
}

function calculateHarmonicEnhancement(
  resonance1: HarmonicAIProfile['harmonicResonance'],
  resonance2: HarmonicAIProfile['harmonicResonance']
): number {
  
  // 両者のハーモニックレゾナンスから相互強化効果を計算
  const avgResonance = (resonance1.overall + resonance2.overall) / 2;
  const energyBalance = Math.abs(resonance1.dailyEnergyMatch - resonance2.dailyEnergyMatch);
  
  // エネルギーバランスが良いほど強化効果が高い
  const balanceBonus = Math.max(0, 20 - energyBalance);
  
  return Math.min(100, avgResonance + balanceBonus);
}

function generateDailyHarmonicTheme(day: CycleForecastDay, userType: Type64, dayIndex: number): string {
  const themes = [
    'ハーモニックな新しい始まり',
    '宇宙的エネルギーとの同調',
    'TypeMateの特質を活かす日',
    '内なる声との対話',
    '創造的表現の日',
    '関係性の深化',
    '感謝と振り返りの時'
  ];
  
  return themes[dayIndex] || themes[0];
}

function generateDailyTypeMateAdvice(day: CycleForecastDay, aiPersonality: BaseArchetype): string {
  const personalityAdvice = {
    'ARC': 'アーキテクトとして構造的思考を活かす',
    'SAG': 'セージとして智慧を分かち合う',
    'HER': 'ヒーローとして勇気を持って行動する',
    'DRM': 'ドリーマーとして理想を現実化する',
    'ALC': 'アルケミストとして変容を受け入れる',
    'SOV': 'ソブリンとして自立した判断を',
    'INV': 'イノベーターとして新しい発想を',
    'BAR': 'バードとして表現力を発揮する',
    'GUA': 'ガーディアンとして守るべきものを大切に',
    'DEF': 'ディフェンダーとして安定を維持する',
    'EXE': 'エグゼクティブとして効率的に行動を',
    'PRO': 'プロテクターとして周囲をサポートする',
    'ART': 'アーティストとして創造性を解放する',
    'ARS': 'アーティザンとして丁寧な仕事を',
    'PIO': 'パイオニアとして新しい道を切り開く',
    'PER': 'パフォーマーとして魅力を発揮する'
  };
  
  return personalityAdvice[aiPersonality] || 'あなたの特質を活かして';
}

async function saveHarmonicProfile(profile: HarmonicAIProfile, name?: string): Promise<void> {
  try {
    console.log('💾 Saving harmonic profile for userId:', profile.userId, 'with name:', name);
    
    // まず既存のレコードをチェック
    const { data: existingData } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', profile.userId)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    const upsertData = {
      user_id: profile.userId,
      user_type: profile.userType,
      selected_ai_personality: profile.selectedAiPersonality,
      relationship_type: profile.relationshipType,
      birth_date: profile.astrologyProfile.birthDate ? profile.astrologyProfile.birthDate.toISOString() : null,
      zodiac_sign: profile.astrologyProfile.zodiac.sign,
      zodiac_element: profile.astrologyProfile.zodiac.element,
      life_path_number: profile.astrologyProfile.numerology.lifePathNumber,
      astrology_privacy: profile.privacySettings.shareAstrologyData ? 'public' : 'private',
      display_name: name || null, // ✅ 名前をデータベースに保存
      updated_at: new Date().toISOString()
    };
    
    if (existingData && existingData.length > 0) {
      // 既存レコードを更新
      console.log('📝 Updating existing profile:', existingData[0].id);
      const { error } = await supabase
        .from('user_profiles')
        .update(upsertData)
        .eq('id', existingData[0].id);
      
      if (error) throw error;
    } else {
      // 新規レコード作成
      console.log('✨ Creating new profile');
      const { error } = await supabase
        .from('user_profiles')
        .insert(upsertData);
      
      if (error) throw error;
    }
    
    console.log('✅ Harmonic profile saved successfully');
  } catch (error) {
    console.error('❌ Error saving harmonic profile:', error);
    throw error;
  }
}

function generateProfileId(): string {
  return 'harmonic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
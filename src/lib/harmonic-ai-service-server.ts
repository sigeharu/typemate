// 🌟 Harmonic AI Service (Server-side)
// TypeMate × 占星術統合ハーモニックAIシステム（サーバーサイド専用）

import { createClient } from '@supabase/supabase-js';
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

// Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
 * 🌟 ハーモニックプロファイルを取得（サーバーサイド）
 */
export async function getHarmonicProfileServer(userId: string): Promise<HarmonicAIProfile | null> {
  try {
    console.log('🔍 getHarmonicProfileServer called with userId:', userId);
    
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
    
    // 最新のレコードを取得
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
 * 🌟 今日のハーモニック・ガイダンスを生成（サーバーサイド）
 */
export async function generateDailyHarmonicGuidanceServer(
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
        },
        challenges: ['バランスの調整'],
        opportunities: ['新しい気づきを得るチャンス']
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
  const zodiacArchetypes = astrology.typeMateIntegration.zodiacArchetypes;
  const numerologyArchetypes = astrology.typeMateIntegration.numerologyArchetypes;
  const baseArchetype = userType.split('-')[0];
  
  let score = 60;
  
  if (zodiacArchetypes.includes(baseArchetype)) score += 20;
  if (numerologyArchetypes.includes(baseArchetype)) score += 20;
  
  return Math.min(100, score);
}

function calculateCosmicSync(aiPersonality: BaseArchetype, astrology: IntegratedAstrologyProfile): number {
  const moonEnergy = astrology.currentMoon.energy;
  const zodiacElement = astrology.zodiac.element;
  
  let sync = 70;
  
  if (moonEnergy >= 8) sync += 10;
  else if (moonEnergy <= 3) sync += 5;
  
  const elementBonus = {
    fire: ['HER', 'PIO'].includes(aiPersonality) ? 10 : 0,
    earth: ['GUA', 'DEF'].includes(aiPersonality) ? 10 : 0,
    air: ['ARC', 'SAG'].includes(aiPersonality) ? 10 : 0,
    water: ['DRM', 'ALC'].includes(aiPersonality) ? 10 : 0
  };
  
  sync += elementBonus[zodiacElement] || 5;
  
  return Math.min(100, sync);
}
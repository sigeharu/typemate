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
      .select('*')
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
      birth_date: profile.astrologyProfile.birthDate.toISOString(),
      zodiac_sign: profile.astrologyProfile.zodiac.sign,
      zodiac_element: profile.astrologyProfile.zodiac.element,
      life_path_number: profile.astrologyProfile.numerology.lifePathNumber,
      astrology_privacy: profile.privacySettings.shareAstrologyData ? 'public' : 'private',
      updated_at: new Date().toISOString(),
      ...(name && { display_name: name }) // 名前がある場合のみ追加
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
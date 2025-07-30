// 🎵 TypeMate Type Definitions
// TypeMate 64Type AI恋人チャットサービス用の型定義

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  isUser: boolean;
  sessionId: string;
  archetypeType?: string;
  emotion?: 'happy' | 'excited' | 'calm' | 'thoughtful' | 'caring' | 'playful' | 'focused' | 'supportive';
}

// 64Type診断システム - 独自アーキタイプコード
export type BaseArchetype = 
  | 'ARC' | 'ALC' | 'SOV' | 'INV'  // 分析家
  | 'SAG' | 'DRM' | 'HER' | 'BAR'  // 外交官
  | 'GUA' | 'DEF' | 'EXE' | 'PRO'  // 番人
  | 'ART' | 'ARS' | 'PIO' | 'PER'; // 探検家

// 独自軸システム（MBTI権利問題完全回避）
export type EnergyAxis = 'OUTWARD' | 'INWARD'; // 外向性 / 内向性
export type PerceptionAxis = 'INTUITION' | 'SENSING'; // 直感性 / 感覚性
export type JudgmentAxis = 'THINKING' | 'FEELING'; // 論理性 / 感情性
export type LifestyleAxis = 'JUDGING' | 'PERCEIVING'; // 計画性 / 柔軟性
export type EnvironmentAxis = 'COOPERATIVE' | 'COMPETITIVE'; // 協調性 / 競争性
export type MotivationAxis = 'STABLE' | 'GROWTH'; // 安定性 / 成長性

// 4つの称号システム
export type TitleType = 'HARMONIC' | 'PIONEERING' | 'SOLITARY' | 'CHALLENGING';

// 64タイプシステム
export type FullArchetype64 = `${TitleType}_${BaseArchetype}`;
export type Type64 = `${BaseArchetype}-${EnvironmentAxis}${MotivationAxis}`; // 後方互換性維持

// 診断質問
export interface DiagnosticQuestion {
  id: number;
  axis: 'energy' | 'perception' | 'judgment' | 'lifestyle' | 'environment' | 'motivation';
  question: string;
  optionA: { text: string; trait: string };
  optionB: { text: string; trait: string };
}

// 5段階評価システム
export type DiagnosticScore = -2 | -1 | 0 | 1 | 2;

export interface AxisScore {
  positive: number; // +2, +1のスコア合計
  negative: number; // -2, -1のスコア合計
  neutral: number;  // 0のスコア合計
  total: number;    // 全スコア合計（重み付け後）
  percentage: number; // 正の特性の傾向（0-100%）
  isBalance: boolean; // バランス型判定
}

// 称号データ
export interface TitleData {
  name: string;
  nameEn: string;
  description: string;
  traits: string[];
  characteristics: string;
  approach: string;
  conditions: {
    environment: EnvironmentAxis;
    motivation: MotivationAxis;
  };
}

// 64タイプアーキタイプデータ
export interface ArchetypeData64 {
  base: BaseArchetype;
  title: TitleType;
  name: string;
  nameEn: string;
  fullName: string; // 称号 + ベースアーキタイプ名
  description: string;
  traits: string[];
  titleTraits: string[];
  combinedPersonality: string;
  loveStyle: string;
  uniqueCharm: string;
}

// 拡張された診断結果（64タイプ対応）
export interface DetailedDiagnosisResult {
  type64: Type64;
  fullArchetype64: FullArchetype64;
  title: TitleType;
  baseArchetype: BaseArchetype;
  axisScores: {
    energy: AxisScore & { result: EnergyAxis };
    perception: AxisScore & { result: PerceptionAxis };
    judgment: AxisScore & { result: JudgmentAxis };
    lifestyle: AxisScore & { result: LifestyleAxis };
    environment: AxisScore & { result: EnvironmentAxis };
    motivation: AxisScore & { result: MotivationAxis };
  };
  confidence: number; // 診断の信頼度（0-100%）
  balanceTypes: string[]; // バランス型の軸リスト
}

// アーキタイプデータ
export interface ArchetypeData {
  name: string;
  nameEn: string;
  description: string;
  group: '分析家' | '外交官' | '番人' | '探検家';
  traits: string[];
  strengths: string[];
  challenges: string[];
  compatibility: BaseArchetype[];
  loveStyle: string;
  personality: string;
}

// 関係性進化システム
export interface RelationshipLevel {
  level: number;
  name: string;
  points: number;
  maxPoints: number;
  description: string;
  unlockMessage: string;
  icon: string;
  color: string;
}

export interface RelationshipData {
  currentLevel: RelationshipLevel;
  totalPoints: number;
  dailyStreak: number;
  lastInteraction: Date;
  milestones: string[];
  specialDates: Record<string, Date>;
}

export interface PointEvent {
  type: 'message' | 'deep_conversation' | 'emotion_expression' | 'daily_bonus' | 'special_day';
  points: number;
  description: string;
}

// ==========================================
// 🌟 LifeMate 占星術・スピリチュアル統合システム
// ==========================================

// 占星術エレメント
export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

// 星座（12星座）
export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// 中国干支
export type ChineseZodiac = 
  | 'rat' | 'ox' | 'tiger' | 'rabbit'
  | 'dragon' | 'snake' | 'horse' | 'goat'
  | 'monkey' | 'rooster' | 'dog' | 'pig';

// プライバシー設定
export type AstrologyPrivacy = 'public' | 'friends' | 'private';

// 出生時間精度
export type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown';

// 気分タイプ（拡張版）
export type MoodType = 
  | '😊' | '😢' | '😠' | '😰' | '🥳' | '😴' | '💭' | '🥺' | '😌' | '❤️';

// 時間帯
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// 月の位相
export type MoonPhase = 
  | 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous'
  | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

// 宇宙的イベントタイプ
export type CosmicEventType = 
  | 'mercury_retrograde' | 'venus_retrograde' | 'mars_retrograde'
  | 'full_moon' | 'new_moon' | 'eclipse' | 'conjunction'
  | 'season_change' | 'planetary_transit';

// ガイダンスタイプ
export type GuidanceType = 'daily' | 'weekly' | 'monthly' | 'special_event';

// 重要度レベル
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

// ==========================================
// 拡張されたユーザープロファイル
// ==========================================

export interface ExtendedUserProfile {
  // 既存のTypemate情報
  userType: Type64;
  fullArchetype64: FullArchetype64;
  selectedAiPersonality?: BaseArchetype;
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor';
  
  // 占星術・スピリチュアル情報
  birthDate?: Date;
  birthTime?: string; // "HH:MM" format
  birthLocation?: string; // "City, Country" format
  zodiacSign?: ZodiacSign;
  zodiacElement?: ZodiacElement;
  lifePathNumber?: number; // 1-9
  chineseZodiac?: ChineseZodiac;
  moonSign?: ZodiacSign; // 詳細占星術
  risingSign?: ZodiacSign; // 詳細占星術
  
  // プライバシー設定
  astrologyPrivacy: AstrologyPrivacy;
  birthTimeAccuracy: BirthTimeAccuracy;
  
  // メタデータ
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 気分・エネルギー記録システム
// ==========================================

export interface MoodEnergyLog {
  id: string;
  userId: string;
  
  // 気分データ
  moodType: MoodType;
  moodIntensity: number; // 1-10
  energyLevel: number; // 1-10
  
  // コンテキスト
  contextNote?: string;
  weatherCondition?: string;
  timeOfDay: TimeOfDay;
  
  // 宇宙的要素
  moonPhase?: MoonPhase;
  cosmicEnergyScore?: number; // 1-10
  
  // タイムスタンプ
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 宇宙的イベントシステム
// ==========================================

export interface CosmicEvent {
  id: string;
  
  // イベント情報
  eventType: CosmicEventType;
  eventName: string;
  eventDescription?: string;
  
  // 日時
  startDate: Date;
  endDate?: Date;
  peakTime?: Date;
  
  // 影響度
  globalImpactScore: number; // 1-10
  archetypeImpacts?: Record<BaseArchetype, number>; // 各archetypeへの影響度
  
  // メタデータ
  createdAt: Date;
}

// ==========================================
// 個人別宇宙的ガイダンス
// ==========================================

export interface PersonalCosmicGuidance {
  id: string;
  userId: string;
  
  // ガイダンス内容
  guidanceType: GuidanceType;
  title: string;
  message: string;
  advice?: string;
  
  // 関連要素
  relatedArchetype?: BaseArchetype;
  relatedZodiac?: ZodiacSign;
  cosmicEventId?: string;
  
  // 精度・重要度
  accuracyScore: number; // 1-10
  importanceLevel: ImportanceLevel;
  
  // ユーザー反応
  userRating?: number; // 1-5
  userFeedback?: string;
  wasHelpful?: boolean;
  
  // 日時
  guidanceDate: Date;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

// ==========================================
// シンクロニシティ発見システム
// ==========================================

export interface SynchronicityEvent {
  id: string;
  userId: string;
  
  // シンクロニシティ内容
  userExperience: string; // ユーザーの体験・気分
  cosmicCorrelation: string; // 対応する宇宙的イベント
  archetypeConnection?: string; // TypeMate診断との関連
  meaningInterpretation: string; // 意味の解釈
  
  // 強度・確信度
  synchronicityStrength: number; // 1-10
  confidenceLevel: number; // 1-10
  
  // 関連データ
  moodLogId?: string;
  cosmicEventId?: string;
  relatedMessageId?: string;
  
  // ユーザー反応
  userAcknowledged: boolean;
  userFoundMeaningful?: boolean;
  userNotes?: string;
  
  // タイムスタンプ
  eventDate: Date;
  createdAt: Date;
}

// ==========================================
// 統合されたコズミック・プロファイル
// ==========================================

export interface CosmicProfile {
  // TypeMate独自診断
  baseArchetype: BaseArchetype;
  titleType: TitleType;
  fullArchetype64: FullArchetype64;
  
  // 占星術データ
  zodiacSign?: ZodiacSign;
  zodiacElement?: ZodiacElement;
  chineseZodiac?: ChineseZodiac;
  lifePathNumber?: number;
  
  // 詳細占星術（オプション）
  moonSign?: ZodiacSign;
  risingSign?: ZodiacSign;
  
  // 統合パーソナリティ
  cosmicPersonality: string; // 宇宙的個性統合
  currentEnergyPhase: string; // 現在のエネルギー位相
  
  // 最新状態
  lastMoodUpdate?: Date;
  lastGuidanceUpdate?: Date;
  recentSynchronicities: number;
}

// ==========================================
// 今日のコズミック・ガイダンス
// ==========================================

export interface DailyCosmicGuidance {
  date: Date;
  
  // 総合運勢
  overallEnergy: number; // 1-10
  primaryMessage: string;
  
  // 詳細ガイダンス
  archetypeAdvice: string; // TypeMate診断ベース
  zodiacAdvice?: string; // 星座ベース
  moonPhaseAdvice?: string; // 月の位相ベース
  
  // 実用的アドバイス
  recommendedActions: string[];
  cautionAreas: string[];
  luckyElement?: string;
  
  // 関連イベント
  relevantCosmicEvents: CosmicEvent[];
  potentialSynchronicities?: string;
}

// ==========================================
// 占い統合システム（既存との互換性維持）
// ==========================================

export interface AstrologyData {
  birthDate: Date;
  zodiacSign: string;
  zodiacElement: string;
  chineseZodiac: string;
  luckyColor: string;
  luckyNumber: number;
  dailyFortune: {
    overall: number;
    love: number;
    work: number;
    health: number;
    message: string;
    advice: string;
  };
  compatibility: number;
}

// 🌟 新しい統合システム（AstrologyDataの上位互換）
export interface IntegratedAstrologyData extends AstrologyData {
  // コズミック・プロファイル統合
  cosmicProfile: CosmicProfile;
  
  // リアルタイム宇宙データ
  currentMoonPhase: MoonPhase;
  activeCosmicEvents: CosmicEvent[];
  
  // 個人別ガイダンス
  todayGuidance: DailyCosmicGuidance;
  upcomingGuidance: PersonalCosmicGuidance[];
  
  // シンクロニシティ履歴
  recentSynchronicities: SynchronicityEvent[];
  synchronicityPattern?: string;
}

// ==========================================
// 🌟 Enhanced Astrology System (New Implementation)
// ==========================================

// 新しい統合占星術プロファイル
export interface IntegratedAstrologyProfile {
  birthDate: Date;
  zodiac: {
    sign: ZodiacSign;
    element: ZodiacElement;
    details: any;
    confidence: number;
  };
  numerology: {
    lifePathNumber: number;
    info: any;
    calculation: string;
    isMasterNumber: boolean;
  };
  currentMoon: {
    phase: any;
    energy: number;
    influence: any;
    zodiacCombination: any;
  };
  typeMateIntegration: {
    zodiacArchetypes: string[];
    numerologyArchetypes: string[];
    resonanceScore: number;
    spiritualAlignment: string;
  };
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

// 強化された相性分析
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

// 月のエネルギー詳細情報
export interface MoonEnergyInfo {
  level: number; // 1-10
  type: 'manifesting' | 'releasing' | 'growing' | 'reflecting';
  description: string;
  recommendations: string[];
  affirmations: string[];
}

// 月の影響詳細
export interface MoonInfluence {
  emotional: string;
  physical: string;
  spiritual: string;
  relationships: string;
  creativity: string;
  manifestation: string;
}

// 月の位相詳細情報
export interface MoonPhaseInfo {
  phase: MoonPhase;
  phaseName: string;
  phaseNameJa: string;
  illumination: number;
  age: number;
  energy: MoonEnergyInfo;
  influence: MoonInfluence;
  nextPhaseDate: Date;
  nextPhaseName: string;
  isWaxing: boolean;
}

// 星座詳細情報
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

// ライフパスナンバー詳細情報
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

// コズミックガイダンス
export interface TodayCosmicGuidance {
  cosmicWeather: string;
  personalMessage: string;
  actionItems: string[];
  energyForecast: { morning: number; afternoon: number; evening: number };
  luckyElements: { color: string; number: number; direction: string };
  challenges: string[];
  opportunities: string[];
}

// サイクル予測
export interface CycleForecastDay {
  date: Date;
  overallEnergy: number;
  primaryTheme: string;
  recommendations: string[];
  challenges: string[];
  opportunities: string[];
}

// 思い出システム
export interface Memory {
  id: string;
  content: string;
  originalMessage: string;
  timestamp: Date;
  emotionScore: number;
  weight: number;
  category: 'first' | 'special' | 'growth' | 'emotion' | 'milestone' | 'confession' | 'support';
  relationshipLevel: number;
  references: number;
  keywords: string[];
  context: {
    userType: string;
    aiPersonality: string;
    timeOfDay: string;
    conversationTurn: number;
  };
  isHighlight: boolean;
}

export interface MemoryCollection {
  memories: Memory[];
  totalCount: number;
  highlightMemories: Memory[];
  categoryStats: Record<Memory['category'], number>;
  monthlyStats: { [monthKey: string]: number };
}

// 特別イベントシステム
export interface SpecialEvent {
  id: string;
  name: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'valentine' | 'christmas' | 'new_year' | 'white_day' | 'custom';
  relationshipLevelRequired: number;
  message: string;
  isRecurring: boolean;
  category: 'personal' | 'seasonal' | 'relationship';
  priority: 'high' | 'medium' | 'low';
  customData?: {
    icon?: string;
    color?: string;
    description?: string;
  };
}

export interface EventNotification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  type: 'upcoming' | 'today' | 'missed';
}

// 個人情報
export interface PersonalInfo {
  name: string;
  birthday?: string;
}

// メモリシステム
export interface MemorySystem {
  memories: Memory[];
  totalCount: number;
  lastUpdated: Date;
}

// テストプロファイル
export interface TestProfile {
  name: string;
  userType: Type64;
  aiPersonality: BaseArchetype;
  description: string;
}


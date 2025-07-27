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

export type EnvironmentAxis = 'A' | 'C'; // 協調 / 競争
export type MotivationAxis = 'S' | 'G';  // 安定 / 成長

export type Type64 = `${BaseArchetype}-${EnvironmentAxis}${MotivationAxis}`;

// 診断質問
export interface DiagnosticQuestion {
  id: number;
  axis: 'energy' | 'perception' | 'judgment' | 'lifestyle' | 'environment' | 'motivation';
  question: string;
  optionA: { text: string; trait: string };
  optionB: { text: string; trait: string };
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

// 占い統合システム
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


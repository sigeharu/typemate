// 🎵 TypeMate Type Definitions
// TypeMate 64Type AI恋人チャットサービス用の型定義

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
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


// 🎵 TypeMate Type Definitions
// TypeMate AI恋人チャットサービス用の型定義

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mbtiType?: string;
}

export type MBTIType = 
  | 'ENFP' | 'INFP' | 'ENFJ' | 'INFJ'
  | 'ENTP' | 'INTP' | 'ENTJ' | 'INTJ'
  | 'ESFP' | 'ISFP' | 'ESFJ' | 'ISFJ'
  | 'ESTP' | 'ISTP' | 'ESTJ' | 'ISTJ';

export interface MBTITypeData {
  name: string;
  description: string;
  color: string;
  traits: string[];
  personality: string;
  loveStyle: string;
}
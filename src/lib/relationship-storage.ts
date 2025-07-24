// 💾 TypeMate Relationship Storage System
// 関係性データ永続化

import { RelationshipData, AstrologyData } from '@/types';

const RELATIONSHIP_STORAGE_KEY = 'typemate-relationship';
const ASTROLOGY_STORAGE_KEY = 'typemate-astrology';

// 関係性データの初期値
export const DEFAULT_RELATIONSHIP_DATA: RelationshipData = {
  currentLevel: 1,
  totalPoints: 0,
  dailyStreak: 0,
  lastInteraction: new Date(),
  milestones: ['TypeMateとの出会い'],
  specialDates: {
    firstMeeting: new Date()
  }
};

// 関係性データの保存
export function saveRelationshipData(data: RelationshipData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RELATIONSHIP_STORAGE_KEY, JSON.stringify({
      ...data,
      lastInteraction: data.lastInteraction.toISOString(),
      specialDates: Object.fromEntries(
        Object.entries(data.specialDates).map(([key, date]) => [key, date.toISOString()])
      )
    }));
  } catch (error) {
    console.error('Failed to save relationship data:', error);
  }
}

// 関係性データの読み込み
export function loadRelationshipData(): RelationshipData {
  if (typeof window === 'undefined') return DEFAULT_RELATIONSHIP_DATA;
  try {
    const stored = localStorage.getItem(RELATIONSHIP_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_RELATIONSHIP_DATA;
    }
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastInteraction: new Date(parsed.lastInteraction),
      specialDates: Object.fromEntries(
        Object.entries(parsed.specialDates).map(([key, date]) => [key, new Date(date as string)])
      )
    };
  } catch (error) {
    console.error('Failed to load relationship data:', error);
    return DEFAULT_RELATIONSHIP_DATA;
  }
}

// 占いデータの保存
export function saveAstrologyData(data: Partial<AstrologyData>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadAstrologyData();
    const updated = { ...existing, ...data };
    
    localStorage.setItem(ASTROLOGY_STORAGE_KEY, JSON.stringify({
      ...updated,
      birthDate: updated.birthDate ? updated.birthDate.toISOString() : null
    }));
  } catch (error) {
    console.error('Failed to save astrology data:', error);
  }
}

// 占いデータの読み込み
export function loadAstrologyData(): Partial<AstrologyData> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(ASTROLOGY_STORAGE_KEY);
    if (!stored) {
      return {};
    }
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      birthDate: parsed.birthDate ? new Date(parsed.birthDate) : undefined
    };
  } catch (error) {
    console.error('Failed to load astrology data:', error);
    return {};
  }
}

// 特別な日付の追加
export function addSpecialDate(key: string, date: Date): void {
  const data = loadRelationshipData();
  data.specialDates[key] = date;
  saveRelationshipData(data);
}

// マイルストーンの追加
export function addMilestone(milestone: string): void {
  const data = loadRelationshipData();
  data.milestones.push(milestone);
  saveRelationshipData(data);
}

// 統計情報の取得
export function getRelationshipStats(): {
  daysTogeter: number;
  totalMessages: number;
  currentStreak: number;
  favoriteTime: string;
} {
  const data = loadRelationshipData();
  const firstMeeting = data.specialDates.firstMeeting || new Date();
  const daysTogether = Math.floor((new Date().getTime() - firstMeeting.getTime()) / (1000 * 60 * 60 * 24));
  
  // メッセージ数は概算（ポイントから逆算）
  const totalMessages = Math.floor(data.totalPoints / 2);
  
  return {
    daysTogeter: daysTogether,
    totalMessages,
    currentStreak: data.dailyStreak,
    favoriteTime: '夜' // 将来的に実装
  };
}

// データのリセット（デバッグ用）
export function resetRelationshipData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RELATIONSHIP_STORAGE_KEY);
  localStorage.removeItem(ASTROLOGY_STORAGE_KEY);
}
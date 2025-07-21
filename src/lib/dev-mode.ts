// 🔧 TypeMate Development Mode
// 開発者モード - AIテストを効率化

import type { Type64, BaseArchetype } from '@/types';

// 開発者モード判定
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DEV_MODE === 'true';
};

// テストプロファイル定義
export interface TestProfile {
  userType: Type64;
  aiPersonality: BaseArchetype;
  name: string;
  description: string;
  testScenario: string;
}

// テストユーザー設定
export const TEST_PROFILES = {
  'しげちゃん': {
    userType: 'BAR-AS' as Type64,
    aiPersonality: 'SAG' as BaseArchetype,
    name: 'しげちゃん（ENFP・創造型）',
    description: '音楽的センス・創造性重視のENFPタイプ',
    testScenario: '創造的な会話、音楽の話題、感情豊かな表現'
  },
  'INTJ': {
    userType: 'ARC-CG' as Type64,
    aiPersonality: 'HER' as BaseArchetype,
    name: 'INTJ設計主タイプ',
    description: '論理的思考・戦略的な設計主タイプ',
    testScenario: '深い分析、将来計画、戦略的な会話'
  },
  'ISFP': {
    userType: 'ARS-AS' as Type64,
    aiPersonality: 'INV' as BaseArchetype,
    name: 'ISFP芸術家タイプ',
    description: '感性豊か・調和重視の芸術家タイプ',
    testScenario: '美的な話題、感情的サポート、優しい会話'
  },
  'ENTP': {
    userType: 'INV-CG' as Type64,
    aiPersonality: 'ARC' as BaseArchetype,
    name: 'ENTP発明家タイプ',
    description: 'アイデア豊富・論理的な発明家タイプ',
    testScenario: '新しいアイデア、理論的議論、革新的な提案'
  },
  'ISFJ': {
    userType: 'DEF-AS' as Type64,
    aiPersonality: 'BAR' as BaseArchetype,
    name: 'ISFJ守護者タイプ',
    description: '思いやり深い・安定重視の守護者タイプ',
    testScenario: '温かいサポート、安心感、共感的な会話'
  }
} as const;

export type TestProfileKey = keyof typeof TEST_PROFILES;

// クイック設定
export const setTestProfile = (profileKey: TestProfileKey): TestProfile => {
  const profile = TEST_PROFILES[profileKey];
  
  // ローカルストレージに保存
  localStorage.setItem('userType64', profile.userType);
  localStorage.setItem('test_ai_personality', profile.aiPersonality);
  localStorage.setItem('test_profile_name', profile.name);
  localStorage.setItem('test_mode_active', 'true');
  
  console.log(`🎯 テストプロファイル設定: ${profile.name}`);
  console.log(`   ユーザー: ${profile.userType} | AI: ${profile.aiPersonality}`);
  console.log(`   シナリオ: ${profile.testScenario}`);
  
  return profile;
};

// テストモードの状態確認
export const isTestModeActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('test_mode_active') === 'true';
};

// テストプロファイル情報の取得
export const getCurrentTestProfile = (): TestProfile | null => {
  if (typeof window === 'undefined') return null;
  
  const userType = localStorage.getItem('userType64') as Type64;
  const aiPersonality = localStorage.getItem('test_ai_personality') as BaseArchetype;
  const profileName = localStorage.getItem('test_profile_name');
  
  if (!userType || !aiPersonality || !profileName) return null;
  
  // プロファイルを逆引きで検索
  for (const [key, profile] of Object.entries(TEST_PROFILES)) {
    if (profile.userType === userType && profile.aiPersonality === aiPersonality) {
      return profile;
    }
  }
  
  // カスタムプロファイルの場合
  return {
    userType,
    aiPersonality,
    name: profileName,
    description: 'カスタムテストプロファイル',
    testScenario: '自由テスト'
  };
};

// テストモードリセット
export const resetTestMode = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('test_ai_personality');
  localStorage.removeItem('test_profile_name');
  localStorage.removeItem('test_mode_active');
  
  console.log('🔄 テストモードをリセットしました');
};

// 開発用デバッグ情報
export const getDebugInfo = () => {
  if (!isDevelopmentMode()) return null;
  
  return {
    isDevelopmentMode: isDevelopmentMode(),
    isTestModeActive: isTestModeActive(),
    currentProfile: getCurrentTestProfile(),
    availableProfiles: Object.keys(TEST_PROFILES),
    storageData: {
      userType: localStorage.getItem('userType64'),
      aiPersonality: localStorage.getItem('test_ai_personality'),
      profileName: localStorage.getItem('test_profile_name')
    }
  };
};

// テスト用ダミーデータ生成
export const generateTestMemories = () => {
  const testMemories = [
    {
      content: '音楽について話したとき、すごく盛り上がったね！',
      emotionScore: 8,
      category: 'special' as const,
      keywords: ['音楽', '盛り上がった']
    },
    {
      content: '初めて会ったときのこと、覚えてる？',
      emotionScore: 7,
      category: 'first' as const,
      keywords: ['初めて', '会った']
    },
    {
      content: 'あなたのことが好きです',
      emotionScore: 10,
      category: 'confession' as const,
      keywords: ['好き']
    }
  ];
  
  return testMemories;
};

// 開発用ログ出力
export const devLog = (message: string, data?: unknown) => {
  if (!isDevelopmentMode()) return;
  
  console.log(`🔧 [DEV] ${message}`, data || '');
};

// テスト用関係性ポイント設定
export const setTestRelationshipPoints = (points: number): void => {
  if (!isDevelopmentMode()) return;
  
  const relationshipData = {
    currentLevel: Math.min(6, Math.floor(points / 50) + 1),
    totalPoints: points,
    dailyStreak: Math.floor(points / 10),
    lastInteraction: new Date(),
    milestones: [`テストで${points}ポイント到達`],
    specialDates: {
      firstMeeting: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1週間前
    }
  };
  
  localStorage.setItem('typemate-relationship', JSON.stringify(relationshipData));
  devLog(`関係性ポイントを${points}に設定`, relationshipData);
};
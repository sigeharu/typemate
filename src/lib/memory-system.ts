// 💝 TypeMate Memory System
// 思い出システムコア - AIパートナーとの特別な瞬間を永続記憶

import { v4 as uuidv4 } from 'uuid';

export interface Memory {
  id: string;
  content: string;
  originalMessage: string;
  timestamp: Date;
  emotionScore: number;    // 感動値 1-10
  weight: number;          // 重み付け 1-10
  category: 'first' | 'special' | 'growth' | 'emotion' | 'milestone' | 'confession' | 'support';
  relationshipLevel: number;
  references: number;      // 参照回数
  keywords: string[];      // 抽出キーワード
  context: {
    userType: string;
    aiPersonality: string;
    timeOfDay: string;
    conversationTurn: number;
  };
  isHighlight: boolean;    // 特別にハイライトする思い出
}

export interface MemoryWeightConfig {
  emotionKeywords: { [key: string]: number };    // 感情キーワードの重み
  firstTimeBonus: number;                        // 初回体験ボーナス
  milestoneBonus: number;                        // 節目ボーナス
  timeDecay: number;                             // 時間による減衰
  referenceBonus: number;                        // 参照による強化
  confessionBonus: number;                       // 告白系ボーナス
  supportBonus: number;                          // 支援・励まし系ボーナス
}

export interface MemoryCollection {
  memories: Memory[];
  totalCount: number;
  highlightMemories: Memory[];
  categoryStats: Record<Memory['category'], number>;
  monthlyStats: { [monthKey: string]: number };
}

// 感情キーワードと重み設定
export const EMOTION_KEYWORDS: { [key: string]: number } = {
  // 愛情・恋愛関係
  '好き': 9, '愛してる': 10, '大切': 8, '特別': 8, '愛している': 10,
  'すき': 9, 'だいすき': 9, '大好き': 9, 'ずっと': 8, '永遠': 9,
  
  // 感動・喜び
  '嬉しい': 7, '幸せ': 8, '感動': 9, '最高': 7, 'やったー': 6,
  'うれしい': 7, 'しあわせ': 8, 'さいこう': 7, 'ありがとう': 6,
  
  // 深い感情
  '感謝': 7, '信頼': 8, '絆': 9, '思い出': 8, '記念': 7,
  '初めて': 8, 'はじめて': 8, '一緒': 6, 'いっしょ': 6,
  
  // 困難・支援
  '辛い': 7, '悲しい': 7, '支えて': 8, '助けて': 7, '寂しい': 6,
  'つらい': 7, 'かなしい': 7, 'さびしい': 6, '頑張る': 6,
  
  // 将来・夢
  '夢': 7, '将来': 7, '目標': 6, '希望': 6, '一緒にいたい': 9,
  'いっしょにいたい': 9, 'ずっといたい': 9, '結婚': 9, 'けっこん': 9
};

// 思い出カテゴリーの判定
export function categorizeMemory(content: string, emotionScore: number, isFirstTime: boolean = false): Memory['category'] {
  const lowerContent = content.toLowerCase();
  
  // 告白・愛情表現
  if (/好き|愛してる|愛している|だいすき|大好き/.test(lowerContent)) {
    return 'confession';
  }
  
  // 初回体験
  if (isFirstTime || /初めて|はじめて|最初/.test(lowerContent)) {
    return 'first';
  }
  
  // 支援・励まし
  if (/辛い|悲しい|支えて|助けて|頑張る|つらい|かなしい/.test(lowerContent)) {
    return 'support';
  }
  
  // 節目・記念
  if (/記念|節目|達成|成功|卒業|合格/.test(lowerContent)) {
    return 'milestone';
  }
  
  // 成長
  if (/成長|変化|学んだ|気づいた|わかった/.test(lowerContent)) {
    return 'growth';
  }
  
  // 高い感情スコアは特別な思い出
  if (emotionScore >= 8) {
    return 'special';
  }
  
  // それ以外は感情カテゴリー
  return 'emotion';
}

// 感情スコアの計算
export function calculateEmotionScore(content: string): number {
  let score = 0;
  let matchCount = 0;
  
  for (const [keyword, weight] of Object.entries(EMOTION_KEYWORDS)) {
    if (content.includes(keyword)) {
      score += weight;
      matchCount++;
    }
  }
  
  // 感嘆符・絵文字による加算
  const exclamationCount = (content.match(/[!！]/g) || []).length;
  const emojiCount = (content.match(/[😊😄😍🥰😘💕💖💝💗💓💞💘❤️✨🌟]/g) || []).length;
  
  score += exclamationCount * 0.5;
  score += emojiCount * 1;
  
  // 長い文章ほど感情が込もっている
  if (content.length > 50) score += 1;
  if (content.length > 100) score += 1;
  
  // 最終スコアを1-10に正規化
  if (matchCount === 0 && exclamationCount === 0 && emojiCount === 0) {
    return Math.max(1, Math.min(3, score)); // 普通の会話
  }
  
  return Math.max(1, Math.min(10, Math.round(score / Math.max(1, matchCount))));
}

// キーワード抽出
export function extractKeywords(content: string): string[] {
  const keywords: string[] = [];
  
  // 感情キーワード
  for (const keyword of Object.keys(EMOTION_KEYWORDS)) {
    if (content.includes(keyword)) {
      keywords.push(keyword);
    }
  }
  
  // その他の重要キーワード
  const importantPatterns = [
    /趣味|好み|興味/,
    /家族|友達|仕事/,
    /音楽|映画|本|ゲーム/,
    /食べ物|料理|カフェ/,
    /旅行|散歩|ドライブ/,
    /勉強|資格|仕事/,
    /天気|季節|時間/
  ];
  
  for (const pattern of importantPatterns) {
    const match = content.match(pattern);
    if (match) {
      keywords.push(match[0]);
    }
  }
  
  return [...new Set(keywords)]; // 重複除去
}

// 思い出の重み計算
export function calculateMemoryWeight(
  memory: Memory,
  config: MemoryWeightConfig
): number {
  let weight = memory.emotionScore;
  
  // カテゴリーボーナス
  switch (memory.category) {
    case 'first':
      weight += config.firstTimeBonus;
      break;
    case 'milestone':
      weight += config.milestoneBonus;
      break;
    case 'confession':
      weight += config.confessionBonus;
      break;
    case 'support':
      weight += config.supportBonus;
      break;
    case 'special':
      weight += 2;
      break;
  }
  
  // 参照による強化
  weight += memory.references * config.referenceBonus;
  
  // 時間による減衰（ただし、重要な思い出は減衰しにくい）
  const daysSince = Math.floor((Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24));
  const decayResistance = memory.emotionScore >= 8 ? 0.5 : 1; // 高感情は減衰耐性
  weight *= Math.max(0.3, 1 - (daysSince * config.timeDecay * decayResistance));
  
  return Math.max(1, Math.min(10, weight));
}

// デフォルト設定
export const DEFAULT_MEMORY_CONFIG: MemoryWeightConfig = {
  emotionKeywords: EMOTION_KEYWORDS,
  firstTimeBonus: 2,
  milestoneBonus: 1.5,
  timeDecay: 0.01, // 1日ごとに1%減衰
  referenceBonus: 0.2,
  confessionBonus: 3,
  supportBonus: 2
};

// 思い出作成
export function createMemory(
  content: string,
  originalMessage: string,
  context: Memory['context'],
  relationshipLevel: number
): Memory {
  const emotionScore = calculateEmotionScore(content);
  const keywords = extractKeywords(content);
  const category = categorizeMemory(content, emotionScore);
  
  return {
    id: uuidv4(),
    content,
    originalMessage,
    timestamp: new Date(),
    emotionScore,
    weight: emotionScore, // 初期重みは感情スコアと同じ
    category,
    relationshipLevel,
    references: 0,
    keywords,
    context,
    isHighlight: emotionScore >= 8 || category === 'confession' || category === 'milestone'
  };
}

// 思い出の検索
export function searchMemories(
  memories: Memory[],
  query: string,
  category?: Memory['category'],
  limit: number = 10
): Memory[] {
  const lowerQuery = query.toLowerCase();
  
  return memories
    .filter(memory => {
      const matchesContent = memory.content.toLowerCase().includes(lowerQuery) ||
                           memory.keywords.some(k => k.toLowerCase().includes(lowerQuery));
      const matchesCategory = !category || memory.category === category;
      return matchesContent && matchesCategory;
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

// 関連する思い出の取得
export function getRelatedMemories(
  memories: Memory[],
  currentKeywords: string[],
  limit: number = 3
): Memory[] {
  return memories
    .filter(memory => 
      memory.keywords.some(keyword => 
        currentKeywords.some(current => 
          current.includes(keyword) || keyword.includes(current)
        )
      )
    )
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

// 月別統計の生成
export function generateMonthlyStats(memories: Memory[]): { [monthKey: string]: number } {
  const stats: { [monthKey: string]: number } = {};
  
  memories.forEach(memory => {
    const monthKey = `${memory.timestamp.getFullYear()}-${String(memory.timestamp.getMonth() + 1).padStart(2, '0')}`;
    stats[monthKey] = (stats[monthKey] || 0) + 1;
  });
  
  return stats;
}

// 思い出コレクションの作成
export function createMemoryCollection(memories: Memory[]): MemoryCollection {
  const categoryStats: Record<Memory['category'], number> = {
    first: 0,
    special: 0,
    growth: 0,
    emotion: 0,
    milestone: 0,
    confession: 0,
    support: 0
  };
  
  memories.forEach(memory => {
    categoryStats[memory.category]++;
  });
  
  return {
    memories: memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    totalCount: memories.length,
    highlightMemories: memories.filter(m => m.isHighlight),
    categoryStats,
    monthlyStats: generateMonthlyStats(memories)
  };
}
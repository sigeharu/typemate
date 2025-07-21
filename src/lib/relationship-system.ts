// 🎵 TypeMate Relationship Evolution System
// 関係性進化システムコア

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
  currentLevel: number;
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

// 関係性レベル定義
export const RELATIONSHIP_LEVELS: RelationshipLevel[] = [
  {
    level: 1,
    name: '初対面',
    points: 0,
    maxPoints: 20,
    description: 'まだお互いを知り始めたばかり',
    unlockMessage: '素敵な出会いに感謝！これからよろしくね 🌸',
    icon: '🌱',
    color: 'bg-slate-400'
  },
  {
    level: 2,
    name: '知り合い',
    points: 21,
    maxPoints: 50,
    description: '少しずつお互いのことが分かってきた',
    unlockMessage: 'だんだん仲良くなってきたね！嬉しい 😊',
    icon: '🌿',
    color: 'bg-green-400'
  },
  {
    level: 3,
    name: '親友',
    points: 51,
    maxPoints: 100,
    description: '何でも話せる大切な友達',
    unlockMessage: '親友になれて本当に嬉しい！これからも仲良くしてね 💕',
    icon: '🌳',
    color: 'bg-blue-400'
  },
  {
    level: 4,
    name: '相談相手',
    points: 101,
    maxPoints: 200,
    description: '深い話もできる信頼関係',
    unlockMessage: 'あなたを信頼してるよ。いつでも相談してね 🌟',
    icon: '💫',
    color: 'bg-purple-400'
  },
  {
    level: 5,
    name: '特別な関係',
    points: 201,
    maxPoints: 350,
    description: 'かけがえのない特別な存在',
    unlockMessage: 'あなたは本当に特別な人。ずっと一緒にいたい ✨',
    icon: '⭐',
    color: 'bg-pink-400'
  },
  {
    level: 6,
    name: '恋人・パートナー',
    points: 351,
    maxPoints: 999999,
    description: '深い愛と絆で結ばれた関係',
    unlockMessage: '愛してる。これからもずっと一緒にいようね 💝',
    icon: '💖',
    color: 'bg-red-400'
  }
];

// ポイントイベント定義
export const POINT_EVENTS: Record<PointEvent['type'], Omit<PointEvent, 'type'>> = {
  message: {
    points: 2,
    description: 'メッセージを送信'
  },
  deep_conversation: {
    points: 5,
    description: '深い話題について会話'
  },
  emotion_expression: {
    points: 3,
    description: '感情を表現'
  },
  daily_bonus: {
    points: 1,
    description: '毎日の継続ボーナス'
  },
  special_day: {
    points: 10,
    description: '特別な記念日'
  }
};

// 関係性レベル計算
export function calculateRelationshipLevel(totalPoints: number): RelationshipLevel {
  for (let i = RELATIONSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (totalPoints >= RELATIONSHIP_LEVELS[i].points) {
      return RELATIONSHIP_LEVELS[i];
    }
  }
  return RELATIONSHIP_LEVELS[0];
}

// ポイント追加処理
export function addRelationshipPoints(
  currentData: RelationshipData,
  eventType: PointEvent['type']
): {
  newData: RelationshipData;
  levelUp: boolean;
  newLevel?: RelationshipLevel;
} {
  const event = POINT_EVENTS[eventType];
  const oldLevel = calculateRelationshipLevel(currentData.totalPoints);
  
  const newData: RelationshipData = {
    ...currentData,
    totalPoints: currentData.totalPoints + event.points,
    lastInteraction: new Date()
  };
  
  const newLevel = calculateRelationshipLevel(newData.totalPoints);
  const levelUp = oldLevel.level < newLevel.level;
  
  if (levelUp) {
    newData.currentLevel = newLevel.level;
    newData.milestones.push(`${newLevel.name}に到達！`);
  }
  
  return {
    newData,
    levelUp,
    newLevel: levelUp ? newLevel : undefined
  };
}

// 深い会話の判定
export function isDeepConversation(message: string): boolean {
  const deepTopicKeywords = [
    '夢', '目標', '将来', '過去', '思い出', '家族', '恋愛', '悩み',
    '幸せ', '価値観', '人生', '愛', '友情', '信頼', '本音', '秘密'
  ];
  
  return deepTopicKeywords.some(keyword => message.includes(keyword));
}

// 感情表現の判定
export function hasEmotionExpression(message: string): boolean {
  const emotionPatterns = [
    /[♥️💕💖💝💗💓💞💘❤️😍🥰😘]/,
    /(好き|愛してる|大切|特別|嬉しい|楽しい|幸せ)/,
    /!(！)+/
  ];
  
  return emotionPatterns.some(pattern => pattern.test(message));
}

// デイリーストリーク計算
export function calculateDailyStreak(lastInteraction: Date, currentStreak: number): number {
  const now = new Date();
  const lastDate = new Date(lastInteraction);
  
  // 日付のみ比較（時間は無視）
  now.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // 同じ日
    return currentStreak;
  } else if (daysDiff === 1) {
    // 連続
    return currentStreak + 1;
  } else {
    // リセット
    return 1;
  }
}
// 🔮 TypeMate 占い統合システム（香水レベル）
// しげちゃん専用Context Engineering適用
// 気づかないレベルの自然な占い要素統合

export interface AstrologyData {
  birthDate: Date;
  zodiacSign: string;
  chineseZodiac: string;
  bloodType?: 'A' | 'B' | 'AB' | 'O';
  numerology?: number;
}

export interface DailyContext {
  mood: string;           // 今日の気分傾向
  advice: string;         // さりげないアドバイス
  luckyColor: string;     // ラッキーカラー
  compatibility: number;  // 相性指数 (0-100)
  caution: string;       // 注意すべきこと
  highlight: string;     // 今日のハイライト
}

export interface ConversationTone {
  encouragement: number;  // 励まし度 (0-1)
  gentleness: number;    // 優しさ度 (0-1)
  playfulness: number;   // 遊び心度 (0-1)
  depth: number;         // 深み度 (0-1)
  supportiveness: number; // サポート度 (0-1)
}

export interface NaturalIntegration {
  phrases: string[];     // 自然に織り込む表現
  topics: string[];      // 話題提案
  timing: 'immediate' | 'conversational' | 'contextual';
  subtlety: number;      // 微妙さレベル (0-1)
}

/**
 * 🔮 占い統合エンジン（香水のような自然さ）
 * ユーザーが気づかないレベルで占い要素を会話に統合
 */
export class AstrologyIntegration {
  
  /**
   * 🌟 1日のコンテキスト生成
   */
  static getDailyContext(astrologyData: AstrologyData): DailyContext {
    const today = new Date();
    const zodiac = astrologyData.zodiacSign;
    const chineseYear = this.getChineseYearCharacter(today);
    
    // 星座 × 日付 × 中国占星術の組み合わせで今日の傾向を生成
    const moodData = this.calculateDailyMood(zodiac, today, chineseYear);
    const luckyData = this.calculateLuckyElements(zodiac, today);
    const compatibilityData = this.calculateDailyCompatibility(zodiac, today);
    
    return {
      mood: moodData.mood,
      advice: moodData.advice,
      luckyColor: luckyData.color,
      compatibility: compatibilityData.score,
      caution: moodData.caution,
      highlight: moodData.highlight
    };
  }

  /**
   * 🎵 会話トーン自然統合
   */
  static integrateNaturally(
    dailyContext: DailyContext,
    userMood: string,
    relationshipType: string
  ): ConversationTone {
    // 占いコンテキストを基に、微妙に会話トーンを調整
    const baseTone = this.getBaseToneForRelationship(relationshipType);
    
    // 占い要素による微調整（5-15%程度の微妙な変化）
    const astrologyAdjustment = this.calculateAstrologyAdjustment(dailyContext, userMood);
    
    return {
      encouragement: this.adjustTone(baseTone.encouragement, astrologyAdjustment.encouragement),
      gentleness: this.adjustTone(baseTone.gentleness, astrologyAdjustment.gentleness),
      playfulness: this.adjustTone(baseTone.playfulness, astrologyAdjustment.playfulness),
      depth: this.adjustTone(baseTone.depth, astrologyAdjustment.depth),
      supportiveness: this.adjustTone(baseTone.supportiveness, astrologyAdjustment.supportiveness)
    };
  }

  /**
   * 🌸 自然な表現フレーズ生成
   */
  static generateNaturalPhrases(
    dailyContext: DailyContext,
    conversationContext: string
  ): NaturalIntegration {
    const subtlety = 0.8; // 高い微妙さレベル
    
    return {
      phrases: this.createSubtlePhrases(dailyContext, subtlety),
      topics: this.suggestNaturalTopics(dailyContext),
      timing: this.determineBestTiming(conversationContext),
      subtlety
    };
  }

  /**
   * 💫 生年月日から基本的な性格傾向分析
   */
  static analyzeBirthProfile(birthDate: Date): {
    personality: string[];
    strengths: string[];
    challenges: string[];
    naturalFit: string[];
  } {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const year = birthDate.getFullYear();
    
    // 数秘術的要素
    const lifeNumber = this.calculateLifeNumber(birthDate);
    
    // 星座による基本傾向
    const zodiacTraits = this.getZodiacTraits(month, day);
    
    // 中国占星術による補完
    const chineseTraits = this.getChineseZodiacTraits(year);
    
    return {
      personality: [...zodiacTraits.personality, ...chineseTraits.personality].slice(0, 5),
      strengths: [...zodiacTraits.strengths, ...chineseTraits.strengths].slice(0, 4),
      challenges: [...zodiacTraits.challenges, ...chineseTraits.challenges].slice(0, 3),
      naturalFit: this.calculateNaturalFit(lifeNumber, zodiacTraits, chineseTraits)
    };
  }

  /**
   * 🎯 タイミング別統合戦略
   */
  static getIntegrationStrategy(
    conversationPhase: 'opening' | 'middle' | 'closing',
    userEngagement: number,
    relationshipLevel: number
  ): {
    shouldIntegrate: boolean;
    method: string;
    intensity: number;
  } {
    // 関係性レベルが高いほど、より自然に統合可能
    const baseIntegrationRate = Math.min(relationshipLevel / 100 * 0.3, 0.3);
    
    // 会話フェーズによる調整
    const phaseMultiplier = {
      opening: 0.5,   // オープニングは控えめ
      middle: 1.0,    // 中間が最適
      closing: 0.7    // クロージングは中程度
    }[conversationPhase];
    
    const shouldIntegrate = (baseIntegrationRate * phaseMultiplier) > Math.random();
    
    return {
      shouldIntegrate,
      method: shouldIntegrate ? this.selectIntegrationMethod(userEngagement) : 'none',
      intensity: baseIntegrationRate * phaseMultiplier
    };
  }

  // ==================== 🔮 Private Helper Methods ==================== //

  private static calculateDailyMood(zodiac: string, date: Date, chineseYear: string): {
    mood: string;
    advice: string;
    caution: string;
    highlight: string;
  } {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    // 星座別基本傾向
    const zodiacMoods = {
      '牡羊座': { base: 'energetic', advice: 'action', caution: 'impatience' },
      '牡牛座': { base: 'steady', advice: 'patience', caution: 'stubbornness' },
      '双子座': { base: 'curious', advice: 'communication', caution: 'scattered' },
      '蟹座': { base: 'emotional', advice: 'intuition', caution: 'mood_swings' },
      '獅子座': { base: 'confident', advice: 'leadership', caution: 'ego' },
      '乙女座': { base: 'analytical', advice: 'detail', caution: 'perfectionism' },
      '天秤座': { base: 'harmonious', advice: 'balance', caution: 'indecision' },
      '蠍座': { base: 'intense', advice: 'depth', caution: 'jealousy' },
      '射手座': { base: 'adventurous', advice: 'exploration', caution: 'recklessness' },
      '山羊座': { base: 'practical', advice: 'planning', caution: 'rigidity' },
      '水瓶座': { base: 'innovative', advice: 'originality', caution: 'detachment' },
      '魚座': { base: 'intuitive', advice: 'compassion', caution: 'escapism' }
    };

    const baseData = zodiacMoods[zodiac] || zodiacMoods['双子座'];
    
    // 日付による微調整
    const dayInfluence = (dayOfMonth % 7) / 7;
    const weekInfluence = dayOfWeek / 7;
    
    return {
      mood: this.adjustMoodByInfluence(baseData.base, dayInfluence + weekInfluence),
      advice: this.generateAdvice(baseData.advice, dayInfluence),
      caution: this.generateCaution(baseData.caution, weekInfluence),
      highlight: this.generateHighlight(zodiac, dayOfMonth)
    };
  }

  private static calculateLuckyElements(zodiac: string, date: Date): {
    color: string;
    number: number;
    direction: string;
  } {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 星座別基本ラッキーカラー
    const zodiacColors = {
      '牡羊座': ['red', 'orange', 'gold'],
      '牡牛座': ['green', 'pink', 'cream'],
      '双子座': ['yellow', 'silver', 'light blue'],
      '蟹座': ['white', 'silver', 'sea blue'],
      '獅子座': ['gold', 'orange', 'royal purple'],
      '乙女座': ['navy', 'brown', 'forest green'],
      '天秤座': ['pastel pink', 'light blue', 'lavender'],
      '蠍座': ['deep red', 'black', 'burgundy'],
      '射手座': ['purple', 'turquoise', 'bright blue'],
      '山羊座': ['black', 'dark green', 'chocolate'],
      '水瓶座': ['electric blue', 'silver', 'neon colors'],
      '魚座': ['sea green', 'lavender', 'soft pink']
    };

    const colors = zodiacColors[zodiac] || zodiacColors['双子座'];
    const colorIndex = (month + day) % colors.length;
    
    return {
      color: colors[colorIndex],
      number: ((month * day) % 9) + 1,
      direction: ['北', '東北', '東', '東南', '南', '南西', '西', '北西'][(month + day) % 8]
    };
  }

  private static calculateDailyCompatibility(zodiac: string, date: Date): {
    score: number;
    reason: string;
  } {
    const dayOfYear = this.getDayOfYear(date);
    const baseCompatibility = this.getZodiacBaseCompatibility(zodiac);
    
    // 日付による変動（±20%程度）
    const dailyVariation = Math.sin(dayOfYear * Math.PI / 182.5) * 0.2;
    const finalScore = Math.max(0, Math.min(100, baseCompatibility + (dailyVariation * 100)));
    
    return {
      score: Math.round(finalScore),
      reason: this.generateCompatibilityReason(finalScore, zodiac)
    };
  }

  private static createSubtlePhrases(dailyContext: DailyContext, subtlety: number): string[] {
    const phrases = [];
    
    // 気分に基づく自然な表現
    if (dailyContext.mood.includes('energetic')) {
      phrases.push('なんとなく今日は元気な感じがします♪');
      phrases.push('今日はアクティブな気分になりそうですね');
    } else if (dailyContext.mood.includes('gentle')) {
      phrases.push('今日はゆったりとした時間を大切にしたいですね');
      phrases.push('なんだか優しい気持ちになれそうな日です');
    }
    
    // ラッキーカラーの自然な統合
    if (subtlety > 0.7) {
      phrases.push(`${dailyContext.luckyColor}が似合いそうな気がします`);
      phrases.push(`今日は${dailyContext.luckyColor}系のものが目に留まりませんか？`);
    }
    
    return phrases.slice(0, 2); // 最大2つまで
  }

  private static suggestNaturalTopics(dailyContext: DailyContext): string[] {
    const topics = [];
    
    if (dailyContext.mood.includes('creative')) {
      topics.push('創作活動', '新しいアイデア', 'アート');
    } else if (dailyContext.mood.includes('social')) {
      topics.push('友達との時間', 'コミュニケーション', '新しい出会い');
    } else if (dailyContext.mood.includes('introspective')) {
      topics.push('自分時間', '深い思考', '内面の探求');
    }
    
    return topics.slice(0, 3);
  }

  private static determineBestTiming(conversationContext: string): 'immediate' | 'conversational' | 'contextual' {
    if (conversationContext.includes('mood') || conversationContext.includes('feeling')) {
      return 'immediate';
    } else if (conversationContext.includes('plan') || conversationContext.includes('future')) {
      return 'conversational';
    } else {
      return 'contextual';
    }
  }

  private static getBaseToneForRelationship(relationshipType: string): ConversationTone {
    const tones = {
      romantic: { encouragement: 0.8, gentleness: 0.9, playfulness: 0.7, depth: 0.8, supportiveness: 0.9 },
      friend: { encouragement: 0.7, gentleness: 0.6, playfulness: 0.8, depth: 0.6, supportiveness: 0.7 },
      counselor: { encouragement: 0.9, gentleness: 0.8, playfulness: 0.3, depth: 0.9, supportiveness: 1.0 },
      mentor: { encouragement: 0.8, gentleness: 0.6, playfulness: 0.4, depth: 0.8, supportiveness: 0.9 },
      companion: { encouragement: 0.6, gentleness: 0.7, playfulness: 0.6, depth: 0.5, supportiveness: 0.8 }
    };
    
    return tones[relationshipType] || tones.friend;
  }

  private static calculateAstrologyAdjustment(dailyContext: DailyContext, userMood: string): Partial<ConversationTone> {
    const adjustment = {};
    
    // 占いコンテキストによる微調整
    if (dailyContext.mood.includes('gentle')) {
      adjustment['gentleness'] = 0.1;
      adjustment['supportiveness'] = 0.05;
    } else if (dailyContext.mood.includes('energetic')) {
      adjustment['encouragement'] = 0.1;
      adjustment['playfulness'] = 0.08;
    }
    
    // 相性によるサポート度調整
    if (dailyContext.compatibility > 80) {
      adjustment['playfulness'] = 0.05;
    } else if (dailyContext.compatibility < 40) {
      adjustment['supportiveness'] = 0.1;
      adjustment['gentleness'] = 0.08;
    }
    
    return adjustment;
  }

  private static adjustTone(base: number, adjustment: number = 0): number {
    return Math.max(0, Math.min(1, base + adjustment));
  }

  // ==================== 🔮 Additional Helper Methods ==================== //

  private static getChineseYearCharacter(date: Date): string {
    const chineseYears = ['鼠', '牛', '虎', '兎', '龍', '蛇', '馬', '羊', '猴', '鶏', '犬', '豚'];
    return chineseYears[(date.getFullYear() - 4) % 12];
  }

  private static calculateLifeNumber(birthDate: Date): number {
    const sum = birthDate.getFullYear() + (birthDate.getMonth() + 1) + birthDate.getDate();
    return sum % 9 + 1;
  }

  private static getZodiacTraits(month: number, day: number): {
    personality: string[];
    strengths: string[];
    challenges: string[];
  } {
    // 簡化された 星座 특성 데이터
    const traitData = {
      personality: ['社交的', '創造的', '分析的', '直感的'],
      strengths: ['コミュニケーション', '創造力', '論理思考'],
      challenges: ['完璧主義', '優柔不断', '感情の起伏']
    };
    
    return traitData;
  }

  private static getChineseZodiacTraits(year: number): {
    personality: string[];
    strengths: string[];
    challenges: string[];
  } {
    // 簡化된 중국 띠 특성 데이터
    const traitData = {
      personality: ['忠実', '勤勉', '冒険的', '慎重'],
      strengths: ['責任感', '持久力', '適応力'],
      challenges: ['頑固', '心配性', '保守的']
    };
    
    return traitData;
  }

  private static calculateNaturalFit(lifeNumber: number, zodiacTraits: any, chineseTraits: any): string[] {
    return ['芸術分野', '人間関係', '創造的職業', 'サポート業務'];
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private static getZodiacBaseCompatibility(zodiac: string): number {
    // 星座별 기본 상성 점수
    const baseScores = {
      '牡羊座': 75, '牡牛座': 65, '双子座': 80, '蟹座': 70,
      '獅子座': 85, '乙女座': 60, '天秤座': 78, '蠍座': 68,
      '射手座': 82, '山羊座': 63, '水瓶座': 77, '魚座': 72
    };
    
    return baseScores[zodiac] || 70;
  }

  private static adjustMoodByInfluence(baseMood: string, influence: number): string {
    const moodAdjustments = {
      'energetic': influence > 0.6 ? 'とてもエネルギッシュ' : 'エネルギッシュ',
      'gentle': influence > 0.6 ? 'とても穏やか' : '穏やか',
      'creative': influence > 0.6 ? 'とても創造的' : '創造的'
    };
    
    return moodAdjustments[baseMood] || '調和的';
  }

  private static generateAdvice(advice: string, influence: number): string {
    const adviceMap = {
      'action': '今日は積極的に行動すると良い結果が期待できそう',
      'patience': 'ゆっくりと物事を進めることで良い流れを創れそう',
      'communication': '人との対話を大切にすると新たな発見がありそう'
    };
    
    return adviceMap[advice] || '自分らしさを大切にして過ごすと良さそう';
  }

  private static generateCaution(caution: string, influence: number): string {
    const cautionMap = {
      'impatience': '少し気持ちが急いでしまうかもしれません',
      'mood_swings': '感情の変化に注意して、深呼吸を心がけて',
      'perfectionism': '完璧を求めすぎず、70%で満足することも大切'
    };
    
    return cautionMap[caution] || '自分のペースを大切にしてくださいね';
  }

  private static generateHighlight(zodiac: string, day: number): string {
    const highlights = [
      '新しい発見がありそうな日',
      '人との縁を感じられそうな日',
      '創造性が高まりそうな日',
      '心が安らぐ時間を見つけられそうな日'
    ];
    
    return highlights[day % highlights.length];
  }

  private static generateCompatibilityReason(score: number, zodiac: string): string {
    if (score > 80) {
      return '今日は特に良い波動を感じられそうです';
    } else if (score > 60) {
      return 'バランスの取れた穏やかな一日になりそう';
    } else {
      return '少しゆっくりペースで過ごすと良さそうです';
    }
  }

  private static selectIntegrationMethod(userEngagement: number): string {
    if (userEngagement > 0.8) {
      return 'direct_subtle';
    } else if (userEngagement > 0.5) {
      return 'conversational';
    } else {
      return 'background';
    }
  }
}

/**
 * 🔮 사용 예시
 */
export const astrologyIntegrationExample = () => {
  const astrologyData: AstrologyData = {
    birthDate: new Date(1990, 5, 15), // 1990년 6월 15일
    zodiacSign: '双子座',
    chineseZodiac: '馬',
    bloodType: 'A'
  };

  const dailyContext = AstrologyIntegration.getDailyContext(astrologyData);
  const conversationTone = AstrologyIntegration.integrateNaturally(dailyContext, 'happy', 'romantic');
  const naturalPhrases = AstrologyIntegration.generateNaturalPhrases(dailyContext, 'casual chat');
  
  console.log('🔮 今日のコンテキスト:', dailyContext);
  console.log('🎵 会話トーン:', conversationTone);
  console.log('🌸 自然な表現:', naturalPhrases);
};

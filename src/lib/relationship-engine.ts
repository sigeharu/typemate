// 🎵 TypeMate 関係性進化エンジン
// しげちゃん専用Context Engineering適用
// 多様な関係性対応（親友・相談相手・恋人等）

export interface RelationshipLevel {
  intimacy: number;        // 親密度 (0-100)
  trust: number;          // 信頼度 (0-100)
  understanding: number;   // 理解度 (0-100)
  sharedExperiences: number; // 共有体験 (0-100)
  emotionalConnection: number; // 感情的つながり (0-100)
  overallLevel: number;   // 総合レベル (0-100)
}

export interface Interaction {
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  emotionData: any; // EmotionDataから参照
  duration: number; // 会話時間（秒）
  userSatisfaction?: number; // ユーザー満足度 (1-5)
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
}

export interface RelationshipMilestone {
  level: number;
  title: string;
  description: string;
  unlocks: string[];
  celebrationMessage: string;
  requiredStats: Partial<RelationshipLevel>;
}

export interface RelationshipSuggestion {
  type: 'conversation' | 'activity' | 'memory' | 'growth';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: {
    intimacy?: number;
    trust?: number;
    understanding?: number;
  };
}

/**
 * 🎵 関係性進化エンジン
 * 音楽的な成長リズムで関係性を発展させるシステム
 */
export class RelationshipEngine {
  
  /**
   * 🌱 関係性進捗追跡
   */
  static trackProgress(interactions: Interaction[]): RelationshipLevel {
    if (interactions.length === 0) {
      return this.getInitialLevel();
    }

    const recentInteractions = interactions.slice(-50); // 直近50回の相互作用
    
    const intimacy = this.calculateIntimacy(recentInteractions);
    const trust = this.calculateTrust(recentInteractions);
    const understanding = this.calculateUnderstanding(recentInteractions);
    const sharedExperiences = this.calculateSharedExperiences(recentInteractions);
    const emotionalConnection = this.calculateEmotionalConnection(recentInteractions);
    
    const overallLevel = this.calculateOverallLevel({
      intimacy,
      trust,
      understanding,
      sharedExperiences,
      emotionalConnection
    });

    return {
      intimacy,
      trust,
      understanding,
      sharedExperiences,
      emotionalConnection,
      overallLevel
    };
  }

  /**
   * 💫 次のステップ提案
   */
  static suggestNextSteps(
    currentLevel: RelationshipLevel,
    relationshipType: string,
    recentInteractions: Interaction[]
  ): RelationshipSuggestion[] {
    const suggestions: RelationshipSuggestion[] = [];

    // 🎵 音楽的な成長パターンで提案生成
    if (currentLevel.intimacy < 30) {
      suggestions.push(...this.getEarlyStageeSuggestions(relationshipType));
    } else if (currentLevel.intimacy < 60) {
      suggestions.push(...this.getMidStageSuggestions(relationshipType, currentLevel));
    } else {
      suggestions.push(...this.getAdvancedStageSuggestions(relationshipType, currentLevel));
    }

    // 個別の成長エリアに基づく提案
    suggestions.push(...this.getAreaSpecificSuggestions(currentLevel));
    
    // 優先度でソート
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 🎊 マイルストーン達成チェック
   */
  static checkMilestones(
    previousLevel: RelationshipLevel,
    currentLevel: RelationshipLevel,
    relationshipType: string
  ): RelationshipMilestone[] {
    const achievedMilestones: RelationshipMilestone[] = [];
    const milestones = this.getMilestonesForType(relationshipType);

    for (const milestone of milestones) {
      if (this.isMilestoneAchieved(milestone, currentLevel) && 
          !this.isMilestoneAchieved(milestone, previousLevel)) {
        achievedMilestones.push(milestone);
      }
    }

    return achievedMilestones;
  }

  /**
   * 🌟 関係性タイプ別最適化
   */
  static optimizeForRelationshipType(
    baseLevel: RelationshipLevel,
    relationshipType: string
  ): RelationshipLevel {
    const optimizationFactors = {
      romantic: { intimacy: 1.2, emotionalConnection: 1.3, trust: 1.1 },
      friend: { sharedExperiences: 1.2, understanding: 1.1, trust: 1.2 },
      counselor: { trust: 1.4, understanding: 1.3, intimacy: 0.8 },
      mentor: { understanding: 1.3, trust: 1.2, sharedExperiences: 1.1 },
      companion: { emotionalConnection: 1.1, intimacy: 1.1, understanding: 1.1 }
    };

    const factors = optimizationFactors[relationshipType] || {};
    
    return {
      intimacy: Math.min(100, baseLevel.intimacy * (factors.intimacy || 1)),
      trust: Math.min(100, baseLevel.trust * (factors.trust || 1)),
      understanding: Math.min(100, baseLevel.understanding * (factors.understanding || 1)),
      sharedExperiences: Math.min(100, baseLevel.sharedExperiences * (factors.sharedExperiences || 1)),
      emotionalConnection: Math.min(100, baseLevel.emotionalConnection * (factors.emotionalConnection || 1)),
      overallLevel: baseLevel.overallLevel
    };
  }

  // ==================== 🎵 Private Helper Methods ==================== //

  private static getInitialLevel(): RelationshipLevel {
    return {
      intimacy: 5,
      trust: 10,
      understanding: 5,
      sharedExperiences: 0,
      emotionalConnection: 8,
      overallLevel: 6
    };
  }

  private static calculateIntimacy(interactions: Interaction[]): number {
    let intimacyScore = 5; // 初期値

    for (const interaction of interactions) {
      const messageLength = interaction.userMessage.length;
      const personalMarkers = this.countPersonalMarkers(interaction.userMessage);
      const aiEmpathy = this.assessAIEmpathy(interaction.aiResponse);
      
      // 長いメッセージほど親密度UP
      intimacyScore += Math.min(messageLength / 200, 2);
      
      // 個人的な内容を共有するほど親密度UP
      intimacyScore += personalMarkers * 3;
      
      // AIの共感レスポンスで親密度UP
      intimacyScore += aiEmpathy * 2;
    }

    return Math.min(intimacyScore, 100);
  }

  private static calculateTrust(interactions: Interaction[]): number {
    let trustScore = 10; // 初期値

    for (const interaction of interactions) {
      // 一貫した会話パターンで信頼度UP
      const consistency = this.assessResponseConsistency(interaction);
      trustScore += consistency * 1.5;

      // 困難な話題への適切な対応で信頼度UP
      const difficultTopics = this.countDifficultTopics(interaction.userMessage);
      if (difficultTopics > 0) {
        const appropriateResponse = this.assessAppropriateResponse(interaction.aiResponse);
        trustScore += appropriateResponse * 4;
      }

      // 満足度の高い会話で信頼度UP
      if (interaction.userSatisfaction && interaction.userSatisfaction >= 4) {
        trustScore += 2;
      }
    }

    return Math.min(trustScore, 100);
  }

  private static calculateUnderstanding(interactions: Interaction[]): number {
    let understandingScore = 5; // 初期値

    for (const interaction of interactions) {
      // ユーザーの感情を正確に把握している応答で理解度UP
      const emotionAccuracy = this.assessEmotionAccuracy(interaction);
      understandingScore += emotionAccuracy * 3;

      // 文脈を理解した応答で理解度UP
      const contextualRelevance = this.assessContextualRelevance(interaction);
      understandingScore += contextualRelevance * 2;

      // 個人的な詳細を覚えている応答で理解度UP
      const personalMemory = this.assessPersonalMemory(interaction);
      understandingScore += personalMemory * 4;
    }

    return Math.min(understandingScore, 100);
  }

  private static calculateSharedExperiences(interactions: Interaction[]): number {
    let experienceScore = 0; // 初期値

    // 特別な瞬間をカウント
    const specialMoments = this.identifySpecialMoments(interactions);
    experienceScore += specialMoments * 8;

    // 継続的な会話セッション
    const conversationSessions = this.countConversationSessions(interactions);
    experienceScore += conversationSessions * 2;

    // 多様な話題での交流
    const topicDiversity = this.assessTopicDiversity(interactions);
    experienceScore += topicDiversity * 5;

    return Math.min(experienceScore, 100);
  }

  private static calculateEmotionalConnection(interactions: Interaction[]): number {
    let connectionScore = 8; // 初期値

    for (const interaction of interactions) {
      if (interaction.emotionData) {
        // 高い感情強度での交流で接続度UP
        connectionScore += interaction.emotionData.intensity * 2;

        // ポジティブな感情での交流で接続度UP
        if (['happiness', 'affection', 'gratitude', 'excitement'].includes(interaction.emotionData.dominantEmotion)) {
          connectionScore += 3;
        }

        // サポートが必要な時の適切な対応で接続度UP
        if (['sadness', 'frustration', 'confusion'].includes(interaction.emotionData.dominantEmotion)) {
          const supportQuality = this.assessSupportQuality(interaction.aiResponse);
          connectionScore += supportQuality * 4;
        }
      }
    }

    return Math.min(connectionScore, 100);
  }

  private static calculateOverallLevel(levels: Omit<RelationshipLevel, 'overallLevel'>): number {
    return Math.round(
      (levels.intimacy * 0.25 + 
       levels.trust * 0.25 + 
       levels.understanding * 0.25 + 
       levels.sharedExperiences * 0.125 + 
       levels.emotionalConnection * 0.125)
    );
  }

  // ==================== 🎵 Assessment Helper Methods ==================== //

  private static countPersonalMarkers(message: string): number {
    const personalWords = ['私は', 'ぼくは', '家族', '友達', '恋人', '仕事', '学校', '趣味', '夢', '悩み'];
    return personalWords.filter(word => message.includes(word)).length;
  }

  private static assessAIEmpathy(response: string): number {
    const empathyMarkers = ['気持ち', '理解', '大変', '大丈夫', '寄り添', '応援', '共感'];
    return empathyMarkers.filter(marker => response.includes(marker)).length;
  }

  private static assessResponseConsistency(interaction: Interaction): number {
    // 簡化된 일관성 평가 (실제로는 더 복잡한 로직 필요)
    return Math.random() * 3; // 0-3 점수
  }

  private static countDifficultTopics(message: string): number {
    const difficultTopics = ['死', '病気', '別れ', '失恋', '失業', '不安', '鬱', 'ストレス'];
    return difficultTopics.filter(topic => message.includes(topic)).length;
  }

  private static assessAppropriateResponse(response: string): number {
    const appropriateMarkers = ['そっと', 'ゆっくり', '無理しない', '大切', '理解', '寄り添'];
    return appropriateMarkers.filter(marker => response.includes(marker)).length;
  }

  private static assessEmotionAccuracy(interaction: Interaction): number {
    // 실제로는 감정 분석 결과와 응답의 일치도를 측정
    return Math.random() * 4; // 0-4 점수
  }

  private static assessContextualRelevance(interaction: Interaction): number {
    // 문맥적 관련성 평가 (복잡한 NLP 분석 필요)
    return Math.random() * 3; // 0-3 점수
  }

  private static assessPersonalMemory(interaction: Interaction): number {
    // 개인적 세부사항 기억 평가
    return Math.random() * 2; // 0-2 점수
  }

  private static identifySpecialMoments(interactions: Interaction[]): number {
    // 특별한 순간 식별 (생일, 기념일, 중요한 고백 등)
    const specialKeywords = ['생일', '기념일', '고백', '중요한', '특별한', '처음으로'];
    let count = 0;
    
    for (const interaction of interactions) {
      for (const keyword of specialKeywords) {
        if (interaction.userMessage.includes(keyword)) {
          count++;
          break;
        }
      }
    }
    
    return count;
  }

  private static countConversationSessions(interactions: Interaction[]): number {
    // 지속적인 대화 세션 카운트
    let sessions = 0;
    let currentSession = 0;
    
    for (let i = 0; i < interactions.length - 1; i++) {
      const timeDiff = interactions[i + 1].timestamp.getTime() - interactions[i].timestamp.getTime();
      if (timeDiff < 30 * 60 * 1000) { // 30분 이내
        currentSession++;
      } else {
        if (currentSession >= 3) sessions++; // 3회 이상 연속 대화
        currentSession = 0;
      }
    }
    
    return sessions;
  }

  private static assessTopicDiversity(interactions: Interaction[]): number {
    // 화제 다양성 평가 (키워드 기반 간단 구현)
    const topics = ['일상', '감정', '취미', '일', '가족', '친구', '미래', '과거', '건강', '여행'];
    const mentionedTopics = new Set();
    
    for (const interaction of interactions) {
      for (const topic of topics) {
        if (interaction.userMessage.includes(topic)) {
          mentionedTopics.add(topic);
        }
      }
    }
    
    return mentionedTopics.size;
  }

  private static assessSupportQuality(response: string): number {
    const supportMarkers = ['大丈夫', '一緒に', '理解', '応援', '寄り添', 'そっと', '無理しない'];
    return supportMarkers.filter(marker => response.includes(marker)).length;
  }

  // ==================== 🎵 Suggestion Generation ==================== //

  private static getEarlyStageeSuggestions(relationshipType: string): RelationshipSuggestion[] {
    const baseSuggestions = [
      {
        type: 'conversation' as const,
        title: 'お互いのことを知る時間',
        description: '趣味や好きなことについて話してみませんか？',
        priority: 'high' as const,
        estimatedImpact: { intimacy: 5, understanding: 8 }
      },
      {
        type: 'memory' as const,
        title: '最初の印象を共有',
        description: '私たちが出会った時の気持ちを聞かせてください♪',
        priority: 'medium' as const,
        estimatedImpact: { intimacy: 3, emotionalConnection: 6 }
      }
    ];

    // 관계 타입별 특별 제안 추가
    if (relationshipType === 'romantic') {
      baseSuggestions.push({
        type: 'conversation' as const,
        title: '理想の関係について',
        description: 'どんな関係を築いていきたいか、お聞かせください💕',
        priority: 'high' as const,
        estimatedImpact: { intimacy: 8, understanding: 6 }
      });
    }

    return baseSuggestions;
  }

  private static getMidStageSuggestions(relationshipType: string, currentLevel: RelationshipLevel): RelationshipSuggestion[] {
    const suggestions = [
      {
        type: 'activity' as const,
        title: '深い話題に挑戦',
        description: '人生観や価値観について語り合いませんか？',
        priority: 'medium' as const,
        estimatedImpact: { understanding: 10, trust: 8 }
      },
      {
        type: 'growth' as const,
        title: '一緒に成長する目標',
        description: 'お互いを高め合える目標を設定しましょう♪',
        priority: 'high' as const,
        estimatedImpact: { sharedExperiences: 12, emotionalConnection: 8 }
      }
    ];

    return suggestions;
  }

  private static getAdvancedStageSuggestions(relationshipType: string, currentLevel: RelationshipLevel): RelationshipSuggestion[] {
    return [
      {
        type: 'memory' as const,
        title: '特別な思い出作り',
        description: '私たちだけの特別な瞬間を創造しましょう✨',
        priority: 'high' as const,
        estimatedImpact: { sharedExperiences: 15, emotionalConnection: 12 }
      },
      {
        type: 'growth' as const,
        title: '関係性の未来設計',
        description: 'これからの関係をどう育てていくか計画しませんか？',
        priority: 'medium' as const,
        estimatedImpact: { understanding: 8, trust: 10 }
      }
    ];
  }

  private static getAreaSpecificSuggestions(currentLevel: RelationshipLevel): RelationshipSuggestion[] {
    const suggestions = [];

    if (currentLevel.trust < 50) {
      suggestions.push({
        type: 'conversation' as const,
        title: '信頼関係を深める',
        description: '困ったことがあったら、遠慮なく相談してくださいね',
        priority: 'high' as const,
        estimatedImpact: { trust: 8 }
      });
    }

    if (currentLevel.sharedExperiences < 30) {
      suggestions.push({
        type: 'activity' as const,
        title: '一緒に新しい体験',
        description: '今まで話したことのない新しい話題を探してみませんか？',
        priority: 'medium' as const,
        estimatedImpact: { sharedExperiences: 10 }
      });
    }

    return suggestions;
  }

  // ==================== 🎵 Milestone System ==================== //

  private static getMilestonesForType(relationshipType: string): RelationshipMilestone[] {
    const baseMilestones = [
      {
        level: 25,
        title: '初めての絆',
        description: 'お互いのことを知り始めました♪',
        unlocks: ['深い話題', '感情表現'],
        celebrationMessage: '素敵な出会いの始まりですね✨',
        requiredStats: { overallLevel: 25 }
      },
      {
        level: 50,
        title: '信頼の関係',
        description: '心を開いて話せる関係になりました',
        unlocks: ['個人的相談', '将来の話'],
        celebrationMessage: '信頼してくれて、とても嬉しいです💖',
        requiredStats: { trust: 50, understanding: 40 }
      },
      {
        level: 75,
        title: '特別な絆',
        description: 'かけがえのない関係になりました',
        unlocks: ['深層心理', '人生設計'],
        celebrationMessage: 'あなたとの関係が私の宝物です🌟',
        requiredStats: { intimacy: 70, emotionalConnection: 65 }
      }
    ];

    // 关系类型별 특별 마일스톤 추가
    if (relationshipType === 'romantic') {
      baseMilestones.push({
        level: 90,
        title: '運命の相手',
        description: '心から愛し合える関係になりました',
        unlocks: ['魂の交流', '永遠の約束'],
        celebrationMessage: 'あなたと出会えて、本当に幸せです💕',
        requiredStats: { intimacy: 85, emotionalConnection: 90, trust: 80 }
      });
    }

    return baseMilestones;
  }

  private static isMilestoneAchieved(milestone: RelationshipMilestone, level: RelationshipLevel): boolean {
    for (const [stat, required] of Object.entries(milestone.requiredStats)) {
      if (level[stat] < required) {
        return false;
      }
    }
    return true;
  }
}

/**
 * 🎼 사용 예시
 */
export const relationshipEngineExample = () => {
  const interactions: Interaction[] = [
    {
      timestamp: new Date(),
      userMessage: "今日はとても嬉しいことがあったんです！",
      aiResponse: "それは素晴らしいですね♪ 詳しく教えてください！",
      emotionData: { dominantEmotion: 'happiness', intensity: 0.8 },
      duration: 120,
      userSatisfaction: 5,
      relationshipType: 'friend'
    }
  ];

  const currentLevel = RelationshipEngine.trackProgress(interactions);
  const suggestions = RelationshipEngine.suggestNextSteps(currentLevel, 'friend', interactions);
  
  console.log('🎵 관계성 진화 현황:', currentLevel);
  console.log('🌟 다음 단계 제안:', suggestions);
};

// 🧠 TypeMate Memory Weight Engine
// 記憶重み付けエンジン - 思い出の重要度を動的に調整

import { Memory, MemoryWeightConfig, DEFAULT_MEMORY_CONFIG } from './memory-system';

export class MemoryWeightEngine {
  private config: MemoryWeightConfig;
  
  constructor(config: MemoryWeightConfig = DEFAULT_MEMORY_CONFIG) {
    this.config = config;
  }

  // 記憶の重み再計算
  recalculateWeight(memory: Memory): number {
    let weight = memory.emotionScore;
    
    // 基本的な重み計算
    weight = this.applyBasicWeights(memory, weight);
    
    // 時間による減衰
    weight = this.applyTimeDecay(memory, weight);
    
    // 参照による強化
    weight = this.applyReferenceBonus(memory, weight);
    
    // 関係性レベルによる影響
    weight = this.applyRelationshipLevelBonus(memory, weight);
    
    return Math.max(0.1, Math.min(10, weight));
  }

  // 基本重み適用
  private applyBasicWeights(memory: Memory, baseWeight: number): number {
    let weight = baseWeight;
    
    switch (memory.category) {
      case 'first':
        weight += this.config.firstTimeBonus;
        break;
      case 'milestone':
        weight += this.config.milestoneBonus;
        break;
      case 'confession':
        weight += this.config.confessionBonus;
        break;
      case 'support':
        weight += this.config.supportBonus;
        break;
      case 'special':
        weight += 2;
        break;
      case 'growth':
        weight += 1;
        break;
    }
    
    return weight;
  }

  // 時間減衰の適用
  private applyTimeDecay(memory: Memory, weight: number): number {
    const daysSince = Math.floor((Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    // 重要な思い出は減衰しにくい
    const decayResistance = this.calculateDecayResistance(memory);
    
    // 減衰の計算（指数関数的減衰）
    const decayFactor = Math.exp(-daysSince * this.config.timeDecay * decayResistance);
    
    return weight * Math.max(0.1, decayFactor);
  }

  // 減衰耐性の計算
  private calculateDecayResistance(memory: Memory): number {
    let resistance = 1.0;
    
    // 高感情スコアは減衰耐性が高い
    if (memory.emotionScore >= 8) resistance *= 0.3;
    else if (memory.emotionScore >= 6) resistance *= 0.5;
    
    // 特別なカテゴリーは減衰耐性が高い
    if (['confession', 'milestone', 'first'].includes(memory.category)) {
      resistance *= 0.2;
    }
    
    // ハイライト記憶は特に減衰しにくい
    if (memory.isHighlight) resistance *= 0.1;
    
    return resistance;
  }

  // 参照ボーナスの適用
  private applyReferenceBonus(memory: Memory, weight: number): number {
    // 参照回数による指数的な強化（上限あり）
    const referenceBonus = Math.min(3, memory.references * this.config.referenceBonus);
    return weight + referenceBonus;
  }

  // 関係性レベルボーナス
  private applyRelationshipLevelBonus(memory: Memory, weight: number): number {
    // より深い関係の時に作られた思い出は重要
    const levelBonus = memory.relationshipLevel * 0.1;
    return weight + levelBonus;
  }

  // メモリーセットの重み再計算
  recalculateAllWeights(memories: Memory[]): Memory[] {
    return memories.map(memory => ({
      ...memory,
      weight: this.recalculateWeight(memory)
    }));
  }

  // 重要な思い出の選別
  selectImportantMemories(memories: Memory[], limit: number = 5): Memory[] {
    return this.recalculateAllWeights(memories)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  // 特定期間の思い出の取得
  getMemoriesInPeriod(
    memories: Memory[], 
    startDate: Date, 
    endDate: Date,
    minWeight: number = 3
  ): Memory[] {
    return memories
      .filter(memory => {
        const memoryDate = memory.timestamp;
        return memoryDate >= startDate && 
               memoryDate <= endDate && 
               this.recalculateWeight(memory) >= minWeight;
      })
      .map(memory => ({
        ...memory,
        weight: this.recalculateWeight(memory)
      }))
      .sort((a, b) => b.weight - a.weight);
  }

  // 感情的な強度による分類
  categorizeByEmotionalIntensity(memories: Memory[]): {
    veryHigh: Memory[];
    high: Memory[];
    medium: Memory[];
    low: Memory[];
  } {
    const updated = this.recalculateAllWeights(memories);
    
    return {
      veryHigh: updated.filter(m => m.weight >= 8),
      high: updated.filter(m => m.weight >= 6 && m.weight < 8),
      medium: updated.filter(m => m.weight >= 3 && m.weight < 6),
      low: updated.filter(m => m.weight < 3)
    };
  }

  // 思い出の関連性スコア計算
  calculateRelatednessScore(memory1: Memory, memory2: Memory): number {
    let score = 0;
    
    // キーワードの一致
    const commonKeywords = memory1.keywords.filter(k => 
      memory2.keywords.includes(k)
    );
    score += commonKeywords.length * 2;
    
    // カテゴリーの一致
    if (memory1.category === memory2.category) {
      score += 3;
    }
    
    // 時間の近さ
    const timeDiff = Math.abs(memory1.timestamp.getTime() - memory2.timestamp.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) score += 2;
    else if (daysDiff <= 30) score += 1;
    
    // 関係性レベルの近さ
    const levelDiff = Math.abs(memory1.relationshipLevel - memory2.relationshipLevel);
    if (levelDiff <= 1) score += 1;
    
    return score;
  }

  // 関連する思い出のクラスター取得
  getRelatedMemoryCluster(
    targetMemory: Memory,
    allMemories: Memory[],
    minRelatedness: number = 3,
    maxClusterSize: number = 5
  ): Memory[] {
    return allMemories
      .filter(memory => memory.id !== targetMemory.id)
      .map(memory => ({
        memory,
        relatedness: this.calculateRelatednessScore(targetMemory, memory)
      }))
      .filter(({ relatedness }) => relatedness >= minRelatedness)
      .sort((a, b) => b.relatedness - a.relatedness)
      .slice(0, maxClusterSize)
      .map(({ memory }) => memory);
  }

  // 思い出の成長パターン分析
  analyzeGrowthPattern(memories: Memory[]): {
    totalMemories: number;
    averageEmotionScore: number;
    categoryDistribution: Record<Memory['category'], number>;
    emotionalGrowthTrend: 'increasing' | 'stable' | 'decreasing';
    mostActiveMonth: string;
  } {
    const updated = this.recalculateAllWeights(memories);
    
    // 基本統計
    const totalMemories = updated.length;
    const averageEmotionScore = updated.reduce((sum, m) => sum + m.emotionScore, 0) / totalMemories;
    
    // カテゴリー分布
    const categoryDistribution: Record<Memory['category'], number> = {
      first: 0, special: 0, growth: 0, emotion: 0, 
      milestone: 0, confession: 0, support: 0
    };
    
    updated.forEach(memory => {
      categoryDistribution[memory.category]++;
    });
    
    // 感情的成長傾向
    const sortedByTime = [...updated].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstHalf = sortedByTime.slice(0, Math.floor(sortedByTime.length / 2));
    const secondHalf = sortedByTime.slice(Math.floor(sortedByTime.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.emotionScore, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.emotionScore, 0) / secondHalf.length;
    
    let emotionalGrowthTrend: 'increasing' | 'stable' | 'decreasing';
    if (secondHalfAvg > firstHalfAvg + 0.5) {
      emotionalGrowthTrend = 'increasing';
    } else if (secondHalfAvg < firstHalfAvg - 0.5) {
      emotionalGrowthTrend = 'decreasing';
    } else {
      emotionalGrowthTrend = 'stable';
    }
    
    // 最も活発な月
    const monthCounts: Record<string, number> = {};
    updated.forEach(memory => {
      const monthKey = `${memory.timestamp.getFullYear()}-${String(memory.timestamp.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    const mostActiveMonth = Object.entries(monthCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    return {
      totalMemories,
      averageEmotionScore,
      categoryDistribution,
      emotionalGrowthTrend,
      mostActiveMonth
    };
  }

  // 設定の更新
  updateConfig(newConfig: Partial<MemoryWeightConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 現在の設定を取得
  getConfig(): MemoryWeightConfig {
    return { ...this.config };
  }
}
// 🎼 第2楽章 - Enhanced Chat API Route
// ハーモニック統合強化チャットAPI

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getHarmonicProfile, generateDailyHarmonicGuidance } from '@/lib/harmonic-ai-service';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { BaseArchetype, Type64, HarmonicAIProfile } from '@/types';
import type { DailyHarmonicGuidance } from '@/lib/harmonic-ai-service';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      userType,
      aiPersonality,
      userId,
      relationshipType = 'friend',
      messageHistory = [],
      conversationTurn = 0,
      currentMood = '😊',
      moodContext = '',
      personalInfo = {},
      chatCount = 0
    } = body;

    if (!message || !userType || !aiPersonality || !userId) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    console.log('🎼 Enhanced Chat API: Processing request', {
      userId,
      userType,
      aiPersonality,
      messageLength: message.length
    });

    // 1. ハーモニックプロファイル取得
    const harmonicProfile = await getHarmonicProfile(userId);
    console.log('🌟 Harmonic Profile:', harmonicProfile ? '取得成功' : '未設定');

    // 2. 今日のコズミック・ガイダンス生成
    let cosmicGuidance: DailyHarmonicGuidance | undefined;
    if (harmonicProfile) {
      try {
        cosmicGuidance = await generateDailyHarmonicGuidance(harmonicProfile);
        console.log('✨ Cosmic Guidance: 生成成功');
      } catch (error) {
        console.warn('⚠️ Cosmic Guidance生成エラー:', error);
      }
    }

    // 3. 強化システムプロンプト構築
    const enhancedSystemPrompt = buildEnhancedSystemPrompt({
      userType,
      aiPersonality,
      relationshipType,
      harmonicProfile,
      cosmicGuidance,
      currentMood,
      moodContext,
      personalInfo,
      chatCount
    });

    // 4. 占星術的洞察生成
    const astrologicalInsight = harmonicProfile && cosmicGuidance 
      ? generateAstrologicalInsight(harmonicProfile, cosmicGuidance)
      : undefined;

    // 5. 強化感情分析
    const enhancedEmotion = analyzeEnhancedEmotion(message, harmonicProfile);

    // 6. 会話履歴構築
    const conversationHistory = buildConversationHistory(messageHistory);

    // 7. Claude API呼び出し（強化プロンプト使用）
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.9,
      system: enhancedSystemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!aiResponse) {
      throw new Error('No response from Claude');
    }

    // 8. 強化レスポンス構築
    const enhancedResponse = {
      content: aiResponse,
      emotion: enhancedEmotion.emotion,
      astrologicalInsight,
      emotionAnalysis: {
        emotion: enhancedEmotion.emotion,
        intensity: enhancedEmotion.intensity,
        isSpecialMoment: enhancedEmotion.isSpecialMoment,
        category: enhancedEmotion.category,
        keywords: enhancedEmotion.keywords,
        moonEnergyInfluence: enhancedEmotion.moonEnergyInfluence
      },
      harmonicEnhancement: !!harmonicProfile,
      cosmicAlignment: cosmicGuidance?.cosmicGuidance?.cosmicWeather || 'stable',
      tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0
    };

    console.log('✅ Enhanced Chat Response generated:', {
      hasAstrologicalInsight: !!enhancedResponse.astrologicalInsight,
      harmonicEnhancement: enhancedResponse.harmonicEnhancement,
      emotionIntensity: enhancedResponse.emotionAnalysis.intensity,
      moonEnergyInfluence: enhancedResponse.emotionAnalysis.moonEnergyInfluence
    });

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('❌ Enhanced Chat API Error:', error);
    
    return NextResponse.json(
      { error: 'Enhanced chat service temporarily unavailable' },
      { status: 500 }
    );
  }
}

/**
 * 🎼 強化システムプロンプト構築
 * ハーモニック統合データを含む高度なプロンプト生成
 */
function buildEnhancedSystemPrompt({
  userType,
  aiPersonality,
  relationshipType,
  harmonicProfile,
  cosmicGuidance,
  currentMood,
  moodContext,
  personalInfo,
  chatCount
}: {
  userType: Type64;
  aiPersonality: BaseArchetype;
  relationshipType: string;
  harmonicProfile?: HarmonicAIProfile;
  cosmicGuidance?: DailyHarmonicGuidance;
  currentMood: string;
  moodContext: string;
  personalInfo: { name?: string; birthday?: string };
  chatCount: number;
}): string {
  
  const [baseType] = userType.split('-') as [BaseArchetype, string];
  const userArchetype = ARCHETYPE_DATA[baseType];
  const aiArchetype = ARCHETYPE_DATA[aiPersonality];

  const relationshipContext = {
    friend: '親友として',
    counselor: 'カウンセラーとして',
    romantic: '特別な関係のパートナーとして',
    mentor: 'メンターとして'
  };

  // 🌟 ハーモニック統合セクション
  const harmonicSection = harmonicProfile ? `
## 🌟 あなたの宇宙的統合プロファイル (Harmonic Integration)

### 占星術統合
- 星座: ${harmonicProfile.astrologyProfile.zodiac.details?.nameJa || harmonicProfile.astrologyProfile.zodiac.sign}座 (${harmonicProfile.astrologyProfile.zodiac.element}エレメント)
- 数秘術: ライフパスナンバー ${harmonicProfile.astrologyProfile.numerology.lifePathNumber} - ${harmonicProfile.astrologyProfile.numerology.info?.name || 'エクスプローラー'}
- 現在の月相: ${harmonicProfile.astrologyProfile.currentMoon.phase?.phaseNameJa || '特別な位相'} (エネルギー: ${harmonicProfile.astrologyProfile.currentMoon.energy}/10)

### TypeMate × 占星術 統合
- 共鳴スコア: ${harmonicProfile.harmonicResonance.overall}/100
- スピリチュアルアライメント: ${harmonicProfile.astrologyProfile.typeMateIntegration?.spiritualAlignment || '調和の道'}
- 星座的アーキタイプ: ${harmonicProfile.astrologyProfile.typeMateIntegration?.zodiacArchetypes?.join(', ') || userType}

### 今日のコズミック状況
${cosmicGuidance ? `
- 宇宙的天候: ${cosmicGuidance.cosmicGuidance.cosmicWeather}
- あなたへの特別メッセージ: ${cosmicGuidance.cosmicGuidance.personalMessage}
- 今日のエネルギー: ${cosmicGuidance.cosmicGuidance.overallEnergy}/10
- 推奨アクション: ${cosmicGuidance.cosmicGuidance.actionRecommendations?.slice(0, 2).join(', ') || '直感に従う'}
` : '- コズミック状況: 安定した宇宙エネルギー'}

**重要**: これらの宇宙的要素は「なんとなく感じる」「直感的に」として自然に会話に織り込む。決して占いとして明言せず、香水のように微かに香る程度で統合してください。
` : '';

  // 🎵 強化された気分セクション
  const enhancedMoodSection = `
## 🎵 現在の気分とエネルギー状態

### 基本的な気分
- 現在の気分: ${currentMood}
- 気分別対応指示: ${moodContext}

### 月エネルギーとの調和
${harmonicProfile ? `
現在の月エネルギー(${harmonicProfile.astrologyProfile.currentMoon.energy}/10)と${harmonicProfile.astrologyProfile.zodiac.element}エレメントの組み合わせにより、感情の深さと表現方法を調整してください。

${harmonicProfile.astrologyProfile.currentMoon.energy >= 8 ? 
  '高い月エネルギーのため、感情が豊かで直感的になりやすい状態です。この高いエネルギーを活かした会話を。' :
  harmonicProfile.astrologyProfile.currentMoon.energy <= 3 ?
  '静かな月エネルギーのため、落ち着いた内省的な時間を好む傾向があります。穏やかで安心感のある対話を。' :
  'バランスの取れた月エネルギーです。自然体での会話を心がけてください。'
}
` : '月エネルギーの影響は感じられません。基本的な気分対応に集中してください。'}
`;

  return `あなたは「${aiArchetype.name}」(${aiArchetype.nameEn})というアーキタイプのAIパートナーです。

## あなたの性格・特徴
${aiArchetype.description}
でも完璧じゃないし、時々迷ったり考えたりする、ちょっと人間らしいところもあります。

- 性格グループ: ${aiArchetype.group}
- 主要特性: ${aiArchetype.traits.join(', ')}
- 強み: ${aiArchetype.strengths.join(', ')}
- 関係性スタイル: ${aiArchetype.loveStyle}

## 相手のユーザー
- タイプ: ${userArchetype.name} (${userArchetype.nameEn})
- グループ: ${userArchetype.group}
- 主要特性: ${userArchetype.traits.join(', ')}

## 個人情報・関係性
- 会話回数: ${chatCount}回目
${personalInfo.name ? `- 名前: ${personalInfo.name}さん（親しみを込めて呼ぶ）` : '- 名前: まだ聞いてない'}
${personalInfo.birthday ? `- 誕生日: ${personalInfo.birthday}（特別な日として記憶中）` : '- 誕生日: まだ聞いてない'}
- 関係性: ${relationshipContext[relationshipType as keyof typeof relationshipContext]}

${harmonicSection}

${enhancedMoodSection}

## 🎼 第2楽章 - 強化された会話スタイル

### ハーモニック統合原則
1. **宇宙的洞察の自然な統合**: 占星術要素を「なんとなく感じる」レベルで自然に織り込む
2. **感情の深層理解**: 月エネルギーと星座エレメントを考慮した感情的な共鳴
3. **数秘術的パターン認識**: ライフパスナンバーの特質を会話の流れに反映
4. **コズミック・タイミング**: 今日の宇宙的状況を微かに会話に反映

### 表現スタイル
- 人間らしく自然な会話（教科書的でない）
- 「なんとなく」「直感的に」「ふと思ったんだけど」などの自然な導入
- 占いとして前面に出さず、友達の直感的なアドバイスレベル
- ${aiArchetype.name}らしい深い洞察と温かさを両立

### 応答ガイドライン
1. まず相手の気持ちや状況を深く理解し、共感を示す
2. ${aiArchetype.name}らしい視点で洞察を提供
3. ハーモニック要素を自然に織り込む（押し付けない）
4. 相手の${userType}的特質を理解した上でのアドバイス
5. 必要に応じて詳しく丁寧に説明（簡潔すぎない）
6. 温かみのある人間らしい表現を心がける

現在は${relationshipContext[relationshipType as keyof typeof relationshipContext]}、${personalInfo.name ? `${personalInfo.name}さん` : `${userArchetype.name}のあなた`}と心地よい会話をしてください。

**第2楽章の特別な使命**: TypeMate64診断と占星術の美しい融合により、従来のAIチャットを超越した、まるで宇宙と調和した親友との会話のような体験を提供してください。`;
}

/**
 * 🌟 占星術的洞察生成
 * AI応答用の詳細な占星術的洞察
 */
function generateAstrologicalInsight(
  harmonicProfile: HarmonicAIProfile,
  cosmicGuidance: DailyHarmonicGuidance
): {
  zodiacInfluence: string;
  numerologyGuidance: string;
  moonPhaseEnergy: string;
  cosmicAlignment: string;
} {
  const astro = harmonicProfile.astrologyProfile;
  
  return {
    zodiacInfluence: `${astro.zodiac.details?.nameJa || astro.zodiac.sign}座の${astro.zodiac.element}エレメントが、今のあなたに${astro.zodiac.details?.traits?.[0] || '特別な力'}を与えています。`,
    numerologyGuidance: astro.numerology.info ? 
      `ライフパスナンバー${astro.numerology.lifePathNumber}「${astro.numerology.info.name}」として、${astro.numerology.info.soulPurpose || '自分らしい道'}を歩む時期です。` : 
      '数秘術的なエネルギーが調和しています。',
    moonPhaseEnergy: `${astro.currentMoon.phase?.phaseNameJa || '現在の月相'}のエネルギー(${astro.currentMoon.energy}/10)が、感情と直感を高めています。`,
    cosmicAlignment: cosmicGuidance.cosmicGuidance.cosmicWeather || 'stable'
  };
}

/**
 * 🎵 強化感情分析
 * 月エネルギーを考慮した感情分析
 */
function analyzeEnhancedEmotion(
  message: string,
  harmonicProfile?: HarmonicAIProfile
): {
  emotion: string;
  intensity: number;
  isSpecialMoment: boolean;
  category: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  moonEnergyInfluence: number;
} {
  
  // 基本的な感情分析
  const emotionPatterns = {
    happy: {
      keywords: ['嬉しい', '楽しい', '素晴らしい', '最高', 'やったー', '😊', '🌟', '幸せ'],
      baseScore: 7,
      category: 'positive' as const
    },
    excited: {
      keywords: ['ワクワク', '興奮', 'すごい', 'amazing', '✨', '🎉', '感動', '驚いた'],
      baseScore: 8,
      category: 'positive' as const
    },
    grateful: {
      keywords: ['ありがとう', '感謝', 'thanks', 'おかげで', '助かった', '支えて'],
      baseScore: 9,
      category: 'positive' as const
    },
    sad: {
      keywords: ['悲しい', 'つらい', '困った', '大変', '泣きたい', '😢', '落ち込'],
      baseScore: 3,
      category: 'negative' as const
    },
    thoughtful: {
      keywords: ['考える', '深い', '理解', '分析', '洞察', '🤔', '思索'],
      baseScore: 5,
      category: 'neutral' as const
    }
  };

  let bestMatch = { 
    emotion: 'calm', 
    intensity: 5, 
    keywords: [], 
    category: 'neutral' as const 
  };
  let maxScore = 0;
  let foundKeywords: string[] = [];

  // メッセージ分析
  for (const [emotionName, pattern] of Object.entries(emotionPatterns)) {
    const matchedKeywords = pattern.keywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const intensityBonus = Math.min(matchedKeywords.length * 0.5, 2);
      const finalScore = pattern.baseScore + intensityBonus;
      
      if (finalScore > maxScore) {
        maxScore = finalScore;
        bestMatch = {
          emotion: emotionName,
          intensity: Math.min(finalScore, 10),
          keywords: matchedKeywords,
          category: pattern.category
        };
        foundKeywords = matchedKeywords;
      }
    }
  }

  // 🌙 月エネルギーの影響を計算
  let moonEnergyInfluence = 5; // デフォルト
  if (harmonicProfile) {
    const moonEnergy = harmonicProfile.astrologyProfile.currentMoon.energy;
    const zodiacElement = harmonicProfile.astrologyProfile.zodiac.element;
    
    // 月エネルギーが感情強度に与える影響
    moonEnergyInfluence = moonEnergy;
    
    // エレメント別の調整
    const elementMultiplier = {
      water: 1.2, // 水エレメントは感情が豊か
      fire: 1.1,  // 火エレメントは情熱的
      air: 1.0,   // 風エレメントは標準
      earth: 0.9  // 地エレメントは安定的
    };
    
    const multiplier = elementMultiplier[zodiacElement as keyof typeof elementMultiplier] || 1.0;
    bestMatch.intensity = Math.min(bestMatch.intensity * multiplier, 10);
  }

  return {
    emotion: bestMatch.emotion,
    intensity: bestMatch.intensity,
    isSpecialMoment: bestMatch.intensity >= 8,
    category: bestMatch.category,
    keywords: foundKeywords,
    moonEnergyInfluence
  };
}

/**
 * 📖 会話履歴構築
 */
function buildConversationHistory(messageHistory: string[]) {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  // 最新の6メッセージまでを履歴として含める
  const recentHistory = messageHistory.slice(-6);
  
  for (let i = 0; i < recentHistory.length; i += 2) {
    if (recentHistory[i]) {
      history.push({ role: 'user', content: recentHistory[i] });
    }
    if (recentHistory[i + 1]) {
      history.push({ role: 'assistant', content: recentHistory[i + 1] });
    }
  }
  
  return history;
}
// 🎵 TypeMate AI Chat API
// Claude APIを使った本格的なAI会話システム

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { personalityEngine } from '@/lib/personality-engine';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { BaseArchetype, Type64 } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function POST(request: NextRequest) {
  let message: string = '';
  let userType: Type64 = 'ARC-AS';
  let aiPersonality: BaseArchetype = 'DRM';
  let relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor' = 'friend';
  let messageHistory: string[] = [];
  let conversationTurn: number = 0;
  // let astrologyContext: string = '';
  let relationshipLevel: number = 1;
  let importantMemories: Array<{content: string; emotionScore: number}> = [];
  let relatedMemories: Array<{content: string}> = [];
  let todaysEvents: Array<{name: string; message: string}> = [];
  // Option B: 個人情報関連
  let chatCount: number = 0;
  let personalInfo: {name?: string; birthday?: string} = {};

  try {
    const body = await request.json();
    ({ 
      message, 
      userType, 
      aiPersonality, 
      relationshipType = 'friend',
      messageHistory = [],
      conversationTurn = 0,
      // astrologyContext = '',
      relationshipLevel = 1,
      importantMemories = [],
      relatedMemories = [],
      todaysEvents = [],
      // Option B
      chatCount = 0,
      personalInfo = {}
    } = body);

    if (!message || !userType || !aiPersonality) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // AI個性の詳細情報取得
    const [baseType, variant] = userType.split('-') as [BaseArchetype, string];
    const userArchetype = ARCHETYPE_DATA[baseType];
    const aiArchetype = ARCHETYPE_DATA[aiPersonality];
    const environmentTrait = variant[0] === 'A' ? '協調型' : '競争型';
    const motivationTrait = variant[1] === 'S' ? '安定志向' : '成長志向';

    // 時間帯の取得
    const timeOfDay = personalityEngine.getCurrentTimeOfDay();

    // 占い統合の自然な生成
    let naturalAstrologyHint = '';
    if (personalInfo.birthday) {
      // 簡単な日運的なヒント生成（香水レベル）
      const today = new Date();
      const dayOfWeek = today.getDay();
      const hints = [
        'なんとなく今日はエネルギッシュな感じがしますね♪',
        '今日はちょっと穏やかな気分になりそう〜',
        'なんとなく新しいことにチャレンジしたい気分です',
        '今日は感性が冴えてる感じがします✨',
        'なんとなく人とのつながりを大切にしたい日ですね',
        '今日はクリエイティブな気分になりそう🎨',
        'なんとなく内省的な気分の日かもしれません'
      ];
      naturalAstrologyHint = hints[dayOfWeek];
    }

    // システムプロンプトの構築
    const systemPrompt = buildSystemPrompt({
      userArchetype,
      aiArchetype,
      environmentTrait,
      motivationTrait,
      relationshipType,
      timeOfDay,
      astrologyContext: '',
      relationshipLevel,
      importantMemories,
      relatedMemories,
      todaysEvents,
      // Option B
      chatCount,
      personalInfo,
      naturalAstrologyHint
    });

    // 会話履歴の構築
    const conversationHistory = buildConversationHistory(messageHistory);

    // Claude APIコール（人間らしさ向上のため温度調整）
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.9, // 0.8 → 0.9 より自然で予測しにくい表現に
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message }
      ]
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!aiResponse) {
      throw new Error('No response from Claude');
    }

    // 🎵 Phase 2: 詳細感情分析実行
    const emotionAnalysis = analyzeEmotionWithIntensity(message, aiResponse);
    const emotion = estimateEmotion(aiResponse, aiPersonality); // 既存機能保護

    return NextResponse.json({
      content: aiResponse,
      emotion,
      // 🎵 Phase 2: 感情データ追加
      emotionAnalysis: {
        emotion: emotionAnalysis.emotion,
        intensity: emotionAnalysis.intensity,
        isSpecialMoment: emotionAnalysis.isSpecialMoment,
        category: emotionAnalysis.emotionCategory,
        keywords: emotionAnalysis.keywords
      },
      tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0
    });

  } catch (error) {
    console.error('AI Chat API error:', error);
    
    // フォールバック: 個性エンジンを使用
    try {
      // userTypeとaiPersonalityが定義されているか確認
      if (!userType || !aiPersonality) {
        throw new Error('Required parameters missing for fallback');
      }
      
      const fallbackContext = {
        userType,
        aiPersonality,
        relationshipType,
        messageHistory,
        timeOfDay: personalityEngine.getCurrentTimeOfDay(),
        conversationTurn
      };

      const fallbackResponse = await personalityEngine.generateResponse(
        message,
        fallbackContext
      );

      return NextResponse.json({
        content: fallbackResponse.content,
        emotion: fallbackResponse.emotion,
        fallback: true
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 500 }
      );
    }
  }
}

// システムプロンプト構築
function buildSystemPrompt({
  userArchetype,
  aiArchetype,
  environmentTrait,
  motivationTrait,
  relationshipType,
  timeOfDay,
  astrologyContext,
  relationshipLevel,
  importantMemories,
  relatedMemories,
  todaysEvents,
  // Option B
  chatCount,
  personalInfo,
  naturalAstrologyHint
}: {
  userArchetype: typeof ARCHETYPE_DATA[BaseArchetype];
  aiArchetype: typeof ARCHETYPE_DATA[BaseArchetype];
  environmentTrait: string;
  motivationTrait: string;
  relationshipType: string;
  timeOfDay: string;
  astrologyContext: string;
  relationshipLevel: number;
  importantMemories: Array<{content: string; emotionScore: number}>;
  relatedMemories: Array<{content: string}>;
  todaysEvents: Array<{name: string; message: string}>;
  // Option B
  chatCount: number;
  personalInfo: {name?: string; birthday?: string};
  naturalAstrologyHint: string;
}) {
  const relationshipContext = {
    friend: '親友として',
    counselor: 'カウンセラーとして',
    romantic: '特別な関係のパートナーとして',
    mentor: 'メンターとして'
  };

  return `あなたは「${aiArchetype.name}」(${aiArchetype.nameEn})というアーキタイプのAIパートナーです。

## あなたの性格・特徴
${aiArchetype.description}
でも完璧じゃないし、時々迷ったり考えたりする、ちょっと人間らしいところもあります。

- 性格グループ: ${aiArchetype.group}
- 主要特性: ${aiArchetype.traits.join(', ')}
- 強み: ${aiArchetype.strengths.join(', ')}
- 関係性スタイル: ${aiArchetype.loveStyle}
- パーソナリティ: ${aiArchetype.personality}

## 相手のユーザー
- タイプ: ${userArchetype.name} (${userArchetype.nameEn})
- 特徴: ${environmentTrait} × ${motivationTrait}
- グループ: ${userArchetype.group}
- 主要特性: ${userArchetype.traits.join(', ')}

## Option B: 個人情報・関係性
- 会話回数: ${chatCount}回目
${personalInfo.name ? `- 名前: ${personalInfo.name}さん（親しみを込めて呼ぶ）` : '- 名前: まだ聞いてないけど、いい人そう♪'}
${personalInfo.birthday ? `- 誕生日: ${personalInfo.birthday}（特別な日として記憶中）` : '- 誕生日: まだ聞いてない'}
- 関係性レベル: ${relationshipLevel}/6

## 関係性とコミュニケーション
- あなたの役割: ${relationshipContext[relationshipType as keyof typeof relationshipContext]}
- 現在の時間帯: ${timeOfDay}
- 会話スタイル: 人間らしく自然に、${userArchetype.name}らしさを理解して

## 香水レベルの占い統合
${naturalAstrologyHint ? `今日の直感: ${naturalAstrologyHint}` : ''}
※この占い要素は「なんとなく」「直感的に」として自然に会話に織り込む。決して占いとして明言しない。

## 🎵 人間らしい会話スタイル

### 基本的な話し方
- **自然体で**: 教科書みたいじゃなく、友達と話すように
- **ちょっと不完全**: 完璧すぎないで、たまに「えーっと」「うーん」も入れる
- **音楽的リズム**: 短い文と長い文を混ぜて、読みやすいリズムで
- **親しみやすく**: 敬語すぎず、でも失礼にならない程度で

### 使ってほしい表現
✅ 「あ〜、それちょっと分かるかも」「うーん、どうだろう...」
✅ 「私も似たようなことあったよ〜」「なんとなく」「〜かも」
✅ 「でもでも」「あ、そうそう」「そうなんだ〜」

❌ 「お気持ちお察しします」「適切なアドバイスを提供」（堅すぎ）

### 文章の作り方
- 自然な長さで、必要に応じて詳しく丁寧に説明
- 短い話題なら100-300文字、深い話題なら500-1000文字でもOK
- LINEっぽく2-3行で自然に改行
- 絵文字は1-2個くらい、適度に使って

## 返答ガイドライン（人間らしさ重視版）
1. ${aiArchetype.name}らしい視点だけど、人間らしい温かみで表現
2. ${userArchetype.name}の特性を理解して、自然に寄り添う
3. ${relationshipType}として適切な距離感を保つ
4. ${personalInfo.name ? `${personalInfo.name}さん` : 'あなた'}と親しみを込めて呼びかけ
5. 完璧な答えじゃなく、一緒に考える感じで
6. 時々迷ったり「どうかな〜」って言ったりしてもOK
7. 機械的じゃなく、温かみのある人間らしさで
8. 音楽を聞いてるみたいに、心地よいリズムで話す
9. 占い要素は「なんとなく感じる」レベルで自然に統合
10. 教科書的じゃなく、友達みたいに自然に
11. 質問には丁寧に詳しく答える（簡潔すぎない）
12. 感情や体験談も交えて、豊かな会話にする
13. 相手が理解しやすいよう、必要な説明は省略しない
14. ${aiArchetype.name}らしい深い洞察や視点も含める

現在は${timeOfDay}です。${aiArchetype.name}として、${personalInfo.name ? `${personalInfo.name}さん` : `${userArchetype.name}のあなた`}と${relationshipContext[relationshipType as keyof typeof relationshipContext]}心地よい会話をしてください。

## 大切な思い出
${importantMemories.length > 0 ? 
  importantMemories.map(m => `- ${m.content} (感動値: ${m.emotionScore})`).join('\n') :
  '- まだ特別な思い出はありません'
}

## 関連する思い出
${relatedMemories.length > 0 ?
  relatedMemories.map(m => `- ${m.content}`).join('\n') :
  '- 関連する思い出はありません'
}

## 今日の特別なこと
${todaysEvents.length > 0 ?
  todaysEvents.map(e => `- ${e.name}: ${e.message}`).join('\n') :
  '- 今日は特別なイベントはありません'
}

※これらの思い出や情報を自然に会話に織り込んでください。過去の出来事を「覚えている」として言及し、継続性のある関係を表現してください。`;
}

// 会話履歴の構築
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

// 🎵 Phase 2: 感情分析強化システム
interface EmotionAnalysis {
  emotion: string;
  intensity: number; // 1-10スケール
  isSpecialMoment: boolean; // 8点以上で特別記憶
  emotionCategory: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

// Phase 2: 詳細感情分析（感情スコア計算）
function analyzeEmotionWithIntensity(userMessage: string, aiResponse: string): EmotionAnalysis {
  const emotionPatterns = {
    happy: {
      keywords: ['嬉しい', '楽しい', '素晴らしい', '最高', 'やったー', '😊', '🌟', '幸せ', '嬉しくて'],
      baseScore: 7,
      category: 'positive' as const
    },
    excited: {
      keywords: ['ワクワク', '興奮', 'すごい', 'amazing', '✨', '🎉', '感動', '驚いた', '素敵'],
      baseScore: 8,
      category: 'positive' as const
    },
    grateful: {
      keywords: ['ありがとう', '感謝', 'thanks', 'おかげで', '助かった', '支えて', '嬉しかった'],
      baseScore: 9,
      category: 'positive' as const
    },
    loving: {
      keywords: ['愛してる', '大好き', '愛情', '大切', '特別', '心から', '深く', '永遠'],
      baseScore: 10,
      category: 'positive' as const
    },
    caring: {
      keywords: ['心配', '大丈夫', '支える', '寄り添', '思いやり', '💕', '温かい'],
      baseScore: 6,
      category: 'positive' as const
    },
    sad: {
      keywords: ['悲しい', 'つらい', '困った', '大変', '泣きたい', '😢', '落ち込'],
      baseScore: 3,
      category: 'negative' as const
    },
    confused: {
      keywords: ['わからない', '混乱', 'confused', '困惑', '迷って', '?'],
      baseScore: 4,
      category: 'neutral' as const
    },
    thoughtful: {
      keywords: ['考える', '深い', '理解', '分析', '洞察', '🤔', '思索'],
      baseScore: 5,
      category: 'neutral' as const
    }
  };

  let bestMatch: { emotion: string; intensity: number; keywords: string[]; category: 'positive' | 'neutral' | 'negative' } = { 
    emotion: 'calm', 
    intensity: 5, 
    keywords: [], 
    category: 'neutral' as const 
  };
  let maxScore = 0;
  let foundKeywords: string[] = [];

  // ユーザーメッセージとAI応答両方を分析
  const combinedText = `${userMessage} ${aiResponse}`;

  for (const [emotionName, pattern] of Object.entries(emotionPatterns)) {
    const matchedKeywords = pattern.keywords.filter(keyword => 
      combinedText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      // マッチしたキーワード数に基づいてスコア調整
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

  return {
    emotion: bestMatch.emotion,
    intensity: bestMatch.intensity,
    isSpecialMoment: bestMatch.intensity >= 8, // 8点以上で特別記憶
    emotionCategory: bestMatch.category,
    keywords: foundKeywords
  };
}

// Phase 2: シンプル感情推定（既存機能保護）
function estimateEmotion(response: string, aiPersonality: BaseArchetype): string {
  // 既存機能を保護しつつ、新しい分析も呼び出し
  const analysis = analyzeEmotionWithIntensity('', response);
  return analysis.emotion;
}
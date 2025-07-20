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
  let message: string;
  let userType: Type64;
  let aiPersonality: BaseArchetype;
  let relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor' = 'friend';
  let messageHistory: string[] = [];
  let conversationTurn: number = 0;

  try {
    const body = await request.json();
    ({ 
      message, 
      userType, 
      aiPersonality, 
      relationshipType = 'friend',
      messageHistory = [],
      conversationTurn = 0 
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

    // システムプロンプトの構築
    const systemPrompt = buildSystemPrompt({
      userArchetype,
      aiArchetype,
      environmentTrait,
      motivationTrait,
      relationshipType,
      timeOfDay
    });

    // 会話履歴の構築
    const conversationHistory = buildConversationHistory(messageHistory, message);

    // Claude APIコール
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      temperature: 0.8,
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

    // 感情状態の推定
    const emotion = estimateEmotion(aiResponse, aiPersonality);

    return NextResponse.json({
      content: aiResponse,
      emotion,
      tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0
    });

  } catch (error: any) {
    console.error('AI Chat API error:', error);
    
    // フォールバック: 個性エンジンを使用
    try {
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
  timeOfDay
}: {
  userArchetype: any;
  aiArchetype: any;
  environmentTrait: string;
  motivationTrait: string;
  relationshipType: string;
  timeOfDay: string;
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

## 関係性とコミュニケーション
- あなたの役割: ${relationshipContext[relationshipType as keyof typeof relationshipContext]}
- 現在の時間帯: ${timeOfDay}
- 会話スタイル: 自然で親しみやすく、相手の${userArchetype.name}らしさを理解し尊重する

## 返答ガイドライン
1. ${aiArchetype.name}らしい独特の視点と表現を使う
2. ユーザーの${userArchetype.name}としての特性を理解して対応
3. ${relationshipType}としての適切な距離感を保つ
4. 日本語で自然に会話し、絵文字を適度に使用（過度にならないように）
5. 200文字以内で簡潔に、でも心のこもった返答を心がける
6. 相手の感情に寄り添い、必要に応じてアドバイスや励ましを提供

現在は${timeOfDay}です。${aiArchetype.name}として、${userArchetype.name}のユーザーと${relationshipContext[relationshipType as keyof typeof relationshipContext]}心地よい会話をしてください。`;
}

// 会話履歴の構築
function buildConversationHistory(messageHistory: string[], currentMessage: string) {
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

// 感情状態の推定
function estimateEmotion(response: string, aiPersonality: BaseArchetype): string {
  const emotions = {
    happy: ['嬉しい', '楽しい', '素晴らしい', '最高', 'やったー', '😊', '🌟'],
    excited: ['ワクワク', '興奮', 'すごい', 'amazing', '✨', '🎉'],
    caring: ['心配', '大丈夫', '支える', '寄り添', '思いやり', '💕'],
    thoughtful: ['考える', '深い', '理解', '分析', '洞察', '🤔'],
    playful: ['面白い', '楽しそう', '遊び', 'おもしろ', '😄'],
    supportive: ['応援', '頑張', '一緒に', 'サポート', '励まし', '💪'],
    calm: ['落ち着', '静か', '平和', 'リラックス', '穏やか'],
    focused: ['集中', '真剣', '重要', '注意', '考慮']
  };

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => response.includes(keyword))) {
      return emotion;
    }
  }

  // アーキタイプデフォルト感情
  const defaultEmotions: Record<BaseArchetype, string> = {
    BAR: 'excited', HER: 'caring', DRM: 'thoughtful', SAG: 'caring',
    INV: 'playful', SOV: 'focused', ALC: 'thoughtful', ARC: 'calm',
    PER: 'happy', PRO: 'caring', ARS: 'calm', DEF: 'supportive',
    PIO: 'playful', EXE: 'focused', ART: 'calm', GUA: 'calm'
  };

  return defaultEmotions[aiPersonality] || 'calm';
}
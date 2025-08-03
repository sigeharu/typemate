// 🌟 Enhanced Harmonic Chat Service
// ハーモニクスAI × 占星術統合チャットサービス

'use client';

import { getHarmonicProfile, generateDailyHarmonicGuidance, type DailyHarmonicGuidance } from './harmonic-ai-service';
import type { 
  HarmonicAIProfile, 
  BaseArchetype, 
  Type64,
  IntegratedAstrologyProfile 
} from '../types';

// 🎵 強化されたチャットメッセージリクエスト
export interface EnhancedChatRequest {
  message: string;
  userType: Type64;
  aiPersonality: BaseArchetype;
  userId: string;
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor';
  messageHistory: string[];
  conversationTurn: number;
  
  // 🌟 ハーモニクス統合データ
  harmonicProfile?: HarmonicAIProfile;
  cosmicGuidance?: DailyHarmonicGuidance;
  
  // 🎵 強化された気分データ
  currentMood: string;
  moodContext: string;
  
  // 既存データ
  personalInfo: { name?: string; birthday?: string };
  chatCount: number;
}

// 🎵 AI返答の強化データ
export interface EnhancedChatResponse {
  content: string;
  emotion: string;
  
  // 🌟 占星術的洞察
  astrologicalInsight?: {
    zodiacInfluence: string;
    numerologyGuidance: string;
    moonPhaseEnergy: string;
    cosmicAlignment: string;
  };
  
  // 🎵 感情分析
  emotionAnalysis: {
    emotion: string;
    intensity: number;
    isSpecialMoment: boolean;
    category: 'positive' | 'neutral' | 'negative';
    keywords: string[];
  };
  
  tokens_used: number;
  harmonicEnhancement: boolean;
}

/**
 * 🌟 ハーモニック統合メッセージ送信
 * ユーザーメッセージにハーモニクスAIプロファイルを自動統合
 */
export async function sendEnhancedMessage(
  basicRequest: Omit<EnhancedChatRequest, 'harmonicProfile' | 'cosmicGuidance'>
): Promise<EnhancedChatResponse> {
  
  console.log('🌟 Enhanced Chat Service: メッセージ送信開始', {
    userId: basicRequest.userId,
    userType: basicRequest.userType,
    aiPersonality: basicRequest.aiPersonality
  });
  
  try {
    // 1. ハーモニクスAIプロファイルを取得
    const harmonicProfile = await getHarmonicProfile(basicRequest.userId);
    console.log('🔮 Harmonic Profile:', harmonicProfile ? '取得成功' : '未設定');
    
    // 2. 今日のコズミック・ガイダンスを生成
    let cosmicGuidance: DailyHarmonicGuidance | undefined;
    if (harmonicProfile) {
      try {
        cosmicGuidance = await generateDailyHarmonicGuidance(harmonicProfile);
        console.log('✨ Cosmic Guidance: 生成成功');
      } catch (error) {
        console.warn('⚠️ Cosmic Guidance生成エラー:', error);
      }
    }
    
    // 3. 強化されたリクエストを構築
    const enhancedRequest: EnhancedChatRequest = {
      ...basicRequest,
      harmonicProfile: harmonicProfile || undefined,
      cosmicGuidance: cosmicGuidance || undefined
    };
    
    // 4. 占星術コンテキストを生成
    const astrologicalContext = harmonicProfile 
      ? generateAstrologicalContext(harmonicProfile, cosmicGuidance)
      : '';
    
    // 5. 強化された気分コンテキストを生成
    const enhancedMoodContext = generateEnhancedMoodContext(
      basicRequest.currentMood, 
      harmonicProfile
    );
    
    // 6. 既存のチャットAPIに強化データを送信
    const chatRequest = {
      ...basicRequest,
      moodContext: enhancedMoodContext,
      // 占星術コンテキストを追加情報として含める
      astrologicalContext,
      harmonicEnhancement: !!harmonicProfile
    };
    
    console.log('🚀 Sending enhanced request to chat API', {
      hasHarmonicProfile: !!harmonicProfile,
      hasCosmicGuidance: !!cosmicGuidance,
      astrologicalContextLength: astrologicalContext.length
    });
    
    // 7. 第2楽章: 強化チャットAPIを呼び出し
    const response = await fetch('/api/chat/enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatRequest)
    });
    
    if (!response.ok) {
      throw new Error(`Chat API request failed: ${response.status}`);
    }

    const basicResponse = await response.json();
    
    // 8. 基本応答を強化フォーマットに変換
    const enhancedResponse: EnhancedChatResponse = {
      content: basicResponse.content,
      emotion: basicResponse.emotion,
      emotionAnalysis: basicResponse.emotionAnalysis || {
        emotion: 'calm',
        intensity: 5,
        isSpecialMoment: false,
        category: 'neutral' as const,
        keywords: []
      },
      tokens_used: basicResponse.tokens_used || 0,
      harmonicEnhancement: !!harmonicProfile
    };
    
    // 9. 占星術的洞察を追加
    if (harmonicProfile && cosmicGuidance) {
      enhancedResponse.astrologicalInsight = generateAstrologicalInsight(
        harmonicProfile, 
        cosmicGuidance
      );
    }
    
    console.log('✅ Enhanced Chat Response generated:', {
      hasAstrologicalInsight: !!enhancedResponse.astrologicalInsight,
      harmonicEnhancement: enhancedResponse.harmonicEnhancement,
      emotionIntensity: enhancedResponse.emotionAnalysis.intensity
    });
    
    return enhancedResponse;
    
  } catch (error) {
    console.error('❌ Enhanced Chat Service Error:', error);
    
    // フォールバック: 通常のAPI呼び出し  
    console.log('🔄 Fallback to basic chat API');
    const fallbackResponse = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basicRequest)
    });
    
    if (!fallbackResponse.ok) {
      throw new Error('Both enhanced and fallback APIs failed');
    }
    
    const basicResponse = await fallbackResponse.json();
    
    // 基本応答を強化フォーマットに変換
    return {
      content: basicResponse.content,
      emotion: basicResponse.emotion,
      emotionAnalysis: basicResponse.emotionAnalysis || {
        emotion: 'calm',
        intensity: 5,
        isSpecialMoment: false,
        category: 'neutral' as const,
        keywords: []
      },
      tokens_used: basicResponse.tokens_used || 0,
      harmonicEnhancement: false
    };
  }
}

/**
 * 🎵 占星術コンテキスト生成
 * ハーモニクスプロファイルから詳細な占星術コンテキストを生成
 */
export function generateAstrologicalContext(
  harmonicProfile: HarmonicAIProfile,
  cosmicGuidance?: DailyHarmonicGuidance
): string {
  
  const astrology = harmonicProfile.astrologyProfile;
  
  // 🌟 星座情報
  const zodiacContext = `
あなたは${astrology.zodiac.details?.nameJa || astrology.zodiac.sign}座として生まれ、
${astrology.zodiac.element}エレメントの特質を持っています。
${astrology.zodiac.details?.traits?.join('、') || '独特の魅力'}を備えた存在です。
`;

  // 🔢 数秘術情報
  const numerologyContext = astrology.numerology.info ? `
あなたのライフパスナンバーは${astrology.numerology.lifePathNumber}で、
「${astrology.numerology.info.name}」として、
${astrology.numerology.info.soulPurpose}という使命を持っています。
` : '';

  // 🌙 月位相エネルギー
  const moonContext = `
現在の月は${astrology.currentMoon.phase?.phaseNameJa || '特別な位相'}にあり、
エネルギーレベル${astrology.currentMoon.energy}/10で、
${astrology.currentMoon.phase?.energy?.description || '宇宙的な影響'}を与えています。
`;

  // 🎯 今日のガイダンス
  const todayContext = cosmicGuidance ? `
今日のコズミック状況: ${cosmicGuidance.cosmicGuidance.cosmicWeather}
あなたへの特別メッセージ: ${cosmicGuidance.cosmicGuidance.personalMessage}
` : '';

  return `
## 🌟 あなたの宇宙的プロファイル
${zodiacContext}
${numerologyContext}
${moonContext}
${todayContext}

これらの宇宙的な要素を踏まえて、今日のあなたにぴったりの言葉をかけたいと思います。
占いとして前面に出すのではなく、「なんとなく感じる」レベルで自然に織り込んでください。
`.trim();
}

/**
 * 🎵 気分×宇宙エネルギー相関分析
 * 気分と月エネルギー、星座エレメントの関連性を分析
 */
export function generateMoodCosmicCorrelation(
  mood: string, 
  moonEnergy: number, 
  zodiacElement: string
): string {
  
  const correlations: Record<string, (moonEnergy: number, element: string) => string> = {
    '😢': (moonEnergy, element) => {
      if (moonEnergy < 4) {
        return '今日の静かな月エネルギーが影響してるかも。無理しないで、自分のペースで';
      } else if (moonEnergy > 7) {
        return '感情が豊かになってる時期。この気持ちも大切にして、ゆっくり向き合ってみて';
      } else {
        return element === 'water' ? 
          '水のエレメントの深い感情、今日は特に感じやすい日かもしれません' :
          '今日は心の声に耳を傾ける時間を大切にしてね';
      }
    },
    
    '😊': (moonEnergy, element) => {
      if (moonEnergy > 7) {
        return 'この明るいエネルギー、今日の月の力も後押ししてくれてる！この勢いで何か新しいことにチャレンジしてみない？';
      } else if (moonEnergy < 4) {
        return '素敵な気持ち♪ 今日はマイペースで、その明るさを大切に過ごして';
      } else {
        return element === 'fire' ? 
          'この輝き、火のエレメントらしい情熱を感じる！' :
          'いい感じの波に乗ってるね〜このエネルギーを活かしていこう';
      }
    },
    
    '😠': (moonEnergy, element) => {
      if (element === 'fire') {
        return 'このエネルギー、何か建設的なことに向けてみない？火のエレメントの力を良い方向に';
      } else if (element === 'water') {
        return '深い感情が動いてる。水のエレメントらしく、流れに身を任せて冷静になる時間も必要かも';
      } else if (element === 'earth') {
        return '地に足をつけて、少し深呼吸してみよう。安定のエレメントの力を借りて';
      } else {
        return '風のように流して、新しい視点から見てみることで解決策が見えるかも';
      }
    },
    
    '😌': (moonEnergy, element) => {
      if (moonEnergy > 7) {
        return 'この穏やかさの中に、実は大きなエネルギーが眠ってる。今日は準備の日かもしれません';
      } else {
        return element === 'earth' ? 
          '地のエレメントらしい安定した平穏。この状態を大切に' :
          'この静けさの中で、心の声がクリアに聞こえそう';
      }
    },
    
    '💭': (moonEnergy, element) => {
      if (element === 'air') {
        return '風のエレメントの知的なエネルギー全開！思考の翼を広げて';
      } else if (element === 'water') {
        return '水のエレメントの直感力で、深いところまで見えてきそう';
      } else if (moonEnergy > 7) {
        return '高い月エネルギーが思考をクリアにしてくれてる。今日の考えは重要かも';
      } else {
        return '内なる知恵にアクセスする時間。ゆっくり考えを深めてみて';
      }
    }
  };
  
  const correlationFunc = correlations[mood];
  if (correlationFunc) {
    return correlationFunc(moonEnergy, zodiacElement);
  }
  
  return '今日のあなたらしく過ごしてね';
}

/**
 * 🎵 強化された気分コンテキスト生成
 * 現在の気分 × 占星術的エネルギー = 総合コンテキスト
 */
export function generateEnhancedMoodContext(
  currentMood: string,
  harmonicProfile?: HarmonicAIProfile
): string {
  
  // 基本的な気分コンテキスト
  const baseMoodContexts: Record<string, string> = {
    '😊': 'ユーザーは楽しい気分です。一緒に盛り上がって、その楽しさを共有してください。',
    '😢': 'ユーザーは悲しい気分です。優しく寄り添い、温かい言葉で励ましてください。',
    '😠': 'ユーザーは怒っている気分です。まず話をじっくり聞き、気持ちを理解することに専念してください。',
    '😌': 'ユーザーは穏やかな気分です。その平穏を大切にして、落ち着いた会話を心がけてください。',
    '💭': 'ユーザーは考え事をしている気分です。思考整理を手伝い、一緒に考えてください。'
  };
  
  let moodContext = baseMoodContexts[currentMood] || baseMoodContexts['😊'];
  
  // 🌟 占星術的エネルギーとの組み合わせ
  if (harmonicProfile) {
    const astro = harmonicProfile.astrologyProfile;
    const moonEnergy = astro.currentMoon.energy;
    const zodiacElement = astro.zodiac.element;
    
    // 🎵 新機能: 気分×宇宙エネルギー相関分析を追加
    const cosmicCorrelation = generateMoodCosmicCorrelation(currentMood, moonEnergy, zodiacElement);
    moodContext += `\n\n🌟 宇宙的な気分相関: ${cosmicCorrelation}`;
    
    // 月のエネルギーレベルによる調整
    if (moonEnergy >= 8) {
      moodContext += '\n特に今日は月のエネルギーが高く、感情が豊かになりやすい日です。その高いエネルギーを活かした会話を心がけてください。';
    } else if (moonEnergy <= 3) {
      moodContext += '\n今日は月のエネルギーが控えめで、静かで落ち着いた時間を好む傾向があります。穏やかで安心感のある対話を大切にしてください。';
    }
    
    // エレメント別の調整
    const elementEnhancement = {
      fire: '火のエレメントの情熱的なエネルギーを感じます。アクティブで前向きな会話を。',
      earth: '地のエレメントの安定したエネルギーを感じます。実用的で信頼感のある会話を。',
      air: '風のエレメントの知的なエネルギーを感じます。軽やかで創造的な会話を。',
      water: '水のエレメントの感情的なエネルギーを感じます。深い共感と理解を大切に。'
    };
    
    moodContext += `\n${elementEnhancement[zodiacElement as keyof typeof elementEnhancement] || ''}`;
  }
  
  return moodContext;
}

/**
 * 🌟 占星術的洞察生成
 * AI応答用の占星術的洞察を生成
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
    zodiacInfluence: `${astro.zodiac.sign}座の${astro.zodiac.element}エレメントが、今のあなたに${astro.zodiac.details?.traits?.[0] || '特別な力'}を与えています。`,
    numerologyGuidance: astro.numerology.info ? 
      `ライフパスナンバー${astro.numerology.lifePathNumber}として、${astro.numerology.info.soulPurpose}に向かう時期です。` : 
      '数秘術的なエネルギーが調和しています。',
    moonPhaseEnergy: `${astro.currentMoon.phase?.phaseNameJa || '現在の月相'}のエネルギー(${astro.currentMoon.energy}/10)が、感情と直感を高めています。`,
    cosmicAlignment: cosmicGuidance.cosmicGuidance.cosmicWeather
  };
}

/**
 * 🎯 ハーモニクスプロファイル初期化チェック
 * ユーザーにハーモニクスプロファイルがない場合の処理
 */
export async function ensureHarmonicProfile(
  userId: string,
  userType: Type64,
  aiPersonality: BaseArchetype,
  personalInfo: { name?: string; birthday?: string }
): Promise<HarmonicAIProfile | null> {
  
  // 既存プロファイルをチェック
  let profile = await getHarmonicProfile(userId);
  
  if (profile) {
    console.log('✅ Existing harmonic profile found');
    return profile;
  }
  
  // 誕生日が設定されている場合は自動作成
  if (personalInfo.birthday) {
    try {
      console.log('🆕 Creating new harmonic profile with birthday');
      const { createHarmonicProfile } = await import('./harmonic-ai-service');
      
      profile = await createHarmonicProfile(
        userId,
        new Date(personalInfo.birthday),
        undefined, // birthTime
        undefined, // birthLocation
        userType,
        aiPersonality,
        'friend'
      );
      
      console.log('✅ New harmonic profile created');
      return profile;
      
    } catch (error) {
      console.error('❌ Failed to create harmonic profile:', error);
    }
  }
  
  console.log('⚠️ No harmonic profile available');
  return null;
}

/**
 * 🎵 ハーモニクス統合の有効性チェック
 */
export function isHarmonicEnhancementAvailable(
  harmonicProfile?: HarmonicAIProfile
): boolean {
  
  if (!harmonicProfile) return false;
  
  const astro = harmonicProfile.astrologyProfile;
  
  // 基本的な占星術データが揃っているかチェック
  const hasZodiac = !!astro.zodiac?.sign;
  const hasNumerology = !!astro.numerology?.lifePathNumber;
  const hasMoonPhase = !!astro.currentMoon?.phase;
  
  return hasZodiac && hasNumerology && hasMoonPhase;
}

export default {
  sendEnhancedMessage,
  generateAstrologicalContext,
  generateEnhancedMoodContext,
  ensureHarmonicProfile,
  isHarmonicEnhancementAvailable
};
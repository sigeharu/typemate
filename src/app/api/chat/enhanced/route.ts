// 🎼 第2楽章 - Enhanced Chat API Route
// ハーモニック統合強化チャットAPI

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getHarmonicProfileServer, generateDailyHarmonicGuidanceServer } from '@/lib/harmonic-ai-service-server';
import { ARCHETYPE_DATA } from '@/lib/diagnostic-data';
import type { BaseArchetype, Type64 } from '@/types';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';
import type { DailyHarmonicGuidance } from '@/lib/harmonic-ai-service-server';
import { validateChatRequest, checkRateLimit, validateProductionSecurity } from '@/lib/input-validation';
import { securityLog, secureLog } from '@/lib/secure-logger';
import { unifiedMemorySystem, type ContextType } from '@/lib/unified-memory-system';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

export async function POST(request: NextRequest) {
  // 🛡️ セキュリティ検証
  const securityCheck = validateProductionSecurity(request);
  if (!securityCheck.isValid) {
    return NextResponse.json(
      { error: 'Security validation failed' },
      { status: 403 }
    );
  }

  // 🛡️ レート制限チェック
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  if (!checkRateLimit(clientIP, 20, 60000)) { // より厳しい制限
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    secureLog.info('Enhanced Chat API access', {
      hasMessage: !!body.message,
      hasUserType: !!body.userType,
      hasAiPersonality: !!body.aiPersonality,
      hasUserId: !!body.userId,
      clientIP: clientIP.substring(0, 10) + '...'
    });
    
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
      chatCount = 0,
      // ハーモニックチャットサービスから送信される可能性のある追加フィールド
      astrologicalContext,
      harmonicEnhancement,
      // 統合記憶システム用フィールド
      sessionId,
      conversationId
    } = body;

    // 🛡️ 基本的な入力検証
    if (!message || !userType || !aiPersonality || !userId) {
      securityLog.suspiciousActivity('Required fields missing in enhanced chat', { 
        hasMessage: !!message, 
        hasUserType: !!userType, 
        hasAiPersonality: !!aiPersonality, 
        hasUserId: !!userId 
      });
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // 🛡️ 追加的な入力サニタイゼーション
    const { validateInput } = await import('@/lib/input-validation');
    const messageValidation = validateInput.message(message);
    if (!messageValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid message content' },
        { status: 400 }
      );
    }

    secureLog.info('Enhanced Chat processing', {
      userId: userId.substring(0, 8) + '...',
      userType,
      aiPersonality,
      messageLength: message.length
    });

    // 1. ハーモニックプロファイル取得（サーバーサイド版）
    secureLog.debug('Getting harmonic profile', { userId: userId.substring(0, 8) + '...' });
    const harmonicProfile = await getHarmonicProfileServer(userId);
    secureLog.info('Harmonic profile result', { hasProfile: !!harmonicProfile });

    // 2. 今日のコズミック・ガイダンス生成（サーバーサイド版）
    secureLog.debug('Generating cosmic guidance');
    let cosmicGuidance: DailyHarmonicGuidance | undefined;
    if (harmonicProfile) {
      try {
        cosmicGuidance = await generateDailyHarmonicGuidanceServer(harmonicProfile);
        secureLog.info('Cosmic guidance generated successfully');
      } catch (error) {
        secureLog.error('Cosmic guidance generation failed', error);
        throw new Error(`Cosmic guidance generation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 3. 強化システムプロンプト構築
    secureLog.debug('Building enhanced system prompt');
    const enhancedSystemPrompt = buildEnhancedSystemPrompt({
      userType,
      aiPersonality,
      relationshipType,
      harmonicProfile: harmonicProfile || undefined,
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
    const enhancedEmotion = analyzeEnhancedEmotion(messageValidation.sanitized, harmonicProfile || undefined);

    // 6. 統合記憶システム - コンテキスト理解と記憶検索
    let memoryContext = '';
    let contextualResponse = '';
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // コンテキストタイプ分析（"それって何？" "前に言った" など）
      const contextType: ContextType = await unifiedMemorySystem.analyzeContext(
        messageValidation.sanitized,
        [] // 短期記憶は検索時に取得
      );

      // 統合記憶検索
      const memoryResult = await unifiedMemorySystem.searchMemories(
        userId,
        messageValidation.sanitized,
        currentSessionId,
        {
          includeShortTerm: true,
          includeMediumTerm: true,
          includeVectorSearch: true,
          maxResults: 5,
          contextType
        }
      );

      contextualResponse = memoryResult.context.contextualResponse;
      
      // 記憶から会話コンテキストを構築
      if (memoryResult.shortTerm.length > 0) {
        const recentMessages = memoryResult.shortTerm.slice(-3).map(msg => 
          `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
        ).join('\n');
        memoryContext += `\n## 直近の会話:\n${recentMessages}\n`;
      }

      if (memoryResult.vectorSearch && memoryResult.vectorSearch.memories.length > 0) {
        const similarMemories = memoryResult.vectorSearch.memories.slice(0, 2).map(mem => 
          `- ${mem.message_content} (類似度: ${mem.similarity})`
        ).join('\n');
        memoryContext += `\n## 関連する記憶:\n${similarMemories}\n`;
      }

      secureLog.info('Memory context generated', {
        contextType,
        shortTermCount: memoryResult.shortTerm.length,
        vectorSearchCount: memoryResult.vectorSearch?.totalFound || 0,
        hasContext: memoryContext.length > 0
      });
    } catch (error) {
      secureLog.error('Memory context generation failed', error);
      // メモリエラーでも会話は継続
    }

    // 7. 会話履歴構築（メモリコンテキスト統合）
    const conversationHistory = buildConversationHistory(messageHistory, memoryContext);

    // 8. Claude API呼び出し（強化プロンプト使用）
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.9,
      system: enhancedSystemPrompt,
      messages: [
        ...conversationHistory,
        { role: 'user', content: messageValidation.sanitized }
      ]
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!aiResponse) {
      throw new Error('No response from Claude');
    }

    // 9. 統合記憶システムに会話を保存（非同期実行）
    const saveMemoryPromises = [];
    
    // ユーザーメッセージを保存
    saveMemoryPromises.push(
      unifiedMemorySystem.saveMessage(userId, currentSessionId, {
        content: messageValidation.sanitized,
        role: 'user',
        emotion: enhancedEmotion.emotion,
        intensity: enhancedEmotion.intensity,
        archetype: userType,
        userName: personalInfo.name,
        conversationId: currentConversationId
      })
    );

    // AIレスポンスを保存
    saveMemoryPromises.push(
      unifiedMemorySystem.saveMessage(userId, currentSessionId, {
        content: aiResponse,
        role: 'ai',
        archetype: aiPersonality,
        userName: personalInfo.name,
        conversationId: currentConversationId
      })
    );

    // 非同期でメモリ保存実行（レスポンス速度に影響させない）
    Promise.all(saveMemoryPromises).then(results => {
      secureLog.info('Memory save completed', {
        userMessageSaved: results[0]?.shortTermSaved && results[0]?.mediumTermSaved,
        aiMessageSaved: results[1]?.shortTermSaved && results[1]?.mediumTermSaved,
        sessionId: currentSessionId,
        conversationId: currentConversationId
      });
    }).catch(error => {
      secureLog.error('Memory save failed', error);
    });

    // 10. 強化レスポンス構築
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
      tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      // 統合記憶システム情報
      memoryContext: {
        contextualResponse,
        sessionId: currentSessionId,
        conversationId: currentConversationId,
        hasMemoryContext: memoryContext.length > 0
      }
    };

    secureLog.info('Enhanced Chat Response generated', {
      hasAstrologicalInsight: !!enhancedResponse.astrologicalInsight,
      harmonicEnhancement: enhancedResponse.harmonicEnhancement,
      emotionIntensity: enhancedResponse.emotionAnalysis.intensity,
      moonEnergyInfluence: enhancedResponse.emotionAnalysis.moonEnergyInfluence
    });

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    secureLog.error('Enhanced Chat API Error', error);
    
    return NextResponse.json(
      { 
        error: 'Enhanced chat service temporarily unavailable',
        details: error instanceof Error ? error.message : String(error)
      },
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
- 今日のエネルギー: ${(cosmicGuidance.cosmicGuidance as any)?.overallEnergy || 8}/10
- 推奨アクション: ${((cosmicGuidance.cosmicGuidance as any)?.actionRecommendations as string[])?.slice(0, 2).join(', ') || '直感に従う'}
` : '- コズミック状況: 安定した宇宙エネルギー'}

**重要**: これらの宇宙的要素は「なんとなく感じる」「直感的に」として自然に会話に織り込む。決して占いとして明言せず、香水のように微かに香る程度で統合してください。

### 🌟 あなた専用の宇宙的パターン (個別性最強化)
${(() => {
  const cosmicPattern = generatePersonalizedCosmicPattern(harmonicProfile, aiPersonality);
  return `
- **星座×数秘術統合**: ${cosmicPattern.zodiacNumerologyPattern}
- **AI人格×占星術統合**: ${cosmicPattern.aiAstrologyPattern}
- **三要素統合パターン**: ${cosmicPattern.tripleIntegrationPattern}

**極重要**: このユニークな組み合わせを会話の中で「ふと感じた」「なんとなく思うんだけど」として自然に織り込み、${personalInfo.name ? `${personalInfo.name}さん` : 'あなた'}の個別性を際立たせてください。`;
})()}
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

### 🌟 具体的応答パターン（重要 - しげちゃんENFP最適化）

#### 星座別アドバイス例:
- **双子座**: 「あなたの好奇心」「コミュニケーション能力」「情報収集スキル」を具体的に言及し活用提案
- **蠍座**: 「深い洞察力」「変容の力」「集中力」を活かす具体的な行動推奨
- **牡羊座**: 「行動力」「リーダーシップ」「新しい挑戦」への具体的背中押し
- **蟹座**: 「共感力」「直感」「ケア精神」を活かした関係性改善提案
- **獅子座**: 「創造性」「表現力」「リーダーシップ」での輝き方を具体的に
- **乙女座**: 「分析力」「完璧主義」「実用性」を活かした改善案
- **天秤座**: 「バランス感覚」「美的センス」「調和力」での問題解決
- **射手座**: 「自由な発想」「哲学的思考」「冒険心」を活かした成長提案
- **山羊座**: 「持久力」「責任感」「実現力」での着実な前進方法
- **水瓶座**: 「独創性」「革新性」「独立性」を活かした新しいアプローチ
- **魚座**: 「直感力」「共感性」「創造性」を活かした感情的解決策

#### 月エネルギー別行動提案:
- **エネルギー8-10**: 「積極的チャレンジ」「新プロジェクト開始」「社交活動」「大胆な決断」
- **エネルギー4-7**: 「バランス調整」「計画立て」「関係性整理」「現状分析」
- **エネルギー1-3**: 「ゆっくり休息」「内省時間」「自分ケア」「静かな活動」

#### 数秘術ライフパス活用:
- **ライフパス1**: 「リーダーシップ」「独立性」「新しい道」を切り開く具体的方法
- **ライフパス2**: 「協調性」「サポート力」「調和」を活かした関係構築
- **ライフパス3**: 「創造性」「表現力」「コミュニケーション」での自己実現
- **ライフパス4**: 「安定性」「実用性」「継続力」を活かした着実な成長
- **ライフパス5**: 「自由」「冒険」「多様な経験」を通じた人生展開
- **ライフパス6**: 「ケア精神」「責任感」「愛情」を活かした貢献方法
- **ライフパス7**: 「内面探求」「スピリチュアル成長」「知的探究」の深化
- **ライフパス8**: 「実現力」「物質的成功」「影響力」を活かした達成方法
- **ライフパス9**: 「奉仕精神」「完成」「普遍的愛」を通じた使命実現

**重要**: これらの具体的要素を「なんとなく」「ふと思ったんだけど」「あなたらしいなと思うのは」等の自然な導入で、友達の直感的アドバイスレベルで統合してください。

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
 * 🌟 個別宇宙パターン生成
 * 星座×数秘術×AI人格の組み合わせパターン分析
 */
function generatePersonalizedCosmicPattern(
  harmonicProfile: HarmonicAIProfile,
  aiPersonality: BaseArchetype
): {
  zodiacNumerologyPattern: string;
  aiAstrologyPattern: string;
  tripleIntegrationPattern: string;
} {
  const astro = harmonicProfile.astrologyProfile;
  const zodiacSign = astro.zodiac.sign;
  const lifePathNumber = astro.numerology.lifePathNumber;
  const zodiacElement = astro.zodiac.element;
  
  // 🎭 星座×数秘術組み合わせパターン
  const zodiacNumerologyPatterns: Record<string, Record<number, string>> = {
    gemini: {
      1: '究極の知的リーダー - 新しいアイデアで世界を導く',
      2: '調和の伝達者 - 架け橋となって人々をつなぐ',
      3: '創造的コミュニケーター - 表現力で世界を変える',
      4: '計画的情報収集家 - 着実にネットワークを構築',
      5: '究極の自由コミュニケーター - 無限の可能性を探求',
      6: '愛のメッセンジャー - ケアと知識で人を支える',
      7: '哲学的探求者 - 深い知恵を分かりやすく伝える',
      8: '影響力のある情報発信者 - 実現力で変化を起こす',
      9: '普遍的なつながりの創造者 - 世界規模で人を結ぶ'
    },
    scorpio: {
      1: '変容のリーダー - 根本から世界を変革する',
      2: '深い共感の橋渡し役 - 心の奥底で人とつながる',
      3: '感情の錬金術師 - 深い体験を芸術に昇華',
      4: '忍耐の変容者 - 時間をかけて確実に変化を起こす',
      5: '自由な変容の探求者 - 制約を超えて真の自由を',
      6: '愛の変容者 - 深い愛で人を癒し変える',
      7: '神秘の探求者 - スピリチュアルな深みを追求',
      8: '権力の変容者 - 影響力で世界の構造を変える',
      9: '普遍的変容の使者 - 人類全体の進化に貢献'
    }
    // 他の星座パターンも必要に応じて追加可能
  };
  
  // 🤖 AI人格×占星術組み合わせパターン
  const aiAstrologyPatterns: Record<BaseArchetype, Record<string, string>> = {
    ARC: {
      fire: '構造化された情熱創造 - 計画的な革新で世界を設計',
      earth: '現実的建築家 - 着実に理想の世界を構築',
      air: '知的設計者 - 論理と直感で未来をデザイン',
      water: '感情豊かな建築家 - 心に響く構造を創造'
    },
    DRM: {
      fire: '情熱的理想実現者 - 夢を現実に燃やし尽くす',
      earth: '地に足ついた夢想家 - 実現可能な理想を追求',
      air: '知的夢想家 - 論理的に理想を構築',
      water: '感情豊かな理想実現 - 深い感情で夢を現実に'
    },
    SAG: {
      fire: '情熱的知恵の伝達者 - 熱い心で真理を語る',
      earth: '実用的賢者 - 使える知恵を着実に伝える',
      air: '知的賢者 - 論理と洞察で導く',
      water: '共感的賢者 - 感情に寄り添う深い知恵'
    },
    HER: {
      fire: '燃える正義の戦士 - 情熱で困難を打ち破る',
      earth: '着実な守護者 - 確実に人々を守り抜く',
      air: '知的戦略家 - 頭脳で勝利を掴む',
      water: '感情の盾 - 心で人々を守り支える'
    }
    // 他のAI人格パターンも基本構造は同様
  };
  
  // デフォルトパターンの生成
  const defaultZodiacNumerology = `${zodiacSign}座×ライフパス${lifePathNumber}の特別な組み合わせ`;
  const defaultAiAstrology = `${aiPersonality}×${zodiacElement}エレメントの調和`;
  
  const zodiacNumerologyPattern = 
    zodiacNumerologyPatterns[zodiacSign]?.[lifePathNumber] || defaultZodiacNumerology;
  
  const aiAstrologyPattern = 
    aiAstrologyPatterns[aiPersonality]?.[zodiacElement] || defaultAiAstrology;
  
  // 🌟 三要素統合パターン
  const tripleIntegrationPattern = `あなたは ${zodiacSign}座の ${zodiacElement}エレメント、ライフパス${lifePathNumber}、そして${aiPersonality}アーキタイプとの深い共鳴を持つ、宇宙的に特別な存在です。この組み合わせは、${zodiacNumerologyPattern}の特質と${aiAstrologyPattern}の力を併せ持つ、まさにユニークな魂の青写真を示しています。`;
  
  return {
    zodiacNumerologyPattern,
    aiAstrologyPattern,
    tripleIntegrationPattern
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
 * 📖 会話履歴構築（統合記憶システム対応）
 */
function buildConversationHistory(messageHistory: string[], memoryContext?: string) {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  // メモリコンテキストがある場合は最初に挿入
  if (memoryContext && memoryContext.trim()) {
    history.push({ 
      role: 'user', 
      content: `[記憶コンテキスト]${memoryContext}[/記憶コンテキスト]\n\n現在のメッセージ:` 
    });
  }
  
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
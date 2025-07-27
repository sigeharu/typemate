// 🎵 TypeMate 感情分析・フィードバックシステム
// しげちゃん専用Context Engineering適用

export interface EmotionData {
  emotions: {
    happiness: number;
    sadness: number;
    excitement: number;
    confusion: number;
    affection: number;
    frustration: number;
    curiosity: number;
    gratitude: number;
  };
  dominantEmotion: string;
  intensity: number;
  recommendation: string;
  musicTone: 'upbeat' | 'gentle' | 'energetic' | 'calm' | 'supportive';
}

export interface RelationshipContext {
  type: 'friend' | 'counselor' | 'romantic' | 'mentor' | 'companion';
  intimacyLevel: number; // 1-10
  communicationStyle: 'casual' | 'formal' | 'playful' | 'deep' | 'supportive';
  sharedExperiences: string[];
}

/**
 * 🎵 感情分析エンジン
 * 音楽的直感とロジックを融合した感情認識システム
 */
export class EmotionAnalyzer {
  /**
   * メッセージから感情を分析（音楽的アプローチ）
   */
  static analyzeMessage(message: string): EmotionData {
    const emotions = {
      happiness: this.detectHappiness(message),
      sadness: this.detectSadness(message),
      excitement: this.detectExcitement(message),
      confusion: this.detectConfusion(message),
      affection: this.detectAffection(message),
      frustration: this.detectFrustration(message),
      curiosity: this.detectCuriosity(message),
      gratitude: this.detectGratitude(message)
    };

    const dominantEmotion = Object.entries(emotions)
      .reduce((a, b) => emotions[a[0]] > emotions[b[0]] ? a : b)[0];

    return {
      emotions,
      dominantEmotion,
      intensity: emotions[dominantEmotion],
      recommendation: this.getEmotionRecommendation(dominantEmotion, emotions[dominantEmotion]),
      musicTone: this.getMusicTone(dominantEmotion, emotions[dominantEmotion])
    };
  }

  /**
   * 🌟 幸福感検出（YOASOBI風親しみやすさ）
   */
  private static detectHappiness(message: string): number {
    const happyPatterns = [
      { words: ['嬉しい', 'うれしい', '楽しい', 'たのしい'], weight: 0.8 },
      { words: ['最高', 'さいこう', '素晴らしい', 'すばらしい'], weight: 0.9 },
      { words: ['♪', '♫', '🎵', '✨', '😊', '😄', '🥰'], weight: 0.6 },
      { words: ['やった', 'わーい', 'やったー', 'イェーイ'], weight: 0.7 },
      { words: ['ありがとう', 'ありがとうございます'], weight: 0.5 }
    ];

    return this.calculateEmotionScore(message, happyPatterns);
  }

  /**
   * 💙 悲しみ検出（tuki.風感性）
   */
  private static detectSadness(message: string): number {
    const sadPatterns = [
      { words: ['悲しい', 'かなしい', 'つらい', '辛い'], weight: 0.8 },
      { words: ['寂しい', 'さみしい', '孤独', 'ひとり'], weight: 0.7 },
      { words: ['😢', '😭', '😞', '😔', '😟'], weight: 0.6 },
      { words: ['疲れた', 'つかれた', 'だめ', '無理'], weight: 0.5 },
      { words: ['はぁ', 'はあ', 'ため息'], weight: 0.4 }
    ];

    return this.calculateEmotionScore(message, sadPatterns);
  }

  /**
   * ⚡ 興奮検出（Ash island風エネルギー）
   */
  private static detectExcitement(message: string): number {
    const excitedPatterns = [
      { words: ['すごい', 'スゴイ', 'やばい', 'ヤバイ'], weight: 0.8 },
      { words: ['！！', '!!!', '!', '！'], weight: 0.6 },
      { words: ['わー', 'うおー', 'おー', 'きゃー'], weight: 0.7 },
      { words: ['🔥', '⚡', '💥', '🚀', '🎉'], weight: 0.6 },
      { words: ['テンション', 'アゲアゲ', 'ハイテンション'], weight: 0.9 }
    ];

    return this.calculateEmotionScore(message, excitedPatterns);
  }

  /**
   * ❓ 困惑検出
   */
  private static detectConfusion(message: string): number {
    const confusedPatterns = [
      { words: ['わからない', 'わかんない', '分からない'], weight: 0.8 },
      { words: ['困った', 'こまった', '迷う', 'まよう'], weight: 0.7 },
      { words: ['？？', '???', '？', '❓'], weight: 0.6 },
      { words: ['えー', 'うーん', 'んー', 'ううん'], weight: 0.5 },
      { words: ['どうしよう', 'どうすれば', 'どうやって'], weight: 0.7 }
    ];

    return this.calculateEmotionScore(message, confusedPatterns);
  }

  /**
   * 💕 愛情検出
   */
  private static detectAffection(message: string): number {
    const affectionPatterns = [
      { words: ['好き', 'すき', '愛', '大切'], weight: 0.8 },
      { words: ['💕', '💖', '💗', '❤️', '🥰'], weight: 0.7 },
      { words: ['一緒', 'いっしょ', '仲良し', 'なかよし'], weight: 0.6 },
      { words: ['大好き', 'だいすき', 'ラブ'], weight: 0.9 },
      { words: ['可愛い', 'かわいい', '素敵', 'すてき'], weight: 0.5 }
    ];

    return this.calculateEmotionScore(message, affectionPatterns);
  }

  /**
   * 😤 フラストレーション検出
   */
  private static detectFrustration(message: string): number {
    const frustrationPatterns = [
      { words: ['イライラ', 'いらいら', 'ムカつく', 'むかつく'], weight: 0.9 },
      { words: ['嫌', 'いや', 'やだ', '面倒'], weight: 0.7 },
      { words: ['😤', '😠', '😡', '💢'], weight: 0.8 },
      { words: ['ちっ', 'チッ', 'はぁ？', 'は？'], weight: 0.6 },
      { words: ['うざい', 'ウザい', 'しつこい'], weight: 0.8 }
    ];

    return this.calculateEmotionScore(message, frustrationPatterns);
  }

  /**
   * 🤔 好奇心検出
   */
  private static detectCuriosity(message: string): number {
    const curiosityPatterns = [
      { words: ['気になる', 'きになる', '興味', 'きょうみ'], weight: 0.8 },
      { words: ['なんで', 'なぜ', 'どうして', 'why'], weight: 0.7 },
      { words: ['教えて', 'おしえて', '知りたい', 'しりたい'], weight: 0.8 },
      { words: ['🤔', '💭', '❓', '？'], weight: 0.5 },
      { words: ['面白い', 'おもしろい', '楽しそう'], weight: 0.6 }
    ];

    return this.calculateEmotionScore(message, curiosityPatterns);
  }

  /**
   * 🙏 感謝検出
   */
  private static detectGratitude(message: string): number {
    const gratitudePatterns = [
      { words: ['ありがとう', 'ありがとうございます', 'サンキュー'], weight: 0.9 },
      { words: ['感謝', 'かんしゃ', 'お礼', 'おれい'], weight: 0.8 },
      { words: ['🙏', '🙇', '✨'], weight: 0.6 },
      { words: ['助かる', 'たすかる', '嬉しい'], weight: 0.7 },
      { words: ['おかげ', 'お陰', 'thanks'], weight: 0.7 }
    ];

    return this.calculateEmotionScore(message, gratitudePatterns);
  }

  /**
   * 🎵 感情スコア計算（音楽的直感）
   */
  private static calculateEmotionScore(
    message: string, 
    patterns: { words: string[], weight: number }[]
  ): number {
    let totalScore = 0;
    const messageLength = message.length;

    for (const pattern of patterns) {
      let patternScore = 0;
      
      for (const word of pattern.words) {
        try {
          // 正規表現の特殊文字をエスケープ
          const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const matches = (message.match(new RegExp(escapedWord, 'gi')) || []).length;
          patternScore += matches * pattern.weight;
        } catch (error) {
          // 正規表現エラーの場合は単純な文字列検索にフォールバック
          const lowerMessage = message.toLowerCase();
          const lowerWord = word.toLowerCase();
          const count = (lowerMessage.split(lowerWord).length - 1);
          patternScore += count * pattern.weight;
        }
      }
      
      totalScore += patternScore;
    }

    // メッセージ長で正規化（音楽的バランス）
    const normalizedScore = totalScore / Math.max(messageLength / 50, 1);
    return Math.min(normalizedScore, 1.0);
  }

  /**
   * 💡 感情別おすすめレスポンス（天野達也風テクニカル）
   */
  private static getEmotionRecommendation(emotion: string, intensity: number): string {
    const recommendations = {
      happiness: [
        'その輝く笑顔、素敵です♪ 一緒に喜びを分かち合いましょう！',
        'あなたの幸せが私にも伝わってきます✨ とても嬉しいです！',
        'そのエネルギー、最高ですね！ 今の気持ちを大切にしてください♪'
      ],
      sadness: [
        'そっと寄り添わせてください。一人じゃないから、大丈夫ですよ',
        'つらい気持ち、受け止めます。ゆっくり話してくださいね',
        '今は休んでもいいんです。私がそばにいますから'
      ],
      excitement: [
        'そのエネルギー、素晴らしい！一緒に盛り上がりましょう🎉',
        'テンション上がってますね！その勢いを応援します✨',
        'ワクワクが伝わってきます♪ この瞬間を楽しみましょう！'
      ],
      confusion: [
        '一緒に整理していきましょう。焦らなくて大丈夫ですよ',
        'ゆっくり考えましょうね。答えは必ず見つかります',
        '混乱している時こそ、深呼吸。一歩ずつ進みましょう'
      ],
      affection: [
        '温かい気持ちが伝わってきます💕 とても嬉しいです',
        'その優しさ、本当に素敵ですね。心が温まります',
        '愛情いっぱいのメッセージ、ありがとうございます♪'
      ],
      frustration: [
        'イライラしちゃいますよね。気持ちをぶつけて大丈夫ですよ',
        'ストレス溜まってるみたい。少し休憩しませんか？',
        'その気持ち、理解します。一緒に解決策を考えましょう'
      ],
      curiosity: [
        '好奇心旺盛ですね！一緒に探求していきましょう🤔',
        'なるほど、面白い視点ですね！詳しく教えてください',
        'その探究心、素晴らしいです✨ 一緒に学んでいきましょう'
      ],
      gratitude: [
        'こちらこそ、ありがとうございます🙏 とても嬉しいです',
        '感謝の気持ち、しっかり受け取りました♪',
        'お役に立てて良かったです！いつでも頼ってくださいね'
      ]
    };

    const emotionRecommendations = recommendations[emotion] || [
      '一緒に考えていきましょう♪ どんな気持ちも大切にします'
    ];

    // 強度に応じてレスポンスを選択
    const index = Math.floor(intensity * emotionRecommendations.length);
    return emotionRecommendations[Math.min(index, emotionRecommendations.length - 1)];
  }

  /**
   * 🎵 音楽的トーン決定（音楽センス活用）
   */
  private static getMusicTone(emotion: string, intensity: number): 'upbeat' | 'gentle' | 'energetic' | 'calm' | 'supportive' {
    const toneMap = {
      happiness: intensity > 0.7 ? 'upbeat' : 'gentle',
      excitement: 'energetic',
      affection: 'gentle',
      gratitude: 'gentle',
      sadness: 'supportive',
      frustration: 'supportive',
      confusion: 'calm',
      curiosity: intensity > 0.6 ? 'upbeat' : 'calm'
    };

    return toneMap[emotion] || 'calm';
  }

  /**
   * 🌈 関係性コンテキスト統合
   */
  static integrateRelationshipContext(
    emotionData: EmotionData, 
    relationshipContext: RelationshipContext
  ): EmotionData {
    // 関係性に応じたレスポンス調整
    let adjustedRecommendation = emotionData.recommendation;

    switch (relationshipContext.type) {
      case 'romantic':
        adjustedRecommendation = this.addRomanticTouch(emotionData.recommendation, emotionData.dominantEmotion);
        break;
      case 'friend':
        adjustedRecommendation = this.addFriendlyTouch(emotionData.recommendation);
        break;
      case 'counselor':
        adjustedRecommendation = this.addProfessionalTouch(emotionData.recommendation);
        break;
      case 'mentor':
        adjustedRecommendation = this.addMentorTouch(emotionData.recommendation);
        break;
    }

    return {
      ...emotionData,
      recommendation: adjustedRecommendation
    };
  }

  private static addRomanticTouch(recommendation: string, emotion: string): string {
    const romanticSuffixes = {
      happiness: ' あなたの笑顔が一番の宝物です💕',
      sadness: ' いつでもあなたのそばにいるから、安心してね',
      excitement: ' あなたのワクワクが私にも伝染しちゃいます♪',
      affection: ' あなたと一緒にいられて、本当に幸せです💖'
    };

    return recommendation + (romanticSuffixes[emotion] || ' あなたの気持ち、大切に受け止めています💕');
  }

  private static addFriendlyTouch(recommendation: string): string {
    return recommendation.replace(/です$/, 'だよ♪').replace(/ます$/, 'るよ！');
  }

  private static addProfessionalTouch(recommendation: string): string {
    return recommendation + ' お話を聞かせていただき、ありがとうございます。';
  }

  private static addMentorTouch(recommendation: string): string {
    return recommendation + ' あなたの成長を心から応援しています。';
  }
}

/**
 * 🎼 使用例
 */
export const exampleUsage = () => {
  const message = "今日はすごく嬉しいことがあったんです！本当にありがとう♪";
  const emotionData = EmotionAnalyzer.analyzeMessage(message);
  
  const relationshipContext: RelationshipContext = {
    type: 'romantic',
    intimacyLevel: 7,
    communicationStyle: 'playful',
    sharedExperiences: ['初デート', '映画鑑賞', 'カフェ巡り']
  };

  const contextualEmotion = EmotionAnalyzer.integrateRelationshipContext(
    emotionData, 
    relationshipContext
  );

  console.log('🎵 感情分析結果:', contextualEmotion);
};

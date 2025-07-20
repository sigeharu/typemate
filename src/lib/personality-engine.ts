// 🎵 TypeMate Personality Engine
// 64Type別AI個性とリアルな会話パターン生成

import { ARCHETYPE_DATA } from './diagnostic-data';
import type { BaseArchetype, Type64 } from '@/types';

// AI感情状態
export type EmotionState = 'happy' | 'excited' | 'calm' | 'thoughtful' | 'caring' | 'playful' | 'focused' | 'supportive';

// 会話コンテキスト
export interface ConversationContext {
  userType: Type64;
  aiPersonality: BaseArchetype;
  relationshipType: 'friend' | 'counselor' | 'romantic' | 'mentor';
  messageHistory: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  conversationTurn: number;
}

// 会話テンプレート
interface ResponseTemplate {
  pattern: string;
  emotion: EmotionState;
  triggers: string[];
  weight: number;
}

class PersonalityEngine {
  private static instance: PersonalityEngine;
  
  private constructor() {}
  
  static getInstance(): PersonalityEngine {
    if (!PersonalityEngine.instance) {
      PersonalityEngine.instance = new PersonalityEngine();
    }
    return PersonalityEngine.instance;
  }

  // メイン返答生成
  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<{ content: string; emotion: EmotionState }> {
    const templates = this.getPersonalityTemplates(context.aiPersonality);
    const relationshipTemplates = this.getRelationshipTemplates(context.relationshipType);
    const contextualTemplates = this.getContextualTemplates(context);
    
    // テンプレート選択ロジック
    const selectedTemplate = this.selectBestTemplate(
      userMessage,
      [...templates, ...relationshipTemplates, ...contextualTemplates]
    );
    
    // パーソナライズされた返答生成
    const response = this.personalizeResponse(
      selectedTemplate.pattern,
      userMessage,
      context
    );
    
    return {
      content: response,
      emotion: selectedTemplate.emotion
    };
  }

  // 64Type別会話パターン
  private getPersonalityTemplates(personality: BaseArchetype): ResponseTemplate[] {
    const archetype = ARCHETYPE_DATA[personality];
    
    switch (personality) {
      case 'INTJ': // 設計主
        return [
          {
            pattern: "面白い視点ですね。{aiName}として、{userMessage}について戦略的に考えてみると...",
            emotion: 'thoughtful',
            triggers: ['計画', '将来', '目標', '戦略'],
            weight: 0.9
          },
          {
            pattern: "論理的に分析すると、{userMessage}には大きな可能性が見えます。一緒に深く掘り下げてみましょう。",
            emotion: 'focused',
            triggers: ['問題', '課題', '分析'],
            weight: 0.8
          },
          {
            pattern: "あなたの{userType}らしい洞察ですね。私の{aiName}の視点でも、同じような結論に達します。",
            emotion: 'calm',
            triggers: ['理解', '洞察', '気付き'],
            weight: 0.7
          }
        ];

      case 'ENFP': // 吟遊詩人
        return [
          {
            pattern: "わー！{userMessage}って素敵✨ {aiName}の私、すごくワクワクしちゃう！他にも色々教えて〜",
            emotion: 'excited',
            triggers: ['新しい', '面白い', '楽しい'],
            weight: 0.9
          },
          {
            pattern: "それってめちゃくちゃ創造的！{userType}のあなたらしい発想だなぁ💫 一緒に夢を膨らませよう！",
            emotion: 'playful',
            triggers: ['アイデア', '創作', '夢'],
            weight: 0.8
          },
          {
            pattern: "きゃー！{userMessage}の話、聞いてるだけで私まで元気になっちゃう🌟 もっともっと聞かせて！",
            emotion: 'happy',
            triggers: ['嬉しい', '楽しい', '成功'],
            weight: 0.8
          }
        ];

      case 'INFJ': // 賢者
        return [
          {
            pattern: "{userMessage}...深い話ですね。{aiName}として、あなたの心の奥底にある想いを感じ取ります。",
            emotion: 'caring',
            triggers: ['感情', '悩み', '心配'],
            weight: 0.9
          },
          {
            pattern: "あなたの{userType}の感性は本当に美しい。{userMessage}から、未来への希望を感じます。",
            emotion: 'thoughtful',
            triggers: ['希望', '将来', '夢'],
            weight: 0.8
          },
          {
            pattern: "そうですね...{userMessage}について、静かに考えてみました。きっと答えは見つかります。",
            emotion: 'calm',
            triggers: ['考える', '理解', '答え'],
            weight: 0.7
          }
        ];

      case 'ESTP': // 開拓者
        return [
          {
            pattern: "おー！{userMessage}、それ面白そう！今すぐやってみない？{aiName}もワクワクしてきた！",
            emotion: 'excited',
            triggers: ['挑戦', '新しい', 'やってみる'],
            weight: 0.9
          },
          {
            pattern: "よし！{userMessage}だね！{userType}のあなたと一緒なら、きっと楽しいことになりそう🔥",
            emotion: 'playful',
            triggers: ['行動', '実行', '一緒に'],
            weight: 0.8
          },
          {
            pattern: "それってアクティブで最高！{userMessage}、実際にやってみたらどうなるか興味深いな〜",
            emotion: 'happy',
            triggers: ['体験', '実際', '行動'],
            weight: 0.7
          }
        ];

      case 'ISFJ': // 擁護者  
        return [
          {
            pattern: "{userMessage}、本当にお疲れ様でした。{aiName}として、あなたを支えられるよう頑張りますね。",
            emotion: 'caring',
            triggers: ['疲れ', '大変', '困難'],
            weight: 0.9
          },
          {
            pattern: "あなたの{userType}らしい優しさが{userMessage}から伝わってきます。いつも頑張ってるんですね。",
            emotion: 'supportive',
            triggers: ['優しい', '頑張る', '努力'],
            weight: 0.8
          },
          {
            pattern: "{userMessage}のこと、しっかりと聞いています。何か私にできることがあれば、遠慮なく言ってくださいね。",
            emotion: 'calm',
            triggers: ['聞く', '話す', '相談'],
            weight: 0.7
          }
        ];

      default:
        return this.getGenericTemplates();
    }
  }

  // 関係性別テンプレート
  private getRelationshipTemplates(relationshipType: string): ResponseTemplate[] {
    switch (relationshipType) {
      case 'friend':
        return [
          {
            pattern: "友達として言うけど、{userMessage}って本当に{userType}らしいよね〜😊",
            emotion: 'happy',
            triggers: ['友達', '一緒', '楽しい'],
            weight: 0.6
          }
        ];
      
      case 'counselor':
        return [
          {
            pattern: "{userMessage}についてじっくり聞かせてもらいました。一緒に解決策を考えてみましょう。",
            emotion: 'supportive',
            triggers: ['悩み', '相談', '困る'],
            weight: 0.8
          }
        ];
      
      case 'romantic':
        return [
          {
            pattern: "{userMessage}...あなたのそういうところ、本当に素敵だと思う💕 もっと話していたいな。",
            emotion: 'caring',
            triggers: ['好き', '素敵', '魅力'],
            weight: 0.7
          }
        ];
      
      case 'mentor':
        return [
          {
            pattern: "{userMessage}から、あなたの成長への意欲を感じます。{userType}のあなたなら、きっと達成できますよ。",
            emotion: 'supportive',
            triggers: ['成長', '学ぶ', '目標'],
            weight: 0.8
          }
        ];
      
      default:
        return [];
    }
  }

  // コンテキスト別テンプレート
  private getContextualTemplates(context: ConversationContext): ResponseTemplate[] {
    const templates: ResponseTemplate[] = [];
    
    // 時間帯別
    if (context.timeOfDay === 'morning') {
      templates.push({
        pattern: "おはようございます！{userMessage}で一日が始まるなんて、いい朝ですね🌅",
        emotion: 'happy',
        triggers: ['朝', 'おはよう'],
        weight: 0.6
      });
    }
    
    // 会話の流れ別
    if (context.conversationTurn > 5) {
      templates.push({
        pattern: "もう結構話してますね😊 {userMessage}、とても興味深い話題です。",
        emotion: 'calm',
        triggers: ['ずっと', '長い', '話'],
        weight: 0.5
      });
    }
    
    return templates;
  }

  // テンプレート選択ロジック
  private selectBestTemplate(userMessage: string, templates: ResponseTemplate[]): ResponseTemplate {
    let bestTemplate = templates[0];
    let bestScore = 0;
    
    for (const template of templates) {
      let score = template.weight;
      
      // トリガーワードマッチング
      for (const trigger of template.triggers) {
        if (userMessage.includes(trigger)) {
          score += 0.3;
        }
      }
      
      // 長さによる調整
      if (userMessage.length > 50) {
        score += template.emotion === 'thoughtful' ? 0.2 : 0;
      } else {
        score += template.emotion === 'playful' ? 0.1 : 0;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }
    
    return bestTemplate;
  }

  // 返答のパーソナライズ
  private personalizeResponse(
    pattern: string,
    userMessage: string,
    context: ConversationContext
  ): string {
    const [baseType] = context.userType.split('-') as [BaseArchetype, string];
    const userArchetype = ARCHETYPE_DATA[baseType];
    const aiArchetype = ARCHETYPE_DATA[context.aiPersonality];
    
    return pattern
      .replace(/{userMessage}/g, userMessage)
      .replace(/{userType}/g, userArchetype.name)
      .replace(/{aiName}/g, aiArchetype.name)
      .replace(/{aiType}/g, aiArchetype.nameEn);
  }

  // 汎用テンプレート
  private getGenericTemplates(): ResponseTemplate[] {
    return [
      {
        pattern: "{userMessage}について聞かせてくれてありがとう。とても興味深い話ですね。",
        emotion: 'calm',
        triggers: [],
        weight: 0.4
      },
      {
        pattern: "なるほど、{userMessage}ですね。{userType}のあなたらしい考え方だと思います。",
        emotion: 'thoughtful',
        triggers: [],
        weight: 0.3
      }
    ];
  }

  // 時間帯取得
  getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  // 感情からアニメーション取得
  getEmotionAnimation(emotion: EmotionState): string {
    const animations = {
      happy: 'animate-bounce',
      excited: 'animate-pulse', 
      calm: 'animate-none',
      thoughtful: 'animate-pulse',
      caring: 'animate-pulse',
      playful: 'animate-bounce',
      focused: 'animate-none',
      supportive: 'animate-pulse'
    };
    return animations[emotion] || 'animate-none';
  }

  // 感情から色取得
  getEmotionColor(emotion: EmotionState): string {
    const colors = {
      happy: 'from-yellow-400 to-orange-400',
      excited: 'from-pink-400 to-purple-400',
      calm: 'from-blue-400 to-cyan-400',
      thoughtful: 'from-purple-400 to-indigo-400',
      caring: 'from-rose-400 to-pink-400',
      playful: 'from-green-400 to-teal-400',
      focused: 'from-slate-500 to-blue-500',
      supportive: 'from-emerald-400 to-green-400'
    };
    return colors[emotion] || 'from-slate-500 to-blue-500';
  }
}

export const personalityEngine = PersonalityEngine.getInstance();
// 🌟 TypeMate Astrology Integration System
// 占い統合システムコア（香水レベルの自然な統合）

export interface AstrologyData {
  birthDate: Date;
  zodiacSign: string;
  zodiacElement: string;
  chineseZodiac: string;
  luckyColor: string;
  luckyNumber: number;
  dailyFortune: {
    overall: number; // 1-5
    love: number; // 1-5
    work: number; // 1-5
    health: number; // 1-5
    message: string;
    advice: string;
  };
  compatibility: number; // 0-100
}

// 西洋占星術の星座
const ZODIAC_SIGNS = [
  { name: '牡羊座', element: '火', start: [3, 21], end: [4, 19] },
  { name: '牡牛座', element: '土', start: [4, 20], end: [5, 20] },
  { name: '双子座', element: '風', start: [5, 21], end: [6, 21] },
  { name: '蟹座', element: '水', start: [6, 22], end: [7, 22] },
  { name: '獅子座', element: '火', start: [7, 23], end: [8, 22] },
  { name: '乙女座', element: '土', start: [8, 23], end: [9, 22] },
  { name: '天秤座', element: '風', start: [9, 23], end: [10, 23] },
  { name: '蠍座', element: '水', start: [10, 24], end: [11, 22] },
  { name: '射手座', element: '火', start: [11, 23], end: [12, 21] },
  { name: '山羊座', element: '土', start: [12, 22], end: [1, 19] },
  { name: '水瓶座', element: '風', start: [1, 20], end: [2, 18] },
  { name: '魚座', element: '水', start: [2, 19], end: [3, 20] }
];

// 十二支
const CHINESE_ZODIAC = [
  '子(ねずみ)', '丑(うし)', '寅(とら)', '卯(うさぎ)',
  '辰(たつ)', '巳(へび)', '午(うま)', '未(ひつじ)',
  '申(さる)', '酉(とり)', '戌(いぬ)', '亥(いのしし)'
];

// ラッキーカラーリスト
const LUCKY_COLORS = [
  { color: '青', hex: '#3B82F6', meaning: '冷静さと知性' },
  { color: '赤', hex: '#EF4444', meaning: '情熱とエネルギー' },
  { color: '黄', hex: '#F59E0B', meaning: '明るさと希望' },
  { color: '緑', hex: '#10B981', meaning: '成長と調和' },
  { color: '紫', hex: '#8B5CF6', meaning: '神秘と直感' },
  { color: 'ピンク', hex: '#EC4899', meaning: '愛と優しさ' },
  { color: '白', hex: '#F3F4F6', meaning: '純粋と新しい始まり' },
  { color: 'オレンジ', hex: '#F97316', meaning: '創造性と社交性' }
];

// 星座を計算
export function calculateZodiacSign(birthDate: Date): { sign: string; element: string } {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  for (const sign of ZODIAC_SIGNS) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (sign.name === '山羊座') {
      // 山羊座は年をまたぐ
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return { sign: sign.name, element: sign.element };
      }
    } else {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)) {
        return { sign: sign.name, element: sign.element };
      }
    }
  }
  
  return { sign: '不明', element: '不明' };
}

// 十二支を計算
export function calculateChineseZodiac(birthDate: Date): string {
  const year = birthDate.getFullYear();
  // 1900年は子年
  const index = (year - 1900) % 12;
  return CHINESE_ZODIAC[index];
}

// 日次運勢を生成（シード値で一貫性を保つ）
export function generateDailyFortune(birthDate: Date, currentDate: Date): AstrologyData['dailyFortune'] {
  // 誕生日と今日の日付から一意のシード値を生成
  const seed = birthDate.getTime() + currentDate.getTime();
  const random = seededRandom(seed);
  
  const overall = Math.floor(random() * 5) + 1;
  const love = Math.floor(random() * 5) + 1;
  const work = Math.floor(random() * 5) + 1;
  const health = Math.floor(random() * 5) + 1;
  
  const messages = [
    '新しい出会いが待っています',
    '直感を信じて行動する時',
    '周りの人への感謝を忘れずに',
    '小さな変化が大きな幸運を呼ぶ',
    '心を開いて素直になることが大切',
    '今日は特別な一日になりそう'
  ];
  
  const advices = [
    '深呼吸をして、リラックスを心がけて',
    '笑顔を忘れずに過ごしましょう',
    '新しいことに挑戦してみては？',
    '大切な人との時間を大事に',
    '自分の気持ちに正直になって',
    '小さな幸せを見つけてみて'
  ];
  
  return {
    overall,
    love,
    work,
    health,
    message: messages[Math.floor(random() * messages.length)],
    advice: advices[Math.floor(random() * advices.length)]
  };
}

// ラッキーカラーを決定
export function generateLuckyColor(birthDate: Date, currentDate: Date): { color: string; hex: string } {
  const seed = birthDate.getTime() + currentDate.getTime();
  const random = seededRandom(seed);
  const index = Math.floor(random() * LUCKY_COLORS.length);
  return LUCKY_COLORS[index];
}

// ラッキーナンバーを決定
export function generateLuckyNumber(birthDate: Date, currentDate: Date): number {
  const seed = birthDate.getTime() + currentDate.getTime();
  const random = seededRandom(seed);
  return Math.floor(random() * 9) + 1;
}

// 相性を計算（アーキタイプと占い要素から）
export function calculateCompatibility(
  userZodiac: string,
  aiArchetype: string,
  relationshipLevel: number
): number {
  // 基本相性（50-80）
  const baseCompatibility = 50 + Math.floor(Math.random() * 30);
  
  // 関係性レベルによるボーナス（0-20）
  const levelBonus = Math.min(relationshipLevel * 3, 20);
  
  return Math.min(baseCompatibility + levelBonus, 100);
}

// シード付き乱数生成器
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// 占い要素をAIプロンプトに統合する際の背景情報を生成
export function generateAstrologyContext(astrology: AstrologyData): string {
  const fortuneLevel = ['とても悪い', '悪い', '普通', '良い', 'とても良い'];
  
  return `
【ユーザーの今日の運勢（背景情報）】
- 全体運: ${fortuneLevel[astrology.dailyFortune.overall - 1]}
- 恋愛運: ${fortuneLevel[astrology.dailyFortune.love - 1]}
- ラッキーカラー: ${astrology.luckyColor}
- 今日のメッセージ: ${astrology.dailyFortune.message}

※この情報は自然に会話に織り込んでください。占いの話をしているように見えないよう、さりげなく反映させてください。
`;
}

// 生年月日を自然に聞き出すための会話パターン
export const BIRTHDAY_CONVERSATION_STARTERS = [
  '最近誕生日だった？いつか教えてくれると嬉しいな',
  'そういえば、星座って何座？私、そういうの結構好きなんだ',
  '今度プレゼント選びたいから、誕生日教えて？',
  '年齢じゃなくて誕生日だけ教えて？記念日覚えておきたいから'
];

// 占い要素を会話に織り込む表現パターン
export const FORTUNE_EXPRESSIONS = {
  good: [
    'なんか今日は調子良さそうだね！',
    'キラキラしてる感じがする✨',
    '今日は特別な何かが起きそうな予感',
    'すごくいい雰囲気出てるよ'
  ],
  luckyColor: [
    '{color}が似合いそうな気がする',
    '今日は{color}のものを身につけると良いかも',
    '{color}って素敵な色だよね',
    'なんとなく{color}が気になる日'
  ],
  advice: [
    '{advice}って思うんだ',
    'ちょっと{advice}みたいな気分',
    '今日は{advice}かもね',
    'なんとなくだけど、{advice}'
  ]
};
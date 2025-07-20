// 🎵 TypeMate MBTI Data
// MBTI型別の恋人キャラクター設定

import type { MBTIType, MBTITypeData } from '@/types';

export const MBTI_TYPES: Record<MBTIType, MBTITypeData> = {
  ENFP: {
    name: '運動家',
    description: '情熱的で創造性豊かな自由人',
    color: 'bg-orange-500',
    traits: ['創造的', '社交的', '楽観的', '柔軟'],
    personality: '明るくて元気いっぱい！いつも新しいことを一緒に発見したい冒険好きな恋人',
    loveStyle: '毎日がサプライズで満ちた、刺激的で情熱的な恋愛を好む'
  },
  INFP: {
    name: '仲介者',
    description: '詩人肌で親切な利他主義者',
    color: 'bg-purple-500',
    traits: ['理想主義', '共感的', '創造的', '個人的価値重視'],
    personality: '深く優しい心を持った、あなたの内面を理解してくれる包容力のある恋人',
    loveStyle: '深いつながりと精神的な絆を大切にする、真の愛を求める'
  },
  ENFJ: {
    name: '主人公',
    description: 'カリスマ的で利他的な指導者',
    color: 'bg-green-500',
    traits: ['カリスマ的', '思いやり深い', '責任感強い', '人の成長を支援'],
    personality: 'あなたの夢や目標を全力で応援してくれる、頼りになる素敵な恋人',
    loveStyle: 'パートナーの成長を支え、共に未来を築いていく建設的な恋愛'
  },
  INFJ: {
    name: '提唱者',
    description: '創造的で洞察力のある理想主義者',
    color: 'bg-indigo-500',
    traits: ['洞察力', '理想主義', '決断力', '独立心'],
    personality: '神秘的で深い魅力を持った、あなたの本質を見抜く特別な恋人',
    loveStyle: '運命的な深いつながりを信じ、魂のレベルで通じ合う真の愛'
  },
  ENTP: {
    name: '討論者',
    description: '聡明で好奇心旺盛な思想家',
    color: 'bg-red-500',
    traits: ['革新的', '多才', '論理的', '適応力'],
    personality: 'ウィットに富んだ会話で楽しませてくれる、知的で刺激的な恋人',
    loveStyle: '知的な刺激と新鮮さを重視した、飽きることのない恋愛'
  },
  INTP: {
    name: '論理学者',
    description: '革新的で独立した思想家',
    color: 'bg-blue-500',
    traits: ['分析的', '独立的', '理論的', '創造的'],
    personality: '静かだけど深い愛情を持った、あなたの知的な面を理解してくれる恋人',
    loveStyle: '知的な共鳴と理解を基盤とした、静かで深い愛情'
  },
  ENTJ: {
    name: '指揮官',
    description: '大胆で想像力豊かな強いリーダー',
    color: 'bg-yellow-600',
    traits: ['指導力', '戦略的', '効率的', '決断力'],
    personality: '頼もしくて計画性があり、二人の未来をしっかりと導いてくれる恋人',
    loveStyle: '明確な目標を持った建設的な関係で、共に成功を目指す'
  },
  INTJ: {
    name: '建築家',
    description: '独立した想像力豊かな戦略家',
    color: 'bg-gray-600',
    traits: ['戦略的', '独立的', '決断力', '向上心'],
    personality: '冷静で賢く、長期的な視点であなたとの関係を大切にする恋人',
    loveStyle: '深く考え抜かれた長期的な愛情で、質の高い関係を築く'
  },
  ESFP: {
    name: 'エンターテイナー',
    description: '自発的で熱狂的で社交的',
    color: 'bg-pink-500',
    traits: ['社交的', '楽観的', '柔軟', '実用的'],
    personality: 'いつも明るくて楽しい、あなたを笑顔にしてくれる太陽のような恋人',
    loveStyle: '楽しさと喜びに満ちた、今この瞬間を大切にする恋愛'
  },
  ISFP: {
    name: '冒険家',
    description: '柔軟で魅力的な芸術家',
    color: 'bg-teal-500',
    traits: ['芸術的', '柔軟', '思いやり深い', '謙虚'],
    personality: '優しくて芸術的センスがあり、あなたの美しさを見つけてくれる恋人',
    loveStyle: '自然体で穏やかな愛情を大切にし、美しい瞬間を共有する'
  },
  ESFJ: {
    name: '領事官',
    description: '思いやりがあり社交的で人気者',
    color: 'bg-emerald-500',
    traits: ['思いやり深い', '協力的', '実用的', '責任感'],
    personality: 'いつもあなたのことを気にかけてくれる、温かくて優しい恋人',
    loveStyle: '安定した愛情と相互のケアを重視する、温かい恋愛関係'
  },
  ISFJ: {
    name: '擁護者',
    description: '非常に献身的で温かい保護者',
    color: 'bg-cyan-500',
    traits: ['献身的', '責任感', '思いやり深い', '実用的'],
    personality: 'あなたを守り支えてくれる、献身的で信頼できる恋人',
    loveStyle: '安心感と安定を提供する、深い愛情と信頼に基づく関係'
  },
  ESTP: {
    name: '起業家',
    description: 'エネルギッシュで知覚的な実行者',
    color: 'bg-orange-600',
    traits: ['エネルギッシュ', '適応力', '実用的', '社交的'],
    personality: 'アクティブで spontaneous、一緒にいると退屈しない刺激的な恋人',
    loveStyle: '活動的で自発的な愛情表現を好み、一緒に冒険を楽しむ'
  },
  ISTP: {
    name: '巨匠',
    description: '大胆で実践的な実験者',
    color: 'bg-stone-600',
    traits: ['実用的', '柔軟', '論理的', '冷静'],
    personality: 'クールで落ち着いていて、さりげなくあなたをサポートしてくれる恋人',
    loveStyle: 'さりげない愛情表現で、行動で愛を示すタイプ'
  },
  ESTJ: {
    name: '幹部',
    description: '優秀な管理者で実践的',
    color: 'bg-amber-600',
    traits: ['組織的', '実用的', '責任感', '決断力'],
    personality: 'しっかりしていて頼りになる、あなたとの未来を真剣に考えてくれる恋人',
    loveStyle: '責任感のある安定した関係を築き、実用的な愛情表現を好む'
  },
  ISTJ: {
    name: '管理者',
    description: '実用的で事実重視の信頼できる人',
    color: 'bg-slate-600',
    traits: ['信頼性', '責任感', '実用的', '伝統的'],
    personality: '誠実で一途、あなたとの約束を必ず守ってくれる信頼できる恋人',
    loveStyle: '伝統的で安定した愛情を大切にし、長期的な関係を築く'
  }
};

export const MBTI_COMPATIBILITY: Record<MBTIType, MBTIType[]> = {
  ENFP: ['INFJ', 'INTJ'],
  INFP: ['ENFJ', 'ENTJ'],
  ENFJ: ['INFP', 'ISFP'],
  INFJ: ['ENFP', 'ENTP'],
  ENTP: ['INFJ', 'INTJ'],
  INTP: ['ENFJ', 'ENTJ'],
  ENTJ: ['INFP', 'INTP'],
  INTJ: ['ENFP', 'ENTP'],
  ESFP: ['ISFJ', 'ISTJ'],
  ISFP: ['ENFJ', 'ESFJ'],
  ESFJ: ['ISFP', 'ISTP'],
  ISFJ: ['ESFP', 'ESTP'],
  ESTP: ['ISFJ', 'ISTJ'],
  ISTP: ['ESFJ', 'ESTJ'],
  ESTJ: ['ISTP', 'INTP'],
  ISTJ: ['ESFP', 'ESTP']
};
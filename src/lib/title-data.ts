// 🎵 TypeMate 64Type Title System
// 4つの称号システム - MBTI権利問題完全回避

import type { TitleType, TitleData, EnvironmentAxis, MotivationAxis } from '@/types';

// 4つの称号データ定義
export const TITLE_DATA: Record<TitleType, TitleData> = {
  HARMONIC: {
    name: '調和の',
    nameEn: 'Harmonic',
    description: '協調性と安定性を重視し、周囲との調和を保ちながら着実な成長を遂げる者。平和と安定を愛し、信頼関係を大切にする。',
    traits: ['協調性', '安定志向', '調和重視', '信頼構築'],
    characteristics: '周囲との協力を重視し、安定した環境での成長を好む。対立を避け、皆が納得できる解決策を探すことを得意とする。',
    approach: '長期的な信頼関係を築き、安定した基盤の上で着実に目標を達成していく。',
    conditions: {
      environment: 'COOPERATIVE',
      motivation: 'STABLE'
    }
  },
  PIONEERING: {
    name: '開拓の',
    nameEn: 'Pioneering', 
    description: '協調性を保ちながらも新しい挑戦を恐れず、チームと共に未知の領域を開拓していく冒険家。成長と調和のバランスを取る。',
    traits: ['協調性', '成長志向', '冒険心', 'チームワーク'],
    characteristics: '仲間と共に新しいことに挑戦し、皆で成長していくことを喜びとする。協力して困難を乗り越える力を持つ。',
    approach: 'チームの力を活かしながら、新しい可能性を追求し、共に成長していく。',
    conditions: {
      environment: 'COOPERATIVE', 
      motivation: 'GROWTH'
    }
  },
  SOLITARY: {
    name: '孤高の',
    nameEn: 'Solitary',
    description: '独立心が強く、一人でも確実に歩める道を選ぶ者。競争よりも自分自身との戦いを重視し、静かな環境で力を発揮する。',
    traits: ['独立性', '安定志向', '自律性', '集中力'],
    characteristics: '他人に依存せず、自分の力で安定した基盤を築くことを好む。一人の時間を大切にし、深く考える。',
    approach: '自分のペースを保ちながら、着実に目標に向かって歩んでいく。',
    conditions: {
      environment: 'COMPETITIVE',
      motivation: 'STABLE'  
    }
  },
  CHALLENGING: {
    name: '挑戦の',
    nameEn: 'Challenging',
    description: '競争と成長を糧として、常に高い目標に向かって挑戦し続ける戦士。困難を乗り越えることで自分を磨き上げていく。',
    traits: ['競争心', '成長志向', '挑戦心', '向上心'],
    characteristics: '競争環境を好み、困難な挑戦を通じて自分を成長させることに喜びを感じる。高い目標を設定し、それを達成する。',
    approach: '競争を通じて自分の限界を超え、常に新しい高みを目指していく。',
    conditions: {
      environment: 'COMPETITIVE',
      motivation: 'GROWTH'
    }
  }
};

// 称号決定ロジック
export function determineTitleType(
  environment: EnvironmentAxis, 
  motivation: MotivationAxis
): TitleType {
  if (environment === 'COOPERATIVE' && motivation === 'STABLE') {
    return 'HARMONIC';
  } else if (environment === 'COOPERATIVE' && motivation === 'GROWTH') {
    return 'PIONEERING';
  } else if (environment === 'COMPETITIVE' && motivation === 'STABLE') {
    return 'SOLITARY';
  } else {
    return 'CHALLENGING';
  }
}

// 称号の特徴説明取得
export function getTitleDescription(titleType: TitleType): string {
  return TITLE_DATA[titleType].description;
}

// 称号の特性リスト取得
export function getTitleTraits(titleType: TitleType): string[] {
  return TITLE_DATA[titleType].traits;
}
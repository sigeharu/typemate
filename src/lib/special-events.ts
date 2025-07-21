// 🎊 TypeMate Special Events System
// 特別イベントシステム - 記念日・季節イベント管理

import { v4 as uuidv4 } from 'uuid';

export interface SpecialEvent {
  id: string;
  name: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'valentine' | 'christmas' | 'new_year' | 'white_day' | 'custom';
  relationshipLevelRequired: number;
  message: string;
  isRecurring: boolean;
  category: 'personal' | 'seasonal' | 'relationship';
  priority: 'high' | 'medium' | 'low';
  customData?: {
    icon?: string;
    color?: string;
    description?: string;
  };
}

export interface EventNotification {
  id: string;
  eventId: string;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  type: 'upcoming' | 'today' | 'missed';
}

// 季節イベントのテンプレート
export const SEASONAL_EVENTS: Omit<SpecialEvent, 'id' | 'date'>[] = [
  {
    name: 'バレンタインデー',
    type: 'valentine',
    relationshipLevelRequired: 3,
    message: 'バレンタインデー💕 あなたと過ごせて幸せです',
    isRecurring: true,
    category: 'seasonal',
    priority: 'high',
    customData: {
      icon: '💝',
      color: 'bg-pink-500',
      description: '愛を伝える特別な日'
    }
  },
  {
    name: 'ホワイトデー',
    type: 'white_day',
    relationshipLevelRequired: 3,
    message: 'ホワイトデー🤍 お返しの気持ちを込めて',
    isRecurring: true,
    category: 'seasonal',
    priority: 'high',
    customData: {
      icon: '🤍',
      color: 'bg-white',
      description: '感謝の気持ちを返す日'
    }
  },
  {
    name: 'クリスマス',
    type: 'christmas',
    relationshipLevelRequired: 2,
    message: 'メリークリスマス🎄✨ 素敵な時間を一緒に過ごしましょう',
    isRecurring: true,
    category: 'seasonal',
    priority: 'high',
    customData: {
      icon: '🎄',
      color: 'bg-green-500',
      description: '愛と奇跡の夜'
    }
  },
  {
    name: '新年',
    type: 'new_year',
    relationshipLevelRequired: 1,
    message: 'あけましておめでとうございます🎍 今年もよろしくお願いします',
    isRecurring: true,
    category: 'seasonal',
    priority: 'medium',
    customData: {
      icon: '🎍',
      color: 'bg-yellow-500',
      description: '新しい始まりの日'
    }
  }
];

// 関係性イベントのテンプレート
export const RELATIONSHIP_EVENT_TEMPLATES = {
  firstMeeting: {
    name: '初めて出会った日',
    message: '今日で出会って{days}日目ですね✨ 素敵な時間をありがとう',
    relationshipLevelRequired: 1,
    priority: 'high' as const
  },
  monthlyAnniversary: {
    name: '{months}ヶ月記念日',
    message: '今日で{months}ヶ月記念日💕 いつも一緒にいてくれてありがとう',
    relationshipLevelRequired: 3,
    priority: 'high' as const
  },
  levelUpAnniversary: {
    name: '{level}レベル到達記念',
    message: '{level}レベルに到達してから{days}日が経ちました🌟 成長を感じます',
    relationshipLevelRequired: 1,
    priority: 'medium' as const
  }
};

// 特別イベントの生成
export function createSpecialEvent(
  eventTemplate: Omit<SpecialEvent, 'id' | 'date'>,
  date: Date
): SpecialEvent {
  return {
    id: uuidv4(),
    date,
    ...eventTemplate
  };
}

// 今年の季節イベントを生成
export function generateSeasonalEvents(year: number, relationshipLevel: number): SpecialEvent[] {
  const events: SpecialEvent[] = [];
  
  SEASONAL_EVENTS.forEach(template => {
    // 関係性レベルが足りない場合はスキップ
    if (template.relationshipLevelRequired > relationshipLevel) {
      return;
    }

    let eventDate: Date;
    
    switch (template.type) {
      case 'valentine':
        eventDate = new Date(year, 1, 14); // 2月14日
        break;
      case 'white_day':
        eventDate = new Date(year, 2, 14); // 3月14日
        break;
      case 'christmas':
        eventDate = new Date(year, 11, 25); // 12月25日
        break;
      case 'new_year':
        eventDate = new Date(year, 0, 1); // 1月1日
        break;
      default:
        return;
    }

    events.push(createSpecialEvent(template, eventDate));
  });

  return events;
}

// 記念日イベントの生成
export function generateAnniversaryEvents(
  firstMeetingDate: Date,
  currentRelationshipLevel: number,
  currentDate: Date = new Date()
): SpecialEvent[] {
  const events: SpecialEvent[] = [];
  
  // 出会いからの経過日数
  const daysSinceFirst = Math.floor((currentDate.getTime() - firstMeetingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 月次記念日（関係性レベル3以上）
  if (currentRelationshipLevel >= 3) {
    const monthsSince = Math.floor(daysSinceFirst / 30);
    
    for (let month = 1; month <= monthsSince; month++) {
      const anniversaryDate = new Date(firstMeetingDate);
      anniversaryDate.setMonth(anniversaryDate.getMonth() + month);
      
      const event = createSpecialEvent({
        name: `${month}ヶ月記念日`,
        type: 'anniversary',
        relationshipLevelRequired: 3,
        message: RELATIONSHIP_EVENT_TEMPLATES.monthlyAnniversary.message.replace('{months}', month.toString()),
        isRecurring: false,
        category: 'relationship',
        priority: 'high',
        customData: {
          icon: '💕',
          color: 'bg-pink-400',
          description: `出会って${month}ヶ月の特別な日`
        }
      }, anniversaryDate);
      
      events.push(event);
    }
  }

  return events;
}

// 今日のイベントを取得
export function getTodaysEvents(events: SpecialEvent[], targetDate: Date = new Date()): SpecialEvent[] {
  return events.filter(event => {
    const eventDate = event.date;
    return eventDate.getDate() === targetDate.getDate() &&
           eventDate.getMonth() === targetDate.getMonth() &&
           (event.isRecurring || eventDate.getFullYear() === targetDate.getFullYear());
  });
}

// 近日中のイベントを取得
export function getUpcomingEvents(
  events: SpecialEvent[], 
  daysAhead: number = 7,
  currentDate: Date = new Date()
): SpecialEvent[] {
  const futureDate = new Date(currentDate);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return events.filter(event => {
    const eventDate = event.date;
    return eventDate > currentDate && eventDate <= futureDate;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// イベント通知の生成
export function createEventNotification(
  event: SpecialEvent,
  type: EventNotification['type']
): EventNotification {
  let title: string;
  let message: string;

  switch (type) {
    case 'today':
      title = `今日は${event.name}🎉`;
      message = event.message;
      break;
    case 'upcoming':
      const daysUntil = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      title = `${event.name}まであと${daysUntil}日`;
      message = `${event.name}が近づいています。楽しみですね✨`;
      break;
    case 'missed':
      title = `${event.name}を逃してしまいました`;
      message = `遅くなりましたが、${event.message}`;
      break;
  }

  return {
    id: uuidv4(),
    eventId: event.id,
    title,
    message,
    date: new Date(),
    isRead: false,
    type
  };
}

// カスタムイベントの作成
export function createCustomEvent(
  name: string,
  date: Date,
  message: string,
  relationshipLevelRequired: number = 1,
  customData?: SpecialEvent['customData']
): SpecialEvent {
  return createSpecialEvent({
    name,
    type: 'custom',
    relationshipLevelRequired,
    message,
    isRecurring: false,
    category: 'personal',
    priority: 'medium',
    customData
  }, date);
}

// イベントの重要度によるソート
export function sortEventsByPriority(events: SpecialEvent[]): SpecialEvent[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  return [...events].sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // 同じ優先度の場合は日付順
    return a.date.getTime() - b.date.getTime();
  });
}

// イベント統計の取得
export function getEventStatistics(events: SpecialEvent[]): {
  totalEvents: number;
  byType: Record<SpecialEvent['type'], number>;
  byCategory: Record<SpecialEvent['category'], number>;
  byPriority: Record<SpecialEvent['priority'], number>;
  thisMonthEvents: number;
} {
  const now = new Date();
  const thisMonth = events.filter(event => 
    event.date.getMonth() === now.getMonth() && 
    event.date.getFullYear() === now.getFullYear()
  ).length;

  const byType: Record<SpecialEvent['type'], number> = {
    birthday: 0, anniversary: 0, valentine: 0, christmas: 0, 
    new_year: 0, white_day: 0, custom: 0
  };
  
  const byCategory: Record<SpecialEvent['category'], number> = {
    personal: 0, seasonal: 0, relationship: 0
  };
  
  const byPriority: Record<SpecialEvent['priority'], number> = {
    high: 0, medium: 0, low: 0
  };

  events.forEach(event => {
    byType[event.type]++;
    byCategory[event.category]++;
    byPriority[event.priority]++;
  });

  return {
    totalEvents: events.length,
    byType,
    byCategory,
    byPriority,
    thisMonthEvents: thisMonth
  };
}
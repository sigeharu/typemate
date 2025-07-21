// 🎊 TypeMate Special Events Hook
// 特別イベント管理カスタムフック

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SpecialEvent,
  EventNotification,
  generateSeasonalEvents,
  generateAnniversaryEvents,
  getTodaysEvents,
  getUpcomingEvents,
  createEventNotification,
  createCustomEvent,
  sortEventsByPriority,
  getEventStatistics
} from '@/lib/special-events';

const EVENTS_STORAGE_KEY = 'typemate-special-events';
const NOTIFICATIONS_STORAGE_KEY = 'typemate-event-notifications';

interface UseSpecialEventsOptions {
  relationshipLevel: number;
  firstMeetingDate: Date;
}

interface UseSpecialEventsReturn {
  events: SpecialEvent[];
  notifications: EventNotification[];
  todaysEvents: SpecialEvent[];
  upcomingEvents: SpecialEvent[];
  addCustomEvent: (name: string, date: Date, message: string, customData?: SpecialEvent['customData']) => void;
  markNotificationAsRead: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
  getEventsByType: (type: SpecialEvent['type']) => SpecialEvent[];
  getEventsByCategory: (category: SpecialEvent['category']) => SpecialEvent[];
  checkForNewEvents: () => EventNotification[];
  getEventStatistics: () => ReturnType<typeof getEventStatistics>;
  refreshEvents: () => void;
}

export function useSpecialEvents({ 
  relationshipLevel, 
  firstMeetingDate 
}: UseSpecialEventsOptions): UseSpecialEventsReturn {
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [lastCheckDate, setLastCheckDate] = useState<Date>(new Date());

  // イベントの自動生成と読み込み
  useEffect(() => {
    const loadAndGenerateEvents = () => {
      // 保存されたイベントを読み込み
      const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
      let existingEvents: SpecialEvent[] = [];
      
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents);
          existingEvents = parsed.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          }));
        } catch (error) {
          console.error('Failed to load events:', error);
        }
      }

      // 新しいイベントを生成
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      
      const seasonalEvents = [
        ...generateSeasonalEvents(currentYear, relationshipLevel),
        ...generateSeasonalEvents(nextYear, relationshipLevel)
      ];
      
      const anniversaryEvents = generateAnniversaryEvents(
        firstMeetingDate, 
        relationshipLevel
      );

      // 重複を避けて統合
      const allEvents = [...existingEvents];
      const existingEventIds = new Set(existingEvents.map(e => `${e.type}-${e.date.toDateString()}`));
      
      [...seasonalEvents, ...anniversaryEvents].forEach(event => {
        const eventKey = `${event.type}-${event.date.toDateString()}`;
        if (!existingEventIds.has(eventKey)) {
          allEvents.push(event);
        }
      });

      const sortedEvents = sortEventsByPriority(allEvents);
      setEvents(sortedEvents);
      
      // ストレージに保存
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(sortedEvents));
    };

    loadAndGenerateEvents();
  }, [relationshipLevel, firstMeetingDate]);

  // 通知の読み込み
  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const restoredNotifications = parsed.map((n: any) => ({
          ...n,
          date: new Date(n.date)
        }));
        setNotifications(restoredNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // 通知の保存
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  // 今日のイベント
  const todaysEvents = useMemo(() => {
    return getTodaysEvents(events);
  }, [events]);

  // 近日中のイベント
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(events, 7);
  }, [events]);

  // カスタムイベントの追加
  const addCustomEvent = useCallback((
    name: string,
    date: Date,
    message: string,
    customData?: SpecialEvent['customData']
  ) => {
    const newEvent = createCustomEvent(name, date, message, relationshipLevel, customData);
    setEvents(prev => sortEventsByPriority([...prev, newEvent]));
  }, [relationshipLevel]);

  // 通知を既読にする
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // 通知を削除
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // タイプ別イベント取得
  const getEventsByType = useCallback((type: SpecialEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  // カテゴリー別イベント取得
  const getEventsByCategory = useCallback((category: SpecialEvent['category']) => {
    return events.filter(event => event.category === category);
  }, [events]);

  // 新しいイベントをチェック
  const checkForNewEvents = useCallback((): EventNotification[] => {
    const now = new Date();
    const newNotifications: EventNotification[] = [];

    // 今日のイベントをチェック
    todaysEvents.forEach(event => {
      const hasNotification = notifications.some(n => 
        n.eventId === event.id && n.type === 'today'
      );
      
      if (!hasNotification) {
        newNotifications.push(createEventNotification(event, 'today'));
      }
    });

    // 近日中のイベント（3日以内）をチェック
    const soonEvents = getUpcomingEvents(events, 3);
    soonEvents.forEach(event => {
      const hasNotification = notifications.some(n => 
        n.eventId === event.id && n.type === 'upcoming'
      );
      
      if (!hasNotification) {
        newNotifications.push(createEventNotification(event, 'upcoming'));
      }
    });

    // 見逃したイベントをチェック（過去3日以内）
    const recentPastEvents = events.filter(event => {
      const daysSince = (now.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 0 && daysSince <= 3;
    });

    recentPastEvents.forEach(event => {
      const hasNotification = notifications.some(n => 
        n.eventId === event.id && (n.type === 'today' || n.type === 'missed')
      );
      
      if (!hasNotification) {
        newNotifications.push(createEventNotification(event, 'missed'));
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }

    setLastCheckDate(now);
    return newNotifications;
  }, [events, todaysEvents, notifications]);

  // イベント統計の取得
  const getEventStats = useCallback(() => {
    return getEventStatistics(events);
  }, [events]);

  // イベントの更新
  const refreshEvents = useCallback(() => {
    // ローカルストレージをクリアして再生成
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    const seasonalEvents = [
      ...generateSeasonalEvents(currentYear, relationshipLevel),
      ...generateSeasonalEvents(nextYear, relationshipLevel)
    ];
    
    const anniversaryEvents = generateAnniversaryEvents(
      firstMeetingDate, 
      relationshipLevel
    );

    const allEvents = [...seasonalEvents, ...anniversaryEvents];
    const sortedEvents = sortEventsByPriority(allEvents);
    
    setEvents(sortedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(sortedEvents));
  }, [relationshipLevel, firstMeetingDate]);

  // 自動チェック（1日1回）
  useEffect(() => {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - lastCheckDate.getTime();
    const hoursTimeSinceLastCheck = timeSinceLastCheck / (1000 * 60 * 60);
    
    // 前回チェックから12時間以上経過していればチェック実行
    if (hoursTimeSinceLastCheck >= 12) {
      checkForNewEvents();
    }
  }, [checkForNewEvents, lastCheckDate]);

  return {
    events,
    notifications,
    todaysEvents,
    upcomingEvents,
    addCustomEvent,
    markNotificationAsRead,
    dismissNotification,
    getEventsByType,
    getEventsByCategory,
    checkForNewEvents,
    getEventStatistics: getEventStats,
    refreshEvents
  };
}
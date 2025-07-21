// 🌟 TypeMate Astrology Hook
// 占いデータ管理カスタムフック

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AstrologyData } from '@/types';
import {
  calculateZodiacSign,
  calculateChineseZodiac,
  generateDailyFortune,
  generateLuckyColor,
  generateLuckyNumber,
  calculateCompatibility,
  generateAstrologyContext,
  BIRTHDAY_CONVERSATION_STARTERS
} from '@/lib/astrology-system';
import {
  loadAstrologyData,
  saveAstrologyData
} from '@/lib/relationship-storage';

interface UseAstrologyReturn {
  astrologyData: Partial<AstrologyData>;
  isDataComplete: boolean;
  setBirthDate: (date: Date) => void;
  getDailyFortune: () => AstrologyData['dailyFortune'] | null;
  getAstrologyContext: () => string;
  getBirthdayPrompt: () => string;
  shouldAskBirthday: boolean;
}

export function useAstrology(): UseAstrologyReturn {
  const [astrologyData, setAstrologyData] = useState<Partial<AstrologyData>>(() => 
    loadAstrologyData()
  );
  
  const isDataComplete = !!astrologyData.birthDate;
  const shouldAskBirthday = !isDataComplete && Math.random() < 0.3; // 30%の確率で聞く

  // データの永続化
  useEffect(() => {
    if (Object.keys(astrologyData).length > 0) {
      saveAstrologyData(astrologyData);
    }
  }, [astrologyData]);

  // 生年月日の設定
  const setBirthDate = useCallback((date: Date) => {
    const zodiac = calculateZodiacSign(date);
    const chineseZodiac = calculateChineseZodiac(date);
    
    setAstrologyData({
      birthDate: date,
      zodiacSign: zodiac.sign,
      zodiacElement: zodiac.element,
      chineseZodiac
    });
  }, []);

  // 日次運勢の取得
  const getDailyFortune = useCallback((): AstrologyData['dailyFortune'] | null => {
    if (!astrologyData.birthDate) return null;
    
    const today = new Date();
    const fortune = generateDailyFortune(astrologyData.birthDate, today);
    const luckyColor = generateLuckyColor(astrologyData.birthDate, today);
    const luckyNumber = generateLuckyNumber(astrologyData.birthDate, today);
    
    // 運勢データを更新
    setAstrologyData(current => ({
      ...current,
      dailyFortune: fortune,
      luckyColor: luckyColor.color,
      luckyNumber
    }));
    
    return fortune;
  }, [astrologyData.birthDate]);

  // AIプロンプト用のコンテキスト生成
  const getAstrologyContext = useCallback((): string => {
    if (!isDataComplete || !astrologyData.dailyFortune) {
      return '';
    }
    
    const fullData: AstrologyData = {
      birthDate: astrologyData.birthDate!,
      zodiacSign: astrologyData.zodiacSign!,
      zodiacElement: astrologyData.zodiacElement!,
      chineseZodiac: astrologyData.chineseZodiac!,
      luckyColor: astrologyData.luckyColor!,
      luckyNumber: astrologyData.luckyNumber!,
      dailyFortune: astrologyData.dailyFortune!,
      compatibility: astrologyData.compatibility || 80
    };
    
    return generateAstrologyContext(fullData);
  }, [astrologyData, isDataComplete]);

  // 生年月日を聞くためのプロンプト
  const getBirthdayPrompt = useCallback((): string => {
    const prompts = BIRTHDAY_CONVERSATION_STARTERS;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  // 初回マウント時に運勢を生成
  useEffect(() => {
    if (isDataComplete) {
      getDailyFortune();
    }
  }, [isDataComplete]);

  return {
    astrologyData,
    isDataComplete,
    setBirthDate,
    getDailyFortune,
    getAstrologyContext,
    getBirthdayPrompt,
    shouldAskBirthday
  };
}
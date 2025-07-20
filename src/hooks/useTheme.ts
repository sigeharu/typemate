// 🎵 TypeMate Theme Hook
// ダークモード対応とテーマ管理

'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // ユーザープロファイルからテーマ設定を取得
    const profile = storage.getUserProfile();
    const savedTheme = profile?.preferences?.theme || 'light';
    setTheme(savedTheme);
    
    // システムテーマの検出
    const updateIsDark = () => {
      if (savedTheme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(systemPrefersDark);
        document.documentElement.classList.toggle('dark', systemPrefersDark);
      } else {
        const shouldBeDark = savedTheme === 'dark';
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
      }
    };

    updateIsDark();

    // システムテーマ変更の監視
    if (savedTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateIsDark);
      return () => mediaQuery.removeEventListener('change', updateIsDark);
    }
  }, [theme]);

  const setUserTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    
    // プロファイルに保存
    const profile = storage.getUserProfile();
    if (profile) {
      const updatedProfile = {
        ...profile,
        preferences: {
          ...profile.preferences,
          theme: newTheme
        }
      };
      storage.saveUserProfile(updatedProfile);
    }
  };

  return {
    theme,
    isDark,
    setTheme: setUserTheme,
    toggleTheme: () => setUserTheme(isDark ? 'light' : 'dark')
  };
}
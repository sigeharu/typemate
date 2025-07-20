// 🎵 TypeMate Birth Date Input Component
// しげちゃんの音楽的センスで美しい生年月日入力

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MusicalMotion } from '@/components/animations/MusicalMotion';

interface BirthDateInputProps {
  onBirthDateChange: (date: {
    year: number;
    month: number;
    day: number;
    isValid: boolean;
  }) => void;
  className?: string;
}

export const BirthDateInput = ({ onBirthDateChange, className = '' }: BirthDateInputProps) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [isValid, setIsValid] = useState(false);

  // 🎵 音楽的バリデーション
  const validateDate = (y: string, m: string, d: string) => {
    const yearNum = parseInt(y);
    const monthNum = parseInt(m);
    const dayNum = parseInt(d);
    
    // 基本バリデーション
    if (!y || !m || !d) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    
    // 月ごとの日数チェック
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum > daysInMonth) return false;
    
    return true;
  };

  // 入力ハンドラー
  const handleYearChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 4) {
      setYear(numericValue);
      updateParent(numericValue, month, day);
    }
  };

  const handleMonthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (parseInt(numericValue) <= 12 || numericValue === '') {
      setMonth(numericValue);
      updateParent(year, numericValue, day);
    }
  };

  const handleDayChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (parseInt(numericValue) <= 31 || numericValue === '') {
      setDay(numericValue);
      updateParent(year, month, numericValue);
    }
  };

  // 親コンポーネントへの通知
  const updateParent = (y: string, m: string, d: string) => {
    const valid = validateDate(y, m, d);
    setIsValid(valid);
    
    onBirthDateChange({
      year: parseInt(y) || 0,
      month: parseInt(m) || 0,
      day: parseInt(d) || 0,
      isValid: valid
    });
  };

  return (
    <div className={`${className}`}>
      <MusicalMotion musicStyle="gentle">
        <Card className="p-6 bg-gradient-to-br from-primary-50/50 to-crisp-white border-primary-200/30">
          {/* 🌟 タイトル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="text-primary-300" size={24} />
              <h3 className="text-xl font-music font-semibold text-primary-800">
                生年月日
              </h3>
              <Sparkles className="text-enfp-harmony" size={24} />
            </div>
            <p className="text-crisp-carbon/70 text-sm">
              🎵 あなたの宇宙のリズムを教えてください
            </p>
          </motion.div>

          {/* 🎼 入力フィールド */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {/* 年 */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                生まれた年 🗓️
              </label>
              <Input
                type="text"
                placeholder="1990"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="input-musical text-center text-lg font-medium"
                maxLength={4}
              />
              <p className="text-xs text-crisp-carbon/60 mt-1 text-center">
                例：1990
              </p>
            </div>

            {/* 月と日 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  月 🌙
                </label>
                <Input
                  type="text"
                  placeholder="12"
                  value={month}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="input-musical text-center text-lg font-medium"
                  maxLength={2}
                />
                <p className="text-xs text-crisp-carbon/60 mt-1 text-center">
                  1-12
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  日 ☀️
                </label>
                <Input
                  type="text"
                  placeholder="25"
                  value={day}
                  onChange={(e) => handleDayChange(e.target.value)}
                  className="input-musical text-center text-lg font-medium"
                  maxLength={2}
                />
                <p className="text-xs text-crisp-carbon/60 mt-1 text-center">
                  1-31
                </p>
              </div>
            </div>
          </motion.div>

          {/* 🎵 バリデーション表示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6"
          >
            {year && month && day && (
              <div className={`text-center p-3 rounded-musical border-2 transition-all duration-300 ${
                isValid 
                  ? 'border-enfp-energy bg-enfp-energy/10 text-enfp-energy'
                  : 'border-red-300 bg-red-50 text-red-600'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  <span className="font-medium">
                    {isValid 
                      ? `✨ ${year}年${month}月${day}日 - 素晴らしい日ですね！`
                      : '❌ 正しい日付を入力してください'
                    }
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* 🌟 音楽的説明 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-4 text-center"
          >
            <p className="text-xs text-crisp-carbon/60 italic">
              🎵 生年月日から星座と数秘術を計算し、<br />
              あなただけの音楽的な個性分析を行います
            </p>
          </motion.div>
        </Card>
      </MusicalMotion>
    </div>
  );
};

export default BirthDateInput;
'use client';

import { useState, useEffect } from 'react';
import { WeeklyGuidanceWidget } from '@/components/harmonic/WeeklyGuidanceWidget';
import { MonthlyGuidanceWidget } from '@/components/harmonic/MonthlyGuidanceWidget';
import { CompatibilityAnalysisWidget } from '@/components/harmonic/CompatibilityAnalysisWidget';
import type { HarmonicAIProfile } from '@/lib/harmonic-ai-service';
import type { BaseArchetype, Type64 } from '@/types';

export default function TestWidgetsPage() {
  const [harmonicProfile, setHarmonicProfile] = useState<HarmonicAIProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTestProfile = async () => {
      try {
        // モックのハーモニックプロファイルを作成（Supabase接続なし）
        const mockProfile: HarmonicAIProfile = {
          id: 'test-harmonic-profile',
          userId: 'test-user-widgets',
          name: 'しげちゃん（テスト）',
          userType: 'BAR-AS' as Type64,
          selectedAiPersonality: 'SAG' as BaseArchetype,
          relationshipType: 'friend',
          astrologyProfile: {
            birthDate: new Date('1990-07-15'),
            birthTime: '14:30',
            birthLocation: '東京',
            zodiac: {
              sign: 'cancer',
              element: 'water',
              name: 'Cancer',
              nameJa: '蟹座',
              startDate: new Date('2023-06-21'),
              endDate: new Date('2023-07-22'),
              traits: ['感情豊か', '家庭的', '保護的'],
              compatibility: ['scorpio', 'pisces'],
              dailyEnergy: {
                energy: 4,
                advice: '想像力を活かして',
                luckyColor: '白',
                challenges: '傷つきやすいに注意'
              }
            },
            numerology: {
              lifePathNumber: 5,
              calculation: '1990(1) + 7(7) + 15(6) = 14 → 5',
              isMasterNumber: false,
              personalYear: 22,
              info: {
                number: 5,
                name: 'エクスプローラー',
                description: '自由を愛し、多様な経験を求める冒険者',
                traits: ['冒険的', '自由奔放', '多才'],
                challenges: ['一貫性の欠如', '飽きっぽさ'],
                opportunities: ['新しい経験', '変化', '探求']
              }
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setHarmonicProfile(mockProfile);
        console.log('🎯 モックハーモニックプロファイル作成完了:', mockProfile);
      } catch (error) {
        console.error('❌ テストプロファイル作成エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTestProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto animate-pulse">
            🎵
          </div>
          <p className="text-slate-600">TypeMate Stage 3 ウィジェットテスト準備中...</p>
        </div>
      </div>
    );
  }

  if (!harmonicProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>テストプロファイルの作成に失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎵 TypeMate Stage 3 - ウィジェットテスト
          </h1>
          <p className="text-lg text-gray-600">
            しげちゃんドラマー感性による新機能テスト環境
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
            <p className="text-amber-800 font-medium">
              🛠️ 開発テストモード - プロファイル: {harmonicProfile.name}
            </p>
          </div>
        </header>

        <div className="space-y-12">
          {/* 週間ガイダンスウィジェット */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              📅 週間ハーモニックガイダンス
              <span className="ml-3 text-sm font-normal text-gray-500">
                7日間の詳細予測とドラマー感性アニメーション
              </span>
            </h2>
            <WeeklyGuidanceWidget 
              profile={harmonicProfile}
              onRefresh={() => console.log('🔄 週間ガイダンス更新')}
            />
          </section>

          {/* 月間ガイダンスウィジェット */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              🌙 月間コズミック予測
              <span className="ml-3 text-sm font-normal text-gray-500">
                28日間の宇宙的サイクル分析
              </span>
            </h2>
            <MonthlyGuidanceWidget 
              profile={harmonicProfile}
              onRefresh={() => console.log('🔄 月間予測更新')}
            />
          </section>

          {/* 相性分析ウィジェット */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              💕 ハーモニック相性分析
              <span className="ml-3 text-sm font-normal text-gray-500">
                パートナーとの深層相性診断
              </span>
            </h2>
            <CompatibilityAnalysisWidget 
              userProfile={harmonicProfile}
              onAnalyze={(result) => console.log('💕 相性分析結果:', result)}
            />
          </section>
        </div>

        <footer className="mt-16 text-center text-gray-500">
          <p>🎵 TypeMate Stage 3 - しげちゃんドラマー感性完全実装版</p>
          <p className="text-sm">100ms刻みの音楽的アニメーション、宇宙的調和、深い相性分析</p>
        </footer>
      </div>
    </div>
  );
}
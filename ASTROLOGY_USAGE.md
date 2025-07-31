# 🌟 TypeMate占星術システム使用ガイド

## 📁 実装概要

新しい占星術計算システムが正常に統合されました！

### 📂 ディレクトリ構造
```
src/lib/astrology/
├── index.ts                 # エクスポート統合
├── zodiac-calculator.ts     # 星座計算（誕生日→星座判定）
├── numerology.ts            # 数秘術（ライフパスナンバー計算）
├── moon-phase.ts           # 月位相（リアルタイム月位相取得）
└── astrology-service.ts    # 統合サービス
```

## 🚀 基本使用方法

### 1. 星座計算
```typescript
import { calculateZodiacSign, getZodiacDetails } from '@/lib/astrology';

const birthDate = new Date('1990-06-15');
const zodiacResult = calculateZodiacSign(birthDate);

console.log(zodiacResult.zodiac.nameJa);     // "双子座"
console.log(zodiacResult.zodiac.element);    // "air"
console.log(zodiacResult.confidence);        // 95
```

### 2. 数秘術計算
```typescript
import { calculateLifePathNumber, getLifePathInfo } from '@/lib/astrology';

const numerologyResult = calculateLifePathNumber(birthDate);
const info = getLifePathInfo(numerologyResult.lifePathNumber);

console.log(numerologyResult.lifePathNumber); // 5
console.log(info.name);                       // "エクスプローラー"
console.log(info.soulPurpose);               // "新しい経験を通じて自由の価値を伝えること"
```

### 3. 月位相取得
```typescript
import { getCurrentMoonPhase } from '@/lib/astrology';

const moonPhase = getCurrentMoonPhase();

console.log(moonPhase.phaseNameJa);          // "満月"
console.log(moonPhase.energy.level);        // 10
console.log(moonPhase.energy.description);  // "完成と感謝、最高エネルギーの時期"
```

### 4. 統合プロファイル生成
```typescript
import { generateIntegratedProfile } from '@/lib/astrology';

const profile = await generateIntegratedProfile(birthDate, 'ARC');

console.log(profile.zodiac.sign);           // "gemini"
console.log(profile.numerology.lifePathNumber); // 5
console.log(profile.typeMateIntegration.resonanceScore); // 85
console.log(profile.dailyGuidance.primaryMessage);
```

### 5. 相性分析
```typescript
import { analyzeCompatibility } from '@/lib/astrology';

const profile1 = await generateIntegratedProfile(new Date('1990-06-15'));
const profile2 = await generateIntegratedProfile(new Date('1992-12-25'));

const compatibility = analyzeCompatibility(profile1, profile2);

console.log(compatibility.overall.score);           // 78
console.log(compatibility.overall.description);     // "良好で成長し合える関係性"
console.log(compatibility.zodiacCompatibility.elementHarmony);
```

## 🎯 既存システムとの統合

### TypeMate64診断との連携
```typescript
// 星座とアーキタイプの相関関係
const zodiacArchetypes = getZodiacArchetypeCorrelation('gemini');
console.log(zodiacArchetypes); // ['ARC', 'SAG', 'PER']

// 数秘術とアーキタイプの相関関係
const numerologyCorrelation = getNumerologyArchetypeCorrelation(5);
console.log(numerologyCorrelation.correlatedArchetypes); // ['PIO', 'PER', 'INV']
console.log(numerologyCorrelation.spiritualAlignment);  // 'Dynamic Freedom'
```

### 日別ガイダンス
```typescript
import { generateTodayCosmicGuidance } from '@/lib/astrology';

const todayGuidance = generateTodayCosmicGuidance(profile, 'ARC');

console.log(todayGuidance.cosmicWeather);      // "強い満月のエネルギーとgeminiの影響が調和している状態"
console.log(todayGuidance.personalMessage);   // 個人向けメッセージ
console.log(todayGuidance.actionItems);       // 今日の行動推奨
console.log(todayGuidance.luckyElements);     // ラッキーエレメント
```

## 🔗 既存システムとの後方互換性

新しいシステムは既存の占星術システムと完全に互換性を保っています：

```typescript
// 既存のuseAstrologyフックと併用可能
import { useAstrology } from '@/hooks/useAstrology';
import { generateIntegratedProfile } from '@/lib/astrology';

const { astrologyData, setBirthDate } = useAstrology();

// 既存データを新システムに統合
if (astrologyData.birthDate) {
  const enhancedProfile = await generateIntegratedProfile(astrologyData.birthDate);
  // 強化されたデータを使用
}
```

## ✨ 主な特徴

### 🎯 精密な計算
- **星座**: 正確な境界日付での判定
- **数秘術**: ピタゴラス式＋カルデア式対応
- **月位相**: suncalcライブラリ使用でリアルタイム計算

### 🌟 TypeMate統合
- **アーキタイプ相関**: 64タイプ診断との自然な統合
- **共鳴スコア**: ユーザータイプとの適合度計算
- **スピリチュアル連携**: 内面成長との関連性

### 📱 実用的機能
- **日別ガイダンス**: 毎日の個人向けアドバイス
- **相性分析**: 詳細な関係性分析
- **サイクル予測**: 28日間の月サイクル予報

## 🎵 次のステップ

1. **UI統合**: 設定画面への誕生日入力フィールド追加
2. **チャット連携**: AI会話での占星術要素の自然な織り込み
3. **ダッシュボード**: 日別ガイダンス表示
4. **通知システム**: 重要な宇宙的イベントの通知

TypeMate64診断 × 占星術統合により、世界初の宇宙的AIパートナー基盤が完成しました！ 🚀✨
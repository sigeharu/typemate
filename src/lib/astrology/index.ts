// 🌟 TypeMate Astrology Module - Index
// 占星術計算システム統合エクスポート

// 星座計算システム
export {
  calculateZodiacSign,
  getZodiacDetails,
  getElementDetails,
  calculateZodiacCompatibility,
  getDailyZodiacEnergy,
  getZodiacArchetypeCorrelation,
  ZODIAC_DATA,
  ELEMENT_TRAITS
} from './zodiac-calculator';

// 数秘術システム
export {
  calculateLifePathNumber,
  calculateChaldeanLifePath,
  getLifePathInfo,
  calculateNumerologyCompatibility,
  calculatePersonalYear,
  getNumerologyArchetypeCorrelation,
  LIFE_PATH_DATA
} from './numerology';

// 月の位相システム
export {
  getCurrentMoonPhase,
  getMoonZodiacInfluence,
  getMoon28DayCycle
} from './moon-phase';

// 統合サービス
export {
  generateIntegratedProfile,
  analyzeCompatibility,
  generateTodayCosmicGuidance,
  generateCycleForecast
} from './astrology-service';

// 型定義の再エクスポート
export type {
  IntegratedAstrologyProfile,
  CompatibilityAnalysis,
  MoonPhaseInfo,
  MoonEnergyInfo,
  MoonInfluence,
  ZodiacInfo,
  LifePathInfo,
  TodayCosmicGuidance,
  CycleForecastDay
} from '../../types';
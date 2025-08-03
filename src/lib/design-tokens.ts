// 🎨 TypeMate Design System Tokens
// 統一されたデザイントークンとタイポグラフィ階層

// 🎵 カラーパレット（音楽的統一感）
export const colors = {
  // プライマリー（メインブランドカラー）
  primary: {
    50: '#fef7ee',
    100: '#fdd9b5', 
    300: '#f97316',
    600: '#c2410c',
    900: '#431407',
  },
  
  // 音楽的アクセントカラー
  musical: {
    harmony: '#8b5cf6',    // ハーモニー（パープル）
    energy: '#10b981',     // エネルギー（グリーン）
    calm: '#3b82f6',       // 冷静（ブルー）
    warm: '#f59e0b',       // 温かみ（アンバー）
  },
  
  // UIシステムカラー
  ui: {
    background: '#fafafa',
    surface: '#ffffff',
    surfaceElevated: '#f5f5f5',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
  },
  
  // セマンティックカラー
  semantic: {
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// 🎼 タイポグラフィスケール
export const typography = {
  // フォントファミリー
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
  },
  
  // フォントサイズ（ライン高さ含む）
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px - キャプション
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px - 小さなテキスト
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px - 基本テキスト
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px - 大きめテキスト
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px - サブヘッダー
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px - ヘッダー
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px - ページタイトル
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px - 大見出し
  },
  
  // フォントウェイト
  fontWeight: {
    light: '300',
    normal: '400',    // 基本テキスト
    medium: '500',    // 強調テキスト
    semibold: '600',  // サブヘッダー
    bold: '700',      // ヘッダー
    extrabold: '800', // 特別な強調
  },
  
  // 文字間隔
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  },
} as const;

// 🎯 スペーシング（8pxベースライン）
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// 🎨 ボーダー半径
export const borderRadius = {
  none: '0px',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',   // 完全な円
} as const;

// 💫 シャドウ
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // 音楽的シャドウ
  musical: '0 4px 20px rgba(249, 115, 22, 0.15)',
  harmony: '0 4px 20px rgba(139, 92, 246, 0.15)',
} as const;

// 🎵 アニメーション（60fps保証）
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // 音楽的イージング
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// 🎯 ブレークポイント
export const breakpoints = {
  xs: 375,    // iPhone SE
  sm: 640,    // 大型スマートフォン
  md: 768,    // タブレット
  lg: 1024,   // 小型ラップトップ
  xl: 1280,   // デスクトップ
  '2xl': 1536, // 大型ディスプレイ
} as const;

// 🎨 タイポグラフィコンポーネント用プリセット
export const textStyles = {
  // ヘッダー
  'heading-1': {
    fontSize: typography.fontSize['4xl'].size,
    lineHeight: typography.fontSize['4xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  'heading-2': {
    fontSize: typography.fontSize['3xl'].size,
    lineHeight: typography.fontSize['3xl'].lineHeight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  'heading-3': {
    fontSize: typography.fontSize['2xl'].size,
    lineHeight: typography.fontSize['2xl'].lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  'heading-4': {
    fontSize: typography.fontSize.xl.size,
    lineHeight: typography.fontSize.xl.lineHeight,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // ボディテキスト
  'body-large': {
    fontSize: typography.fontSize.lg.size,
    lineHeight: typography.fontSize.lg.lineHeight,
    fontWeight: typography.fontWeight.normal,
  },
  'body-base': {
    fontSize: typography.fontSize.base.size,
    lineHeight: typography.fontSize.base.lineHeight,
    fontWeight: typography.fontWeight.normal,
  },
  'body-small': {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.normal,
  },
  
  // キャプション
  'caption': {
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.normal,
    color: colors.ui.text.secondary,
  },
  
  // ラベル
  'label-medium': {
    fontSize: typography.fontSize.sm.size,
    lineHeight: typography.fontSize.sm.lineHeight,
    fontWeight: typography.fontWeight.medium,
  },
  'label-small': {
    fontSize: typography.fontSize.xs.size,
    lineHeight: typography.fontSize.xs.lineHeight,
    fontWeight: typography.fontWeight.medium,
  },
} as const;

// 🎵 コンポーネントサイズ（タッチターゲット対応）
export const componentSizes = {
  // ボタンサイズ
  button: {
    sm: { height: '2rem', padding: '0.5rem 0.75rem', fontSize: typography.fontSize.sm.size },
    base: { height: '2.75rem', padding: '0.625rem 1rem', fontSize: typography.fontSize.base.size },
    lg: { height: '3rem', padding: '0.75rem 1.25rem', fontSize: typography.fontSize.lg.size },
    xl: { height: '3.5rem', padding: '1rem 1.5rem', fontSize: typography.fontSize.lg.size },
  },
  
  // アイコンボタン（タッチフレンドリー）
  iconButton: {
    sm: { size: '2.5rem', minSize: '44px' },  // 40px but min 44px for touch
    base: { size: '2.75rem', minSize: '44px' }, // 44px - perfect touch target
    lg: { size: '3rem', minSize: '48px' },   // 48px - enhanced touch target
  },
  
  // 入力フィールド
  input: {
    sm: { height: '2.5rem', padding: '0.5rem 0.75rem' },
    base: { height: '2.75rem', padding: '0.625rem 1rem' },
    lg: { height: '3rem', padding: '0.75rem 1rem' },
  },
} as const;

// 🎯 Zインデックス階層
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// エクスポート用のデザインシステム統合オブジェクト
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  textStyles,
  componentSizes,
  zIndex,
} as const;

export type DesignSystem = typeof designSystem;
export type ColorToken = keyof typeof colors;
export type TypographyToken = keyof typeof typography;
export type SpacingToken = keyof typeof spacing;
export type TextStyleToken = keyof typeof textStyles;
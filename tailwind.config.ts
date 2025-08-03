import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 🚀 パフォーマンス最適化: 必要最小限のスペーシング
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // 🎵 最適化されたカラーパレット（使用頻度ベース）
      colors: {
        primary: {
          50: '#fef7ee',   // メイン使用色のみ保持
          100: '#fdd9b5',
          300: '#f97316',  // メインオレンジ
          600: '#c2410c',  // アクセント
          900: '#431407',  // ダーク
        },
        // 🎵 音楽的アクセントカラー（使用される分のみ）
        musical: {
          harmony: '#8b5cf6',  // ハーモニー（パープル）
          energy: '#10b981',   // エネルギー（グリーン）
          calm: '#3b82f6',     // 冷静（ブルー）
          warm: '#f59e0b',     // 温かみ（アンバー）
        },
        // 🎨 UI必須カラー
        crisp: {
          white: '#fafafa',
          silver: '#f5f5f5',
          carbon: '#404040',
        }
      },
      // 🎼 最適化フォント（webfont数削減）
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        music: ['Inter', 'sans-serif'], // フォント数削減
      },
      // 🎵 必須アニメーションのみ（パフォーマンス重視）
      animation: {
        // Core animations only
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        
        // TypeMate専用（60fps保証）
        'message-appear': 'message-appear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'level-up': 'level-up 0.6s ease-out',
        
        // 必要に応じてGPU加速
        'float': 'float 2s ease-in-out infinite',
      },
      keyframes: {
        // 基本アニメーション（GPU最適化済み）
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateZ(0)' },
          '100%': { opacity: '1', transform: 'translateZ(0)' },
        },
        'slide-up': {
          '0%': { 
            opacity: '0', 
            transform: 'translate3d(0, 20px, 0)' // GPU加速
          },
          '100%': { 
            opacity: '1', 
            transform: 'translate3d(0, 0, 0)' 
          },
        },
        'scale-in': {
          '0%': { 
            opacity: '0', 
            transform: 'scale3d(0.95, 0.95, 1)' // GPU加速
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale3d(1, 1, 1)' 
          },
        },
        
        // TypeMate専用（最適化済み）
        'message-appear': {
          '0%': { 
            opacity: '0', 
            transform: 'translate3d(0, 8px, 0) scale3d(0.98, 0.98, 1)',
          },
          '100%': { 
            opacity: '1', 
            transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)',
          },
        },
        'level-up': {
          '0%': { 
            transform: 'scale3d(0, 0, 1) rotate(0deg)',
            opacity: '0'
          },
          '50%': { 
            transform: 'scale3d(1.1, 1.1, 1) rotate(180deg)',
            opacity: '1'
          },
          '100%': { 
            transform: 'scale3d(1, 1, 1) rotate(360deg)',
            opacity: '0.9'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -5px, 0)' },
        },
      },
      // 🎨 パフォーマンス最適化グラデーション
      backgroundImage: {
        'musical': 'linear-gradient(135deg, #fef7ee 0%, #f97316 100%)',
        'harmony': 'linear-gradient(45deg, #10b981 0%, #8b5cf6 100%)',
        'crisp': 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
      },
      // 🎵 軽量シャドウ
      boxShadow: {
        'crisp': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'musical': '0 4px 20px rgba(249, 115, 22, 0.15)',
      },
      // 🎶 統一ボーダー半径
      borderRadius: {
        'musical': '12px',
        'crisp': '8px',
      }
    },
  },
  // 🚀 パフォーマンス最適化プラグイン
  plugins: [],
  
  // 📦 未使用CSS除去強化
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    options: {
      safelist: [
        // 動的に生成されるクラス
        /^animate-/,
        /^bg-/,
        /^text-/,
        /^border-/,
        // framer-motion用
        'opacity-0',
        'scale-95',
        'translate-y-2',
      ],
    },
  },
  
  // 🎯 最適化設定
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  
  // 🎵 実験的最適化
  experimental: {
    optimizeUniversalDefaults: true,
  },
  
  // 📊 ファイルサイズ削減
  corePlugins: {
    // 使用しない機能を無効化
    preflight: true,
    container: false, // 使用していない場合
    accessibility: true,
    appearance: true,
    backgroundAttachment: false, // 使用頻度低
    backgroundClip: true,
    backgroundOpacity: true,
    backgroundPosition: false,
    backgroundRepeat: false,
    backgroundSize: false,
    borderCollapse: false,
    borderOpacity: true,
    borderSpacing: false,
    clear: false,
    cursor: true,
    display: true,
    divideColor: false,
    divideOpacity: false,
    divideWidth: false,
    fill: false,
    flex: true,
    flexDirection: true,
    flexGrow: true,
    flexShrink: true,
    flexWrap: true,
    float: false,
    fontFamily: true,
    fontSize: true,
    fontSmoothing: true,
    fontStyle: true,
    fontWeight: true,
    gap: true,
    gradientColorStops: true,
    gridAutoColumns: false,
    gridAutoFlow: false,
    gridAutoRows: false,
    gridColumn: false,
    gridColumnEnd: false,
    gridColumnStart: false,
    gridRow: false,
    gridRowEnd: false,
    gridRowStart: false,
    gridTemplateColumns: false,
    gridTemplateRows: false,
    height: true,
    inset: true,
    justifyContent: true,
    justifyItems: false,
    justifySelf: false,
    letterSpacing: true,
    lineHeight: true,
    listStylePosition: false,
    listStyleType: false,
    margin: true,
    maxHeight: true,
    maxWidth: true,
    minHeight: true,
    minWidth: true,
    objectFit: false,
    objectPosition: false,
    opacity: true,
    order: false,
    outline: true,
    overflow: true,
    overscrollBehavior: false,
    padding: true,
    placeContent: false,
    placeItems: false,
    placeSelf: false,
    pointerEvents: true,
    position: true,
    resize: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
    rotate: false,
    scale: false,
    skew: false,
    space: false,
    strokeWidth: false,
    tableLayout: false,
    textAlign: true,
    textColor: true,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textIndent: false,
    textOpacity: true,
    textOverflow: true,
    textTransform: true,
    textUnderlineOffset: false,
    transform: true,
    transformOrigin: false,
    transitionDelay: false,
    transitionDuration: true,
    transitionProperty: true,
    transitionTimingFunction: true,
    translate: false,
    userSelect: true,
    verticalAlign: false,
    visibility: true,
    whitespace: true,
    width: true,
    wordBreak: false,
    zIndex: true,
  }
};

export default config;
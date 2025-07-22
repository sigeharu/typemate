import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 🌍 Context7風レスポンシブスペーシング
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // 🎵 音楽的カラーパレット（しげちゃんセンス統合）
      colors: {
        primary: {
          50: '#fef7ee',   // クリーム - YOASOBI親しみやすさ
          100: '#fdd9b5',  // ライトゴールド - tuki.繊細さ
          200: '#fbb382',  // ソフトオレンジ
          300: '#f97316',  // メインオレンジ - Ash island エネルギー
          400: '#ea580c',  // ビビッドオレンジ
          500: '#dc2626',  // レッドオレンジ
          600: '#c2410c',  // ダークオレンジ - 天野達也 テクニカル
          700: '#9a3412',  // ディープオレンジ
          800: '#7c2d12',  // 深い理解
          900: '#431407',  // 最深部
        },
        // MBTI別アクセントカラー - 感情の色彩
        enfp: {
          energy: '#10b981',   // 創造的エネルギー（グリーン）
          harmony: '#8b5cf6',  // 調和（パープル）
        },
        intj: {
          logic: '#3b82f6',    // 論理的思考（ブルー）
          vision: '#6366f1',   // ビジョン（インディゴ）
        },
        isfp: {
          gentle: '#f472b6',   // 優しさ（ピンク）
          authentic: '#a78bfa', // 真正性（ライトパープル）
        },
        estp: {
          action: '#ef4444',   // 行動力（レッド）
          vitality: '#f59e0b', // 活力（アンバー）
        },
        // 自然×デジタル融合カラー
        nature: {
          earth: '#a3a3a3',    // 大地
          sky: '#e0e7ff',      // 空
          water: '#bfdbfe',    // 水
          forest: '#bbf7d0',   // 森
        },
        // クリスプな音質感カラー
        crisp: {
          white: '#fafafa',    // 純白の静寂
          silver: '#f5f5f5',   // 優しいシルバー
          platinum: '#e5e5e5', // 境界線の美しさ
          carbon: '#404040',   // カーボン
        }
      },
      // 🎼 音楽的フォントファミリー
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        music: ['Comfortaa', 'Inter', 'sans-serif'], // 音楽的な丸みのあるフォント
      },
      // 🎵 音楽的アニメーション
      animation: {
        // 天野達也風 - テクニカルな正確性
        'technical-fade': 'technical-fade 0.3s ease-out',
        'technical-scale': 'technical-scale 0.4s ease-out',
        
        // tuki.風 - 繊細な感性
        'gentle-slide': 'gentle-slide 0.5s ease-in-out',
        'gentle-float': 'gentle-float 2s ease-in-out infinite',
        
        // Ash island風 - エネルギッシュ
        'energetic-bounce': 'energetic-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'energetic-pulse': 'energetic-pulse 1s ease-in-out infinite',
        
        // YOASOBI風 - 親しみやすい
        'friendly-wiggle': 'friendly-wiggle 0.6s ease-in-out',
        'friendly-glow': 'friendly-glow 2s ease-in-out infinite',
        
        // TypeMate専用
        'typemate-entrance': 'typemate-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'mbti-reveal': 'mbti-reveal 1.2s ease-out',
      },
      keyframes: {
        // 天野達也風アニメーション
        'technical-fade': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'technical-scale': {
          '0%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
        
        // tuki.風アニメーション
        'gentle-slide': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        
        // Ash island風アニメーション
        'energetic-bounce': {
          '0%': { opacity: '0', transform: 'translateX(-50px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        'energetic-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        
        // YOASOBI風アニメーション
        'friendly-wiggle': {
          '0%': { opacity: '0', transform: 'rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'rotate(0deg)' },
        },
        'friendly-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)' },
        },
        
        // TypeMate専用アニメーション
        'typemate-entrance': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.9)',
            filter: 'blur(5px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          },
        },
        'mbti-reveal': {
          '0%': { 
            opacity: '0', 
            transform: 'rotateX(90deg)',
            transformOrigin: 'center bottom'
          },
          '50%': {
            opacity: '0.5',
            transform: 'rotateX(45deg)',
          },
          '100%': { 
            opacity: '1', 
            transform: 'rotateX(0deg)',
          },
        },
      },
      // 🎨 音楽的グラデーション
      backgroundImage: {
        // しげちゃん流音楽的グラデーション
        'musical-sunrise': 'linear-gradient(135deg, #fef7ee 0%, #fdd9b5 25%, #f97316 75%, #c2410c 100%)',
        'musical-harmony': 'linear-gradient(45deg, #10b981 0%, #8b5cf6 50%, #f97316 100%)',
        'crisp-clarity': 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 50%, #e5e5e5 100%)',
        'energy-flow': 'linear-gradient(270deg, #ef4444 0%, #f97316 50%, #10b981 100%)',
      },
      // 🎵 音楽的シャドウ
      boxShadow: {
        'musical': '0 4px 20px rgba(249, 115, 22, 0.15)',
        'crisp': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'gentle': '0 8px 25px rgba(139, 92, 246, 0.12)',
        'energetic': '0 6px 20px rgba(239, 68, 68, 0.2)',
      },
      // 🎶 音楽的ボーダー半径
      borderRadius: {
        'musical': '16px',
        'harmony': '24px',
        'crisp': '8px',
      }
    },
  },
  plugins: [],
};

export default config;
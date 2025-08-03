// 🎵 TypeMate Optimized Motion Library
// framer-motion の部分インポートによるバンドルサイズ削減

// 最も使用頻度の高いコンポーネントのみインポート（標準インポートに修正）
export { motion, AnimatePresence } from 'framer-motion';

// 型定義（必要な分のみ）
export type { 
  HTMLMotionProps, 
  Variants, 
  Transition,
  MotionProps 
} from 'framer-motion';

// 🎼 よく使用されるアニメーション定義
export const commonVariants = {
  // ページ遷移
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeOut" }
  },
  
  // モーダル出現
  modalAppear: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" }
  },
  
  // リスト項目のスタガー
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },
  
  // ローディング状態
  loading: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // 🎵 音楽的フェードイン
  musicalFade: {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] // 音楽的なeasing
      }
    }
  }
};

// 🎶 音楽的タイミング関数
export const musicalTimings = {
  quick: 0.2,
  normal: 0.4,
  slow: 0.6,
  breath: 1.0
};

// 🚀 パフォーマンス最適化済みのデフォルト設定
export const optimizedDefaults = {
  // アニメーションのパフォーマンス向上
  initial: false, // 初期レンダリング最適化
  layoutId: undefined, // 不要なlayout animationを無効化
  
  // reduced motionへの対応
  transition: {
    duration: 0.3,
    ease: "easeOut"
  }
};
/** @type {import('next').NextConfig} */

// 🎵 Bundle Analyzer設定
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // 🔧 TypeScript/ESLint設定（開発効率重視）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🚀 パフォーマンス最適化設定
  images: {
    domains: ['lh3.googleusercontent.com'], // Google OAuth用
    formats: ['image/avif', 'image/webp'], // 最新フォーマット対応
    minimumCacheTTL: 86400, // 24時間キャッシュ
  },

  // 📦 実験的機能（パフォーマンス向上）
  experimental: {
    // optimizeCss: true, // CSS最適化（コメントアウト - critters依存関係問題）
    scrollRestoration: true, // スクロール位置復元
    cssChunking: true, // CSS Chunking最適化（Context7推奨）
    // 🚀 Context7推奨: パッケージインポート最適化
    optimizePackageImports: [
      'lucide-react',           // アイコンライブラリ tree shaking
      '@radix-ui/react-avatar',
      '@radix-ui/react-progress', 
      '@radix-ui/react-slot',
      'framer-motion',          // すでに部分対応済みだが追加最適化
      'date-fns',               // 日付ライブラリ最適化
      'zustand'                 // 状態管理最適化
    ],
    // 🔧 transpilePackages: 外部パッケージの最適化
    // Context7推奨: モノレポや特定パッケージの強制バンドル
  },
  
  // 📦 パッケージ最適化設定
  transpilePackages: [
    // 必要に応じて追加（現在は最小構成）
    // '@workspace/shared-components', // モノレポ用
  ],

  // 🎯 Webpack最適化
  webpack: (config, { dev, isServer }) => {
    // 本番環境での最適化
    if (!dev && !isServer) {
      // Bundle splitting最適化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // React関連ライブラリを別チャンク化
          react: {
            name: 'react',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 20,
          },
          // UI関連ライブラリを別チャンク化
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 15,
          },
          // 重いライブラリを別チャンク化
          heavy: {
            name: 'heavy',
            test: /[\\/]node_modules[\\/](framer-motion|@anthropic-ai|openai)[\\/]/,
            priority: 10,
          },
          // その他の vendor ライブラリ
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 5,
          },
        },
      };
    }

    // 🎵 framer-motion の tree shaking 強化（コメントアウト - 互換性問題修正）
    // if (!dev) {
    //   config.resolve.alias = {
    //     ...config.resolve.alias,
    //     'framer-motion': 'framer-motion/dist/framer-motion',
    //   };
    // }

    return config;
  },

  // 📊 パフォーマンス監視
  poweredByHeader: false, // Xヘッダー削除（セキュリティ向上）
  
  // 🔄 リダイレクト最適化
  async redirects() {
    return [];
  },

  // 📱 PWA準備（将来拡張用）
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
};

module.exports = withBundleAnalyzer(nextConfig);
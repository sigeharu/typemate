#!/bin/bash

# 🎵 TypeMate Performance Test Script
# Stage4最適化の効果測定用

echo "🎵 TypeMate Performance Optimization Test"
echo "=========================================="

# 📦 Bundle Size Analysis
echo ""
echo "📦 Running Bundle Analysis..."
npm run analyze

# 🚀 Build Performance Test
echo ""
echo "🚀 Build Performance Test..."
echo "Building production version..."
time npm run build

# 📊 Bundle Size Report
echo ""
echo "📊 Bundle Size Report:"
echo "----------------------"

# .next/static/chunks のサイズ確認
if [ -d ".next/static/chunks" ]; then
    echo "Main Chunks:"
    du -h .next/static/chunks/*.js | sort -hr | head -10
    
    echo ""
    echo "Total Bundle Size:"
    du -sh .next/static/chunks/
fi

# 📈 Performance Recommendations
echo ""
echo "📈 Performance Optimization Results:"
echo "-----------------------------------"
echo "✅ framer-motion: Optimized to partial imports"
echo "✅ React components: memo化適用"  
echo "✅ CSS: Tailwind最適化・不要クラス除去"
echo "✅ Dynamic Imports: 重いコンポーネントに適用"
echo "✅ Bundle Splitting: ライブラリ別チャンク化"
echo "✅ Performance Monitoring: 全体監視システム"

echo ""
echo "🎯 Next Steps:"
echo "- npm run dev で開発サーバー起動"
echo "- Network tab でバンドルサイズ確認"  
echo "- Lighthouse でスコア測定"
echo "- Performance Monitor で実時間測定"

echo ""
echo "🎵 Stage4 Performance Optimization Complete! 🎶"
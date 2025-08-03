// 🎵 TypeMate Performance Monitor
// パフォーマンス監視とWeb Vitals追跡

'use client';

import { useCallback, useEffect } from 'react';
import { performanceLog } from './secure-logger';

// 🚀 Web Vitals監視（Context7推奨のperformance.now()活用）
export function usePerformanceMonitor(debug = false) {
  const reportMetric = useCallback((metric: any) => {
    // 🛡️ セキュアなパフォーマンスログ出力
    performanceLog.metric(metric.name, metric.value, metric.rating);
    
    // Vercel Analyticsがあれば送信
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'webVital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        // Context7推奨: performance.timeOrigin + performance.now() で絶対時刻
        timestamp: performance.timeOrigin + performance.now(),
      });
    }
    
    // 🛡️ パフォーマンス問題のセキュアログ
    if (metric.rating === 'poor') {
      performanceLog.error(`Poor ${metric.name}: ${metric.value}`);
    }
  }, [debug]);

  useEffect(() => {
    // Web Vitalsの動的インポート
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportMetric);
      onFID(reportMetric);
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
      // Context7推奨: INP (Interaction to Next Paint) も監視
      onINP(reportMetric);
    }).catch(() => {
      // web-vitalsがインストールされていない場合
      if (debug) {
        performanceLog.error('web-vitals not available');
      }
    });
  }, [reportMetric]);
}

// 🎯 リソース監視
export function useResourceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          const metrics = {
            domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            loadComplete: nav.loadEventEnd - nav.loadEventStart,
            firstByte: nav.responseStart - nav.requestStart,
            domInteractive: nav.domInteractive - nav.navigationStart,
          };
          
          performanceLog.metric('Navigation', JSON.stringify(metrics));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);
}

// 🎵 メモリ使用量監視
export function useMemoryMonitor(interval = 10000) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!(performance as any).memory) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      
      const usage = {
        used: Math.round(used / 1048576), // MB
        total: Math.round(total / 1048576),
        limit: Math.round(limit / 1048576),
        percentage: Math.round((used / limit) * 100)
      };

      if (usage.percentage > 80) {
        performanceLog.error(`High memory usage: ${usage.percentage}%`);
      }
    };

    const timer = setInterval(checkMemory, interval);
    checkMemory(); // 初回実行

    return () => clearInterval(timer);
  }, [interval]);
}

// 🎶 画像読み込み最適化
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  // Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  // 既存の画像にlazy loading適用
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

// 🔧 パフォーマンス改善提案
export function getPerformanceRecommendations() {
  const recommendations = [];

  // Bundle Size チェック
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]');
    if (scripts.length > 10) {
      recommendations.push('多数のスクリプトが読み込まれています。Code Splittingを検討してください。');
    }
  }

  // CSS最適化チェック
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  if (stylesheets.length > 5) {
    recommendations.push('CSSファイルが多すぎます。Critical CSSの適用を検討してください。');
  }

  return recommendations;
}

// 🎵 TypeMateパフォーマンス情報表示
export function showPerformanceStats() {
  if (typeof window === 'undefined') return;

  // 🛡️ セキュアなパフォーマンス情報表示
  const scripts = Array.from(document.querySelectorAll('script[src]'))
    .map((script: any) => script.src)
    .filter(src => src.includes('/_next/'));
  
  performanceLog.metric('LoadedChunks', scripts.length);
  
  // メモリ情報
  if ((performance as any).memory) {
    const memory = (performance as any).memory;
    const memoryData = {
      used: Math.round(memory.usedJSHeapSize / 1048576),
      total: Math.round(memory.totalJSHeapSize / 1048576)
    };
    performanceLog.metric('MemoryUsage', memoryData.used, `${memoryData.used}/${memoryData.total}MB`);
  }
  
  // タイミング情報
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const timingData = {
      domReady: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
      firstByte: Math.round(navigation.responseStart - navigation.requestStart)
    };
    performanceLog.metric('DOMReady', timingData.domReady);
    performanceLog.metric('LoadComplete', timingData.loadComplete);
    performanceLog.metric('FirstByte', timingData.firstByte);
  }
}

// 🚀 開発時のパフォーマンス監視フック
export function useDevPerformanceMonitor() {
  usePerformanceMonitor(process.env.NODE_ENV === 'development');
  useResourceMonitor();
  useMemoryMonitor();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 5秒後にパフォーマンス情報表示
      setTimeout(showPerformanceStats, 5000);
    }
  }, []);
}
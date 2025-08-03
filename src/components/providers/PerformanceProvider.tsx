// 🎵 TypeMate Performance Provider
// アプリ全体のパフォーマンス監視・最適化コンポーネント

'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { useDevPerformanceMonitor } from '@/lib/performance-monitor';

interface PerformanceContextType {
  isMonitoring: boolean;
  reportMetric: (name: string, value: number) => void;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isMonitoring: false,
  reportMetric: () => {},
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider = React.memo(({ children }: PerformanceProviderProps) => {
  // 🎵 開発時のパフォーマンス監視
  useDevPerformanceMonitor();

  const reportMetric = React.useCallback((name: string, value: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎵 Metric [${name}]:`, value);
    }
    
    // Vercel Analytics等への送信
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'performance', { name, value });
    }
  }, []);

  // 🚀 アプリ起動時の最適化処理（Context7推奨パターン）
  useEffect(() => {
    // Critical resources preloading
    if (typeof window !== 'undefined') {
      // 重要なChunkをプリロード
      import('@/lib/optimized-motion').catch(() => {});
      import('@/lib/dynamic-imports').catch(() => {});
      import('@/lib/optimized-icons').catch(() => {}); // Context7追加
      
      // Context7推奨: performance.now()でより正確な測定
      const startTime = performance.now();
      
      // フォント最適化
      if ('fonts' in document) {
        (document as any).fonts.ready.then(() => {
          const fontLoadTime = performance.now() - startTime;
          reportMetric('fonts-loaded', fontLoadTime);
        });
      }
      
      // Context7推奨: 画像読み込み最適化の確認
      if ('loading' in HTMLImageElement.prototype) {
        reportMetric('lazy-loading-supported', 1);
      }
      
      // 画像遅延読み込み設定
      if ('IntersectionObserver' in window) {
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

        // 既存の画像に適用
        setTimeout(() => {
          document.querySelectorAll('img[data-src]').forEach((img) => {
            imageObserver.observe(img);
          });
        }, 100);
      }
    }
  }, [reportMetric]);

  // 🎶 レンダリング最適化 - 不要な再レンダリング防止
  const contextValue = React.useMemo(() => ({
    isMonitoring: process.env.NODE_ENV === 'development',
    reportMetric,
  }), [reportMetric]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
});

PerformanceProvider.displayName = 'PerformanceProvider';

// 🎯 パフォーマンス計測用カスタムフック
export const usePerformanceMetric = (name: string) => {
  const { reportMetric } = usePerformance();
  
  const start = React.useRef<number>(0);
  
  const startTiming = React.useCallback(() => {
    start.current = performance.now();
  }, []);
  
  const endTiming = React.useCallback(() => {
    const duration = performance.now() - start.current;
    reportMetric(name, duration);
    return duration;
  }, [name, reportMetric]);
  
  return { startTiming, endTiming };
};

// 🚀 コンポーネント レンダリング時間計測
export const withPerformanceMetrics = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = React.memo((props: P) => {
    const { reportMetric } = usePerformance();
    
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const renderTime = performance.now() - startTime;
        reportMetric(`${componentName}-render`, renderTime);
      };
    }, [reportMetric]);
    
    return <Component {...props} />;
  });
  
  WrappedComponent.displayName = `withPerformanceMetrics(${componentName})`;
  return WrappedComponent;
};
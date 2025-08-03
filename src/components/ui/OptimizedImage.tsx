// 🎵 TypeMate Optimized Image Components
// Context7推奨: next/image の最適化活用

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  /** TypeMate専用: 音楽的なローディング効果 */
  musicalLoading?: boolean;
}

// 🚀 Context7推奨: next/imageの最適化活用
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false,
  quality = 85, // Context7推奨: 適切な品質設定
  sizes,
  fill = false,
  musicalLoading = true,
  ...props 
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn(
      "relative overflow-hidden",
      musicalLoading && isLoading && "animate-pulse bg-gray-200",
      className
    )}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes || (fill ? "100vw" : undefined)}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        // Context7推奨: パフォーマンス最適化のためのplaceholder
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        {...props}
      />
      
      {/* エラー時のフォールバック */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">画像を読み込めませんでした</span>
        </div>
      )}
    </div>
  );
};

// 🎵 TypeMate専用: アバター画像最適化
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}

export const OptimizedAvatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}: OptimizedAvatarProps) => {
  const sizeMap = {
    sm: { width: 32, height: 32, className: 'w-8 h-8' },
    md: { width: 40, height: 40, className: 'w-10 h-10' },
    lg: { width: 48, height: 48, className: 'w-12 h-12' },
  };

  const sizeConfig = sizeMap[size];

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden bg-gray-200",
      sizeConfig.className,
      className
    )}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          width={sizeConfig.width}
          height={sizeConfig.height}
          className="object-cover"
          quality={90} // アバターは高品質で
          musicalLoading={true}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

// 🌟 TypeMate専用: 背景画像最適化
interface OptimizedBackgroundProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
}

export const OptimizedBackground = ({ 
  src, 
  alt, 
  children, 
  className,
  overlay = true 
}: OptimizedBackgroundProps) => {
  return (
    <div className={cn("relative", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        quality={75} // 背景は少し圧縮
        sizes="100vw"
        className="object-cover"
        musicalLoading={false} // 背景はシンプルに
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// 💡 Context7情報に基づく使用ガイド
/*
Context7推奨パターン:

1. 基本使用:
<OptimizedImage
  src="/images/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // 重要な画像
/>

2. アバター:
<OptimizedAvatar
  src={user.avatar}
  alt={user.name}
  size="md"
  fallback={user.name}
/>

3. 背景画像:
<OptimizedBackground src="/bg.jpg" alt="Background">
  <div>Content</div>
</OptimizedBackground>

パフォーマンス最適化:
- 自動AVIF/WebP変換
- 適切なサイズ設定
- Lazy loading（priorityでない場合）
- ぼかしplaceholder
- エラーハンドリング
*/
// 🎼 TypeMate Typography Component
// 統一されたテキストコンポーネントシステム

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { textStyles } from '@/lib/design-tokens';

// 🎯 テキストバリエーション定義
export type TextVariant = keyof typeof textStyles;
export type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'info';

interface TextProps {
  /** テキストバリエーション（デザインシステムベース） */
  variant?: TextVariant;
  /** HTMLエレメント */
  as?: TextElement;
  /** テキストカラー */
  color?: TextColor;
  /** 中央揃え */
  center?: boolean;
  /** 右揃え */
  right?: boolean;
  /** 太字 */
  bold?: boolean;
  /** 斜体 */
  italic?: boolean;
  /** 下線 */
  underline?: boolean;
  /** 取り消し線 */
  strikethrough?: boolean;
  /** 大文字 */
  uppercase?: boolean;
  /** 小文字 */
  lowercase?: boolean;
  /** 文字間隔 */
  tracking?: 'tight' | 'normal' | 'wide';
  /** 行の高さオーバーライド */
  leading?: 'tight' | 'normal' | 'relaxed';
  /** 最大幅 */
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  /** 切り詰め */
  truncate?: boolean;
  /** 改行 */
  break?: 'normal' | 'words' | 'all';
  /** 追加のCSSクラス */
  className?: string;
  /** 子要素 */
  children: React.ReactNode;
}

// 🎨 カラーマッピング
const colorClasses: Record<TextColor, string> = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-600 dark:text-gray-400', 
  tertiary: 'text-gray-500 dark:text-gray-500',
  inverse: 'text-white dark:text-gray-900',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

// 🎯 最大幅マッピング
const maxWidthClasses: Record<NonNullable<TextProps['maxWidth']>, string> = {
  none: 'max-w-none',
  xs: 'max-w-xs',
  sm: 'max-w-sm', 
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

// 🎼 文字間隔マッピング
const trackingClasses: Record<NonNullable<TextProps['tracking']>, string> = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
};

// 📏 行の高さマッピング
const leadingClasses: Record<NonNullable<TextProps['leading']>, string> = {
  tight: 'leading-tight',
  normal: 'leading-normal', 
  relaxed: 'leading-relaxed',
};

// 🔤 改行マッピング
const breakClasses: Record<NonNullable<TextProps['break']>, string> = {
  normal: 'break-normal',
  words: 'break-words',
  all: 'break-all',
};

// 🎯 バリエーション → HTMLエレメントマッピング
const defaultElements: Record<TextVariant, TextElement> = {
  'heading-1': 'h1',
  'heading-2': 'h2', 
  'heading-3': 'h3',
  'heading-4': 'h4',
  'body-large': 'p',
  'body-base': 'p',
  'body-small': 'p',
  'caption': 'span',
  'label-medium': 'label',
  'label-small': 'label',
};

// 🎨 バリエーション → Tailwindクラスマッピング
const variantClasses: Record<TextVariant, string> = {
  'heading-1': 'text-4xl font-bold tracking-tight',
  'heading-2': 'text-3xl font-bold tracking-tight',
  'heading-3': 'text-2xl font-semibold',
  'heading-4': 'text-xl font-semibold',
  'body-large': 'text-lg font-normal',
  'body-base': 'text-base font-normal',
  'body-small': 'text-sm font-normal',
  'caption': 'text-xs font-normal',
  'label-medium': 'text-sm font-medium',
  'label-small': 'text-xs font-medium',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body-base',
  as,
  color = 'primary',
  center = false,
  right = false,
  bold = false,
  italic = false,
  underline = false,
  strikethrough = false,
  uppercase = false,
  lowercase = false,
  tracking,
  leading,
  maxWidth,
  truncate = false,
  break: breakProp,
  className,
  children,
  ...props
}) => {
  // HTMLエレメントを決定
  const Element = as || defaultElements[variant];
  
  // クラス名を構築
  const classes = cn(
    // ベースバリエーション
    variantClasses[variant],
    
    // カラー
    colorClasses[color],
    
    // 配置
    center && 'text-center',
    right && 'text-right',
    
    // フォントスタイル
    bold && 'font-bold',
    italic && 'italic',
    underline && 'underline',
    strikethrough && 'line-through',
    
    // テキスト変換
    uppercase && 'uppercase',
    lowercase && 'lowercase',
    
    // 文字間隔
    tracking && trackingClasses[tracking],
    
    // 行の高さ
    leading && leadingClasses[leading],
    
    // 最大幅
    maxWidth && maxWidthClasses[maxWidth],
    
    // 切り詰め
    truncate && 'truncate',
    
    // 改行
    breakProp && breakClasses[breakProp],
    
    // カスタムクラス
    className
  );

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
};

// 🎵 便利なショートカットコンポーネント
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="heading-1" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="heading-2" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="heading-3" {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="heading-4" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-base" {...props} />
);

export const BodyLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-large" {...props} />
);

export const BodySmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body-small" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label-medium" {...props} />
);

export const LabelSmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label-small" {...props} />
);
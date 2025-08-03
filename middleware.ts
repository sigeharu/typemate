// 🎵 TypeMate Middleware - Supabase認証対応
// Google OAuth認証チェック機能

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 静的リソースとAPIはスルー
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 認証不要のパブリックページ（ランディングページと認証関連のみ）
  const publicPages = [
    '/',
    '/auth/signin',
    '/auth/callback',
    '/auth/error',
    '/terms',
    '/privacy'
  ];

  // 認証必須ページ（診断・チャット・プロフィールなど全機能）
  const authRequiredPages = [
    '/diagnosis',
    '/chat',
    '/profile',
    '/debug'
  ];

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // 🛡️ セキュリティ強化: 本番環境では認証バイパス完全無効化
  // 開発環境でのみ特定ページの認証をバイパス（本番では強制認証）
  if (process.env.NODE_ENV === 'development' && (pathname.startsWith('/harmonic-setup') || pathname === '/settings')) {
    return NextResponse.next();
  }

  // Supabase認証チェック
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 認証が必要だが未認証の場合、サインインページにリダイレクト
  if (!user && !publicPages.includes(pathname)) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Next.js 15推奨マッチャー（安全性重視）
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
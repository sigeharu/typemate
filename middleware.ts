// 🎵 TypeMate Middleware - NextAuth.js認証対応
// Google OAuth認証チェック機能

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
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

    // 認証不要のパブリックページ
    const publicPages = [
      '/',
      '/auth/signin',
      '/auth/error',
      '/terms',
      '/privacy'
    ];

    if (publicPages.includes(pathname)) {
      return NextResponse.next();
    }

    // 認証が必要なページは NextAuth.js に委ねる
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // 認証不要のパブリックページ
        const publicPages = [
          '/',
          '/auth/signin',
          '/auth/error',
          '/terms',
          '/privacy'
        ];

        if (publicPages.includes(pathname)) {
          return true;
        }

        // その他のページは認証が必要
        return !!token;
      },
    },
  }
)

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
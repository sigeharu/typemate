// 🎵 TypeMate App Router
// シンプルなアプリケーションラッパー

'use client';

import { Notifications } from '@/components/ui/Notifications';

interface AppRouterProps {
  children: React.ReactNode;
}

export const AppRouter = ({ children }: AppRouterProps) => {
  return (
    <>
      {children}
      <Notifications />
    </>
  );
};
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth.context';

function isAuthRoute(pathname: string) {
  return pathname.startsWith('/auth');
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isAuthRoute(pathname)) {
      router.replace('/auth/login');
      return;
    }

    if (isAuthenticated && isAuthRoute(pathname)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white">Validando sessão...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthRoute(pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white">Redirecionando para login...</p>
      </div>
    );
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-white">Redirecionando...</p>
      </div>
    );
  }

  return <>{children}</>;
}

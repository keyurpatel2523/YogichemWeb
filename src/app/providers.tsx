'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { useUserStore } from '@/lib/store';

function SessionGuard() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/auth/profile')
      .then((response) => {
        if (!cancelled && response.status === 401) logout();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user, logout]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionGuard />
      {children}
    </QueryClientProvider>
  );
}

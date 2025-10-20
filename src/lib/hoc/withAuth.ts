'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export function withAuth<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const { accessToken, loading, tryHydrate } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      let mounted = true;
      (async () => {
        // Si nunca cargamos token, intentá refresh silencioso una vez
        if (!accessToken) {
          await tryHydrate();
        }
        if (mounted) setChecked(true);
      })();
      return () => { mounted = false; };
    }, [accessToken, tryHydrate]);

    const isPublicRoute = useMemo(() => {
      if (!pathname) return false;
      const publicPrefixes = ["/auth", "/verify-cta", "/verify-email"];
      return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
    }, [pathname]);

    useEffect(() => {
      if (!loading && checked && !accessToken && !isPublicRoute) {
        router.replace(`/auth`);
      }
    }, [loading, checked, accessToken, isPublicRoute, router]);

    if (loading || !checked) return null; // o un spinner/esqueleto
    if (!accessToken) return null;        // evitar flicker

    return React.createElement(WrappedComponent, props);
  };

  return ComponentWithAuth;
}

'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>): React.FC<P> {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const { accessToken, loading, tryHydrate } = useAuthStore();
    const [checked, setChecked] = useState(false);
    const hydrateRef = useRef(false); // Evitar múltiples llamadas

    useEffect(() => {
      let mounted = true;

      const initAuth = async () => {
        // Solo hidratar si no se ha hecho antes y no hay token
        if (!hydrateRef.current && !accessToken && !loading) {
          hydrateRef.current = true;
          try {
            await tryHydrate();
          } catch (error) {
            console.warn('Error during auth hydration:', error);
          }
        }
        if (mounted) setChecked(true);
      };

      initAuth();
      return () => {
        mounted = false;
      };
    }, [accessToken, loading, tryHydrate]);

    const isPublicRoute = useMemo(() => {
      if (!pathname) return false;

      const publicExact = ['/'];
      const publicPrefixes = ['/auth', '/landing'];

      if (publicExact.includes(pathname)) {
        return true;
      }

      return publicPrefixes.some(prefix => pathname.startsWith(prefix));
    }, [pathname]);

    useEffect(() => {
      if (!loading && checked && !accessToken && !isPublicRoute) {
        // Usar replace para evitar loops en el historial
        router.replace('/auth');
      }
    }, [loading, checked, accessToken, isPublicRoute, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (loading || !checked) {
      return null; // O un componente de loading
    }

    // Para rutas públicas, renderizar siempre
    if (isPublicRoute) {
      return React.createElement(WrappedComponent, props);
    }

    // Para rutas privadas, solo renderizar si hay token
    if (!accessToken) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };

  return ComponentWithAuth;
}

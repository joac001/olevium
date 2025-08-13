'use client';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, ComponentType } from 'react';
import useAuthStore from '@/stores/auth';
import cache from '@/services/cache';
import { AuthStoreType } from '@/types/store';

function getDisplayName<T>(WrappedComponent: ComponentType<T>): string {
    return (
        (WrappedComponent as { displayName?: string }).displayName ||
        (WrappedComponent as { name?: string }).name ||
        'Component'
    );
}

function withAuth<T extends object>(WrappedComponent: ComponentType<T>): React.FC<React.PropsWithChildren<T>> {

    const AuthComponent: React.FC<React.PropsWithChildren<T>> = (props) => {
        const { loggedIn } = useAuthStore() as AuthStoreType;
        const router = useRouter();
        const pathname = usePathname();

        // Permitir acceso libre a cualquier ruta bajo /auth (incluye subrutas)
        const isAuthRoute = pathname?.startsWith('/auth');

        useEffect(() => {
            if (!cache.get('token') || (!loggedIn && !isAuthRoute)) {
                router.push('/auth');
            }
        }, [loggedIn, router, isAuthRoute]);

        return !loggedIn ? null : <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
    return AuthComponent;
}

export default withAuth;

import { useRouter } from 'next/navigation';
import React, { useEffect, ComponentType } from 'react';
import cache from '@/services/cache';

function getDisplayName<T>(WrappedComponent: ComponentType<T>): string {
    return (WrappedComponent as any).displayName || (WrappedComponent as any).name || 'Component';
}

function withAuth<T extends object>(WrappedComponent: ComponentType<T>): React.FC<React.PropsWithChildren<T>> {
    const AuthComponent: React.FC<React.PropsWithChildren<T>> = (props) => {
        const router = useRouter();

        useEffect(() => {
            if (!cache.get('token')) {
                router.push('/auth');
            }
        }, [router]);

        return cache.get('token') ? <WrappedComponent {...props} /> : null;
    };

    AuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
    return AuthComponent;
}

export default withAuth;

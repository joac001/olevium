'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Box, Card, Typography } from '@/components/shared/ui/';
import LoginForm from './_authComponents/LoginForm';
import RegisterForm from './_authComponents/RegisterForm';
import { useUserStore } from '@/stores/user';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
    const [activeForm, setActiveForm] = useState<AuthMode>('login');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const hydrate = useUserStore((state) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    const handleShowLogin = () => {
        setActiveForm('login');
        setStatusMessage(null);
    };

    const handleShowRegister = () => {
        setActiveForm('register');
        setStatusMessage(null);
    };

    const handleRegisterSuccess = (message?: string) => {
        setStatusMessage(message ?? 'Cuenta creada. Revisá tu email para verificarla antes de iniciar sesión.');
        setActiveForm('login');
    };

    const cardCopy = useMemo(() => {
        if (activeForm === 'login') {
            return {
                title: '¡Hola de nuevo!',
                subtitle: 'Ingresá con tus credenciales y retomá tu planificación.',
            };
        }

        return {
            title: 'Crear una cuenta',
            subtitle: 'Empezá a tomar el control de tus finanzas con Olevium.',
        };
    }, [activeForm]);

    return (
        <Container className="items-center justify-center">
            <Box className="w-full max-w-xl mx-auto">
                <Card title={cardCopy.title} subtitle={cardCopy.subtitle}>
                    {statusMessage && activeForm === 'login' && (
                        <Typography variant="caption">
                            <span className="font-semibold text-[color:var(--color-success,#22c55e)]">
                                {statusMessage}
                            </span>
                        </Typography>
                    )}
                    {activeForm === 'login' ? (
                        <LoginForm
                            onSwitchToRegister={handleShowRegister}
                            onSuccess={() => setStatusMessage(null)}
                        />
                    ) : (
                        <RegisterForm
                            onSwitchToLogin={handleShowLogin}
                            onSuccess={handleRegisterSuccess}
                        />
                    )}
                </Card>
            </Box>
        </Container>
    );
}

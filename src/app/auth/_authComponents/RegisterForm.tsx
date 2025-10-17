'use client';

import { useEffect, useState } from 'react';
import { ButtonProps, FormWrapper, Input, Typography, Box } from '@/components/shared/ui';
import { useUserStore } from '@/stores/user';

type RegisterFormProps = {
    onSwitchToLogin: () => void;
    onSuccess?: (message?: string) => void;
};

const INITIAL_MESSAGE = null as string | null;

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const register = useUserStore((state) => state.register);
    const isLoading = useUserStore((state) => state.isLoading);
    const error = useUserStore((state) => state.error);
    const clearError = useUserStore((state) => state.clearError);

    const [formError, setFormError] = useState<string | null>(INITIAL_MESSAGE);
    const [feedback, setFeedback] = useState<string | null>(INITIAL_MESSAGE);

    useEffect(() => {
        if (error) {
            setFormError(error);
            setFeedback(null);
        }
    }, [error]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const resetMessages = () => {
        if (formError) {
            setFormError(null);
        }

        if (feedback) {
            setFeedback(null);
        }

        if (error) {
            clearError();
        }
    };

    const handleSubmit = async (formData: FormData) => {
        resetMessages();

        const name = String(formData.get('name') ?? '').trim();
        const email = String(formData.get('email') ?? '').trim();
        const password = String(formData.get('password') ?? '');
        const confirmPassword = String(formData.get('confirmPassword') ?? '');

        if (!name || !email || !password || !confirmPassword) {
            setFormError('Completá todos los campos obligatorios.');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('Las contraseñas no coinciden.');
            return;
        }

        try {
            await register({ name, email, password });
            const successMessage = 'Cuenta creada. Revisá tu email para verificarla antes de iniciar sesión.';
            setFeedback(successMessage);
            onSuccess?.(successMessage);
        } catch (unknownError) {
            const fallbackMessage =
                unknownError instanceof Error
                    ? unknownError.message
                    : 'No pudimos crear la cuenta. Intenta nuevamente.';
            setFormError(fallbackMessage);
        }
    };

    const handleFormWrapperError = (wrapperError: Error) => {
        setFormError(wrapperError.message);
    };

    const handleSwitchClick = () => {
        resetMessages();
        onSwitchToLogin();
    };

    const buttons: ButtonProps[] = [
        {
            type: 'primary',
            text: isLoading ? 'Creando...' : 'Crear cuenta',
            htmlType: 'submit',
            disabled: isLoading,
        },
        {
            type: 'secondary',
            text: 'Ya tengo cuenta',
            onClick: handleSwitchClick,
            disabled: isLoading,
        },
    ];

    const handleInputChange = () => {
        resetMessages();
    };

    return (
        <FormWrapper
            onSubmit={handleSubmit}
            buttons={buttons}
            onError={handleFormWrapperError}
            className="space-y-4"
        >
            <Box className="space-y-2">
                <Input
                    label="Nombre completo"
                    name="name"
                    placeholder="Nombre y apellido"
                    required
                    onValueChange={handleInputChange}
                />
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    onValueChange={handleInputChange}
                />
                <Input
                    label="Contraseña"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                    onValueChange={handleInputChange}
                />
                <Input
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type="password"
                    placeholder="********"
                    required
                    onValueChange={handleInputChange}
                />
            </Box>
            {formError && (
                <Typography variant="caption">
                    <span className="font-semibold text-[color:var(--color-danger)]">{formError}</span>
                </Typography>
            )}
            {feedback && (
                <Typography variant="caption">
                    <span className="font-semibold text-[color:var(--color-success,#22c55e)]">{feedback}</span>
                </Typography>
            )}
        </FormWrapper>
    );
}

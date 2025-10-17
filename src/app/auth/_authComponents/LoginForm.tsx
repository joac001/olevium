'use client';

import { useEffect, useState } from 'react';
import { ButtonProps, FormWrapper, Input, Typography, Box } from '@/components/shared/ui';
import { useUserStore } from '@/stores/user';

type LoginFormProps = {
    onSwitchToRegister: () => void;
    onSuccess?: () => void;
};

const INITIAL_ERROR = null as string | null;

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
    const login = useUserStore((state) => state.login);
    const isLoading = useUserStore((state) => state.isLoading);
    const error = useUserStore((state) => state.error);
    const clearError = useUserStore((state) => state.clearError);

    const [formError, setFormError] = useState<string | null>(INITIAL_ERROR);

    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const resetErrors = () => {
        if (formError) {
            setFormError(null);
        }

        if (error) {
            clearError();
        }
    };

    const handleSubmit = async (formData: FormData) => {
        resetErrors();

        const email = String(formData.get('email') ?? '').trim();
        const password = String(formData.get('password') ?? '');

        if (!email || !password) {
            setFormError('Completá todos los campos obligatorios.');
            return;
        }

        try {
            await login({ email, password });
            if (onSuccess) {
                onSuccess();
            }
        } catch (unknownError) {
            const fallbackMessage =
                unknownError instanceof Error
                    ? unknownError.message
                    : 'No se pudo iniciar sesión. Intenta nuevamente.';
            setFormError(fallbackMessage);
        }
    };

    const handleFormWrapperError = (wrapperError: Error) => {
        setFormError(wrapperError.message);
    };

    const handleSwitchClick = () => {
        resetErrors();
        onSwitchToRegister();
    };

    const formButtons: ButtonProps[] = [
        {
            type: 'primary',
            text: isLoading ? 'Ingresando...' : 'Iniciar sesión',
            htmlType: 'submit',
            disabled: isLoading,
        },
        {
            type: 'secondary',
            text: 'Crear cuenta',
            onClick: handleSwitchClick,
            disabled: isLoading,
        },
    ];

    const handleInputChange = () => {
        resetErrors();
    };

    return (
        <FormWrapper
            onSubmit={handleSubmit}
            buttons={formButtons}
            onError={handleFormWrapperError}
            className="space-y-4"
        >
            <Box className="space-y-2">
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
                    customValidator={() => true}
                />
            </Box>
            {formError && (
                <Typography variant="caption">
                    <span className="font-semibold text-[color:var(--color-danger)]">{formError}</span>
                </Typography>
            )}
        </FormWrapper>
    );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, FormWrapper, Input, Typography } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useAuthStore } from '@/lib/stores/auth';
import { extractAuthErrorMessage } from './authErrorUtils';

export default function LoginForm() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const login = useAuthStore(state => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttons: ButtonProps[] = useMemo(
    () => [
      {
        text: isSubmitting ? 'Ingresando...' : 'Iniciar sesión',
        htmlType: 'submit',
        type: 'primary',
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const emailValue = formData.get('email');
      const passwordValue = formData.get('password');

      if (typeof emailValue !== 'string' || typeof passwordValue !== 'string') {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error de autenticación',
          'Completa los campos requeridos para continuar.'
        );
        return;
      }

      setIsSubmitting(true);

      try {
        await login(emailValue, passwordValue);

        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Sesión iniciada',
          'Redirigiendo a tu panel de control.'
        );

        router.push('/');
      } catch (error) {
        const message = extractAuthErrorMessage(
          error,
          'No se pudo completar el inicio de sesión. Inténtalo nuevamente.'
        );
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error de autenticación',
          message
        );
        return;
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, router, showNotification]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-6">
      <Box className="space-y-4">
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Ingresa tus credenciales para acceder a todas las funcionalidades de Olevium.
        </Typography>

        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu-correo@ejemplo.com"
          required
          icon="fas fa-envelope"
        />

        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          required
          icon="fas fa-lock"
        />
      </Box>
    </FormWrapper>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Mail, Lock } from 'lucide-react';
import { Box, FormWrapper, Input, Typography, AppLink } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useAuthErrorHandler } from '@/lib/hooks/useErrorHandler';
import { login } from '@/lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { handleLogin } = useAuthErrorHandler();
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
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Error de autenticación',
          'Completa los campos requeridos para continuar.'
        );
        return;
      }

      setIsSubmitting(true);

      const success = await handleLogin(async () => {
        await login(emailValue, passwordValue);
      });

      if (success) {
        router.push('/dashboard');
      }

      setIsSubmitting(false);
    },
    [router, showNotification, handleLogin]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-6">
      <Box className="space-y-4">
        {/* <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Ingresa tus credenciales para acceder a todas las funcionalidades de Olevium.
        </Typography> */}

        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu-correo@ejemplo.com"
          required
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />

        <Input
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          required
          icon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
        />

        <Box className="flex justify-end">
          <AppLink
            href="/auth/forgot-password"
            variant="unstyled"
            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-200"
          >
            ¿Olvidaste tu contraseña?
          </AppLink>
        </Box>
      </Box>
    </FormWrapper>
  );
}

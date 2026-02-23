'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, RotateCcw, CheckCircle, LogIn, Lock, Info, ArrowLeft } from 'lucide-react';
import { Box, Card, FormWrapper, Input, Typography, Button, AppLink } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { resetPassword } from '@/features/auth/mutations';
import { createOperationContext } from '@/lib/utils/errorSystem';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { showNotification, showError, showSuccess } = useNotification();
  const [formState, setFormState] = useState<FormState>('idle');

  const buttons: ButtonProps[] = useMemo(
    () => [
      {
        text: formState === 'submitting' ? 'Actualizando...' : 'Restablecer contraseña',
        htmlType: 'submit',
        type: 'primary',
        disabled: formState === 'submitting' || formState === 'success',
      },
    ],
    [formState]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const newPassword = formData.get('new_password');
      const confirmPassword = formData.get('confirm_password');

      if (typeof newPassword !== 'string' || !newPassword.trim()) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Campo requerido',
          'Por favor, ingresa tu nueva contraseña.'
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Las contraseñas no coinciden',
          'Asegúrate de que ambas contraseñas sean iguales.'
        );
        return;
      }

      if (newPassword.length < 8) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Contraseña muy corta',
          'La contraseña debe tener al menos 8 caracteres.'
        );
        return;
      }

      if (!token) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Token no válido',
          'El enlace de recuperación no es válido. Solicita uno nuevo.'
        );
        return;
      }

      setFormState('submitting');

      try {
        await resetPassword(token, newPassword);
        setFormState('success');
        const successContext = createOperationContext('update', 'contraseña', 'la contraseña');
        showSuccess('Tu contraseña ha sido actualizada correctamente.', successContext);

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      } catch (error) {
        const errorContext = createOperationContext('update', 'contraseña', 'la contraseña');
        showError(error, errorContext);
        setFormState('error');
      }
    },
    [token, showNotification, showError, showSuccess, router]
  );

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <Card className="p-8">
        <Box className="text-center space-y-6">
          <Box className="w-16 h-16 mx-auto bg-[var(--color-danger-soft)] rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-[var(--color-danger)]" />
          </Box>

          <Box className="space-y-2">
            <Typography variant="h2" className="text-xl font-semibold">
              Enlace no válido
            </Typography>
            <Typography variant="body" className="text-[var(--text-muted)]">
              El enlace de recuperación de contraseña no es válido o ha expirado.
              Por favor, solicita un nuevo enlace.
            </Typography>
          </Box>

          <Box className="pt-4">
            <Button
              type="primary"
              text="Solicitar nuevo enlace"
              icon={<RotateCcw className="h-4 w-4" />}
              onClick={() => router.push('/auth/forgot-password')}
              className="!px-6 !py-3"
            />
          </Box>
        </Box>
      </Card>
    );
  }

  // Si se completó exitosamente
  if (formState === 'success') {
    return (
      <Card className="p-8">
        <Box className="text-center space-y-6">
          <Box className="w-16 h-16 mx-auto bg-[var(--color-success-soft)] rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
          </Box>

          <Box className="space-y-2">
            <Typography variant="h2" className="text-xl font-semibold">
              ¡Contraseña actualizada!
            </Typography>
            <Typography variant="body" className="text-[var(--text-muted)]">
              Tu contraseña ha sido restablecida exitosamente.
              Serás redirigido al inicio de sesión en unos segundos...
            </Typography>
          </Box>

          <Box className="pt-4">
            <Button
              type="primary"
              text="Iniciar sesión ahora"
              icon={<LogIn className="h-4 w-4" />}
              onClick={() => router.push('/auth')}
              className="!px-6 !py-3"
            />
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <Box className="space-y-6">
        <Box className="text-center space-y-2">
          <Box className="w-16 h-16 mx-auto bg-[var(--color-primary-soft)] rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[var(--color-primary)]" />
          </Box>
          <Typography variant="h2" className="text-xl font-semibold">
            Restablecer contraseña
          </Typography>
          <Typography variant="body" className="text-[var(--text-muted)]">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </Typography>
        </Box>

        <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-6">
          <Box className="space-y-4">
            <Input
              name="new_password"
              type="password"
              label="Nueva contraseña"
              placeholder="••••••••"
              required
              icon={<Lock className="h-4 w-4" />}
            />

            <Input
              name="confirm_password"
              type="password"
              label="Confirmar contraseña"
              placeholder="••••••••"
              required
              icon={<Lock className="h-4 w-4" />}
            />

            <Typography variant="body" className="text-xs text-[var(--text-muted)]">
              <Info className="inline h-3 w-3 mr-1" />
              La contraseña debe tener al menos 8 caracteres.
            </Typography>
          </Box>
        </FormWrapper>

        {formState === 'error' && (
          <Box className="text-center pt-2">
            <AppLink
              href="/auth/forgot-password"
              variant="unstyled"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Solicitar nuevo enlace
            </AppLink>
          </Box>
        )}

        <Box className="text-center pt-2">
          <AppLink
            href="/auth"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </AppLink>
        </Box>
      </Box>
    </Card>
  );
}

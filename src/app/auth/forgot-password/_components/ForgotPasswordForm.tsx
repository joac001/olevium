'use client';

import { useCallback, useMemo, useState } from 'react';
import NextLink from 'next/link';

import { Box, Card, FormWrapper, Input, Typography } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { forgotPassword } from '@/features/auth/mutations';
import { createOperationContext } from '@/lib/utils/errorSystem';

type FormState = 'idle' | 'submitting' | 'success';

export default function ForgotPasswordForm() {
  const { showNotification, showError } = useNotification();
  const [formState, setFormState] = useState<FormState>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const buttons: ButtonProps[] = useMemo(
    () => [
      {
        text: formState === 'submitting' ? 'Enviando...' : 'Enviar instrucciones',
        htmlType: 'submit',
        type: 'primary',
        disabled: formState === 'submitting' || formState === 'success',
      },
    ],
    [formState]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const emailValue = formData.get('email');

      if (typeof emailValue !== 'string' || !emailValue.trim()) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Campo requerido',
          'Por favor, ingresa tu correo electrónico.'
        );
        return;
      }

      setFormState('submitting');

      try {
        await forgotPassword(emailValue.trim());
        setSubmittedEmail(emailValue.trim());
        setFormState('success');
      } catch (error) {
        const context = createOperationContext('custom', 'recuperación de contraseña', 'la recuperación de contraseña');
        showError(error, context);
        setFormState('idle');
      }
    },
    [showNotification, showError]
  );

  if (formState === 'success') {
    return (
      <Card className="p-8">
        <Box className="text-center space-y-6">
          <Box className="w-16 h-16 mx-auto bg-[var(--color-success-soft)] rounded-full flex items-center justify-center">
            <i className="fas fa-envelope-open-text text-2xl text-[var(--color-success)]" />
          </Box>

          <Box className="space-y-2">
            <Typography variant="h2" className="text-xl font-semibold">
              ¡Revisa tu correo!
            </Typography>
            <Typography variant="body" className="text-[var(--text-muted)]">
              Si existe una cuenta asociada a{' '}
              <span className="font-medium text-[var(--text-primary)]">{submittedEmail}</span>,
              recibirás un email con instrucciones para restablecer tu contraseña.
            </Typography>
          </Box>

          <Box className="space-y-3 pt-4">
            <Typography variant="body" className="text-sm text-[var(--text-muted)]">
              ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
              <button
                type="button"
                onClick={() => setFormState('idle')}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium transition-colors"
              >
                intenta de nuevo
              </button>
            </Typography>

            <NextLink
              href="/auth"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              <i className="fas fa-arrow-left" />
              Volver al inicio de sesión
            </NextLink>
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
            <i className="fas fa-key text-2xl text-[var(--color-primary)]" />
          </Box>
          <Typography variant="h2" className="text-xl font-semibold">
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography variant="body" className="text-[var(--text-muted)]">
            No te preocupes, te enviaremos instrucciones para restablecerla.
          </Typography>
        </Box>

        <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-6">
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="tu-correo@ejemplo.com"
            required
            icon="fas fa-envelope"
          />
        </FormWrapper>

        <Box className="text-center pt-2">
          <NextLink
            href="/auth"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
          >
            <i className="fas fa-arrow-left" />
            Volver al inicio de sesión
          </NextLink>
        </Box>
      </Box>
    </Card>
  );
}

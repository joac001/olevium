'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, Mail, Lock } from 'lucide-react';

import { Box, FormWrapper, Input, Typography } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { signup } from '@/lib/auth';
import { createOperationContext } from '@/lib/utils/errorSystem';

export default function SignupForm() {
  const router = useRouter();
  const { showNotification, showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttons: ButtonProps[] = useMemo(
    () => [
      {
        text: isSubmitting ? 'Creando cuenta...' : 'Crear cuenta',
        htmlType: 'submit',
        type: 'primary',
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const nameValue = formData.get('name');
      const emailValue = formData.get('email');
      const passwordValue = formData.get('password');

      if (
        typeof nameValue !== 'string' ||
        typeof emailValue !== 'string' ||
        typeof passwordValue !== 'string'
      ) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Error en el registro',
          'Todos los campos son obligatorios para crear una cuenta.'
        );
        return;
      }

      setIsSubmitting(true);

      try {
        await signup({
          name: nameValue,
          email: emailValue,
          password: passwordValue,
        });

        const context = createOperationContext('create', 'cuenta', 'la cuenta');
        showSuccess('Cuenta creada exitosamente. Te redirigimos para continuar.', context);

        router.push('/auth/verify-cta');
      } catch (error) {
        const context = createOperationContext('create', 'cuenta', 'la cuenta');
        showError(error, context);
        return;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, showNotification, showError, showSuccess]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-6">
      <Box className="space-y-4">
        {/* <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Completa el formulario para crear tu espacio financiero en Olevium.
        </Typography> */}

        <Input
          name="name"
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          required
          icon={<User className="h-4 w-4" />}
          autoComplete="name"
        />

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
          placeholder="Crea una contraseña segura"
          required
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
        />
      </Box>
    </FormWrapper>
  );
}

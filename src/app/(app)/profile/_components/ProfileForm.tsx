'use client';

import { useEffect, useState } from 'react';
import { Box, FormWrapper, Input, Typography } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import { useUpdateProfileMutation } from '@/features/user/mutations';
import { useProfilePage } from './ProfileShell';
import { useNotification } from '@/context/NotificationContext';

export default function ProfileForm() {
  const { user } = useProfilePage();
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      setName(user.username ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      await updateProfileMutation.mutateAsync({ name, email });
      showNotification('fas fa-circle-check', 'success', 'Perfil actualizado', 'Tu información se guardó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el perfil';
      showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
    }
  };

  const buttons: ButtonProps[] = [
    {
      type: 'primary',
      text: 'Guardar cambios',
      htmlType: 'submit',
      disabled: updateProfileMutation.isPending,
    },
  ];

  return (
    <Box className="w-full max-w-lg">
      <FormWrapper
        onSubmit={handleSubmit}
        buttons={buttons}
        className="space-y-4"
      >
        <Input
          label="Nombre"
          value={name}
          onValueChange={(value) => setName(String(value ?? ''))}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          disabled
        />
      </FormWrapper>
    </Box>
  );
}

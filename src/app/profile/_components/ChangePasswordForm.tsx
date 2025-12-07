'use client';

import { useState } from 'react';
import { Box, FormWrapper, Input, Typography, Skeleton } from '@/components/shared/ui';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import { useChangePasswordMutation } from '@/features/user/mutations';
import { useNotification } from '@/context/NotificationContext';
import { useProfilePage } from './ProfileProvider';

export default function ChangePasswordForm() {
  const { isLoading } = useProfilePage();
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useChangePasswordMutation();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      showNotification('fas fa-triangle-exclamation', 'danger', 'Error', 'Las contraseñas no coinciden');
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showNotification('fas fa-circle-check', 'success', 'Contraseña actualizada', 'Tu contraseña se cambió correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña';
      showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
    }
  };

  const buttons: ButtonProps[] = [
    {
      type: 'primary',
      text: 'Cambiar contraseña',
      htmlType: 'submit',
      disabled: changePasswordMutation.isPending,
    },
  ];

  if (isLoading) {
    return (
      <Box className="w-full max-w-lg space-y-3">
        <Skeleton width="55%" height="22px" />
        <Skeleton height="46px" rounded="14px" />
        <Skeleton height="46px" rounded="14px" />
        <Skeleton height="46px" rounded="14px" />
        <Skeleton height="42px" rounded="12px" />
      </Box>
    );
  }

  return (
    <Box className="w-full max-w-lg">
      <Typography variant="h2" className="mb-4">Cambiar contraseña</Typography>
      <FormWrapper
        onSubmit={handleSubmit}
        buttons={buttons}
        className="space-y-4"
      >
        <Input
          label="Contraseña actual"
          type="password"
          value={currentPassword}
          onValueChange={(value) => setCurrentPassword(String(value ?? ''))}
        />
        <Input
          label="Nueva contraseña"
          type="password"
          value={newPassword}
          onValueChange={(value) => setNewPassword(String(value ?? ''))}
        />
        <Input
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmPassword}
          onValueChange={(value) => setConfirmPassword(String(value ?? ''))}
        />
      </FormWrapper>
    </Box>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, FormWrapper, Input } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useAccountsStore } from '@/lib/stores/accounts';

interface DeleteAccountFormProps {
  accountId: string;
  accountName: string;
  onSuccess?: () => void;
}

export default function DeleteAccountForm({
  accountId,
  accountName,
  onSuccess,
}: DeleteAccountFormProps) {
  const { showNotification } = useNotification();
  const deleteAccount = useAccountsStore(state => state.deleteAccount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Eliminando...' : 'Eliminar',
        htmlType: 'submit' as const,
        type: 'danger' as const,
        disabled: isSubmitting || inputValue.trim() !== accountName,
      },
    ],
    [accountName, inputValue, isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const nameValue = formData.get('confirmName');
      if (typeof nameValue !== 'string' || nameValue.trim() !== accountName) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Confirmación inválida',
          'Debes escribir el nombre exacto de la cuenta para eliminarla.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        await deleteAccount(accountId);
        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Cuenta eliminada',
          'La cuenta se eliminó correctamente.'
        );
        onSuccess?.();
        router.replace('/accounts');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al eliminar',
          message
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [accountId, accountName, deleteAccount, onSuccess, router, showNotification]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="confirmName"
          label={`Escribe "${accountName}" para confirmar`}
          value={inputValue}
          onValueChange={value => setInputValue(String(value))}
          required
          icon="fas fa-key"
        />
      </Box>
    </FormWrapper>
  );
}

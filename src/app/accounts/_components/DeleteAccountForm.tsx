'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, FormWrapper, Input } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useAccountsStore } from '@/lib/stores/accounts';
import { createOperationContext } from '@/lib/utils/errorSystem';

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
  const { showNotification, showError, showSuccess } = useNotification();
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
        // Primero cerrar modal para evitar que el componente padre intente actualizar
        onSuccess?.();

        // Eliminar cuenta
        await deleteAccount(accountId);

        // Navegar inmediatamente
        router.replace('/accounts');

        // Mostrar éxito después de navegar
        setTimeout(() => {
          const context = createOperationContext('delete', 'cuenta', 'la cuenta');
          showSuccess('Cuenta eliminada exitosamente.', context);
        }, 200);
      } catch (error) {
        const context = createOperationContext('delete', 'cuenta', 'la cuenta');
        showError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      accountId,
      accountName,
      deleteAccount,
      onSuccess,
      router,
      showNotification,
      showError,
      showSuccess,
    ]
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

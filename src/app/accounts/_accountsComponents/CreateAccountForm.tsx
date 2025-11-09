'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import type { AccountType } from '@/types';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useNotification } from '@/context/NotificationContext';
import { buildAccountTypeOptions, normalizeAccountFormData } from './accountFormUtils';

interface CreateAccountFormProps {
  accountTypes: AccountType[];
  loadingTypes: boolean;
  onSuccess?: () => void;
  defaultTypeId?: number;
}

export default function CreateAccountForm({
  accountTypes,
  loadingTypes,
  onSuccess,
  defaultTypeId,
}: CreateAccountFormProps) {
  const { showNotification } = useNotification();
  const createAccount = useAccountsStore(state => state.createAccount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialTypeId = defaultTypeId ?? accountTypes[0]?.typeId ?? null;

  const typeOptions: DropMenuOption[] = useMemo(
    () => buildAccountTypeOptions(accountTypes),
    [accountTypes]
  );

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Creando...' : 'Registrar cuenta',
        htmlType: 'submit' as const,
        type: 'primary' as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const normalized = normalizeAccountFormData({ formData, showNotification });

      if (!normalized) {
        return;
      }

      setIsSubmitting(true);
      try {
        await createAccount({
          name: normalized.name,
          typeId: normalized.typeId,
          currency: normalized.currency,
          balance: normalized.balance,
        });

        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Cuenta creada',
          'Tu cuenta quedó registrada y ya forma parte del panel.'
        );

        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al crear cuenta',
          message
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [createAccount, onSuccess, showNotification]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="name"
          label="Nombre de la cuenta"
          placeholder="Cuenta Corriente Banco Nación"
          required
          icon="fas fa-wallet"
        />

        <DropMenu
          name="typeId"
          label="Tipo de cuenta"
          placeholder={loadingTypes ? 'Cargando tipos...' : 'Selecciona un tipo'}
          options={typeOptions}
          required
          disabled={loadingTypes || !typeOptions.length}
          defaultValue={initialTypeId}
        />

        <Input name="currency" label="Moneda" placeholder="Ej. ARS" required icon="fas fa-coins" />

        <Input
          name="balance"
          label="Balance inicial"
          type="number"
          placeholder="0"
          required
          icon="fas fa-money-bill-trend-up"
        />
      </Box>
    </FormWrapper>
  );
}

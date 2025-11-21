'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import type { AccountType } from '@/types';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useNotification } from '@/context/NotificationContext';
import {
  buildAccountTypeOptions,
  buildCurrencyOptions,
  normalizeAccountFormData,
} from './accountFormUtils';

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
  const getCurrencies = useAccountsStore(state => state.getCurrencies);
  const currencies = useAccountsStore(state => state.currencies);
  const loadingCurrencies = useAccountsStore(state => state.loadingCurrencies);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialTypeId = defaultTypeId ?? accountTypes[0]?.typeId ?? null;

  const typeOptions: DropMenuOption[] = useMemo(
    () => buildAccountTypeOptions(accountTypes),
    [accountTypes]
  );

  const currencyOptions: DropMenuOption[] = useMemo(
    () => buildCurrencyOptions(currencies),
    [currencies]
  );

  useEffect(() => {
    getCurrencies();
  }, [getCurrencies]);

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
          currencyId: normalized.currencyId,
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
        console.error('Error creating account:', error);

        let message = 'No se pudo crear la cuenta.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: Record<string, unknown> } };
          const responseData = axiosError.response?.data;

          if (responseData?.detail) {
            if (typeof responseData.detail === 'string') {
              message = responseData.detail;
            } else if (Array.isArray(responseData.detail)) {
              // Manejar errores de validación de FastAPI
              message = responseData.detail
                .map((item: Record<string, unknown> | string) => {
                  if (typeof item === 'string') return item;
                  if (typeof item === 'object' && item.msg) return String(item.msg);
                  if (typeof item === 'object' && item.message) return String(item.message);
                  return 'Error de validación';
                })
                .join(', ');
            } else {
              message = 'Error de validación en los datos proporcionados.';
            }
          } else if (responseData?.message && typeof responseData.message === 'string') {
            message = responseData.message;
          } else if (responseData?.error && typeof responseData.error === 'string') {
            message = responseData.error;
          }
        } else if (error instanceof Error) {
          message = error.message;
        }

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

        <DropMenu
          name="currencyId"
          label="Moneda"
          placeholder={loadingCurrencies ? 'Cargando monedas...' : 'Selecciona una moneda'}
          options={currencyOptions}
          required
          disabled={loadingCurrencies || !currencyOptions.length}
        />

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

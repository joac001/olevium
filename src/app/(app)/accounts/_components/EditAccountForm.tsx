'use client';

import { useCallback, useMemo } from 'react';
import { CheckCircle, AlertTriangle, Wallet, TrendingUp } from 'lucide-react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import type { AccountDetail, AccountType } from '@/types';
import { useCurrenciesQuery, useUpdateAccountMutation } from '@/features/accounts/queries';
import { useNotification } from '@/context/NotificationContext';
import {
  buildAccountTypeOptions,
  buildCurrencyOptions,
  normalizeAccountFormData,
} from './accountFormUtils';

interface EditAccountFormProps {
  account: AccountDetail;
  accountTypes: AccountType[];
  loadingTypes: boolean;
  onSuccess?: () => void;
}

export default function EditAccountForm({
  account,
  accountTypes,
  loadingTypes,
  onSuccess,
}: EditAccountFormProps) {
  const { showNotification } = useNotification();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrenciesQuery();
  const updateAccountMutation = useUpdateAccountMutation(account.accountId);
  const isSubmitting = updateAccountMutation.isPending;

  const typeOptions: DropMenuOption[] = useMemo(
    () => buildAccountTypeOptions(accountTypes),
    [accountTypes]
  );

  const currencyOptions: DropMenuOption[] = useMemo(
    () => buildCurrencyOptions(currencies),
    [currencies]
  );

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Guardando...' : 'Guardar cambios',
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

      try {
        await updateAccountMutation.mutateAsync({
          name: normalized.name,
          type_id: normalized.typeId,
          currency_id: normalized.currencyId,
          balance: normalized.balance,
        });

        showNotification(
          <CheckCircle className="h-5 w-5" />,
          'success',
          'Cuenta actualizada',
          'Guardamos los cambios en tu cuenta.'
        );
        onSuccess?.();
      } catch (error) {
        console.error('Error updating account:', error);

        let message = 'No se pudo actualizar la cuenta.';

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
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Error al actualizar',
          message
        );
      }
    },
    [updateAccountMutation, showNotification, onSuccess]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="name"
          label="Nombre de la cuenta"
          defaultValue={account.name}
          required
          icon={<Wallet className="h-4 w-4" />}
        />

        <DropMenu
          name="typeId"
          label="Tipo de cuenta"
          placeholder={loadingTypes ? 'Cargando tipos...' : 'Selecciona un tipo'}
          options={typeOptions}
          required
          disabled={loadingTypes || !typeOptions.length}
          defaultValue={account.typeId}
        />

        <DropMenu
          name="currencyId"
          label="Moneda"
          placeholder={loadingCurrencies ? 'Cargando monedas...' : 'Selecciona una moneda'}
          options={currencyOptions}
          required
          disabled={loadingCurrencies || !currencyOptions.length}
          defaultValue={account.currencyId}
        />

        <Input
          name="balance"
          label="Balance"
          type="number"
          defaultValue={account.balance}
          required
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </Box>
    </FormWrapper>
  );
}

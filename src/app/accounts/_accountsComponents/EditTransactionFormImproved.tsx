'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import type { AccountTransaction } from '@/types';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { useTransactionData } from '@/context/TransactionContext';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { createOperationContext } from '@/lib/utils/errorSystem';
import {
  CUSTOM_CATEGORY_VALUE,
  normalizeTransactionFormData,
  useTransactionFormState,
} from './transactionFormUtils';

interface EditTransactionFormImprovedProps {
  accountId: string;
  transaction: AccountTransaction;
  onSuccess?: () => void;
}

export default function EditTransactionFormImproved({
  accountId,
  transaction,
  onSuccess,
}: EditTransactionFormImprovedProps) {
  const { showNotification } = useNotification();
  const { transactionTypes, categories, transactionTypesLoading, categoriesLoading } =
    useTransactionData();
  const updateTransaction = useTransactionsStore(state => state.updateTransaction);

  const { handleUpdate } = useErrorHandler({
    showSuccessOnCompletion: true,
    successMessage: 'Guardamos los cambios del movimiento.',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    selectedType,
    selectedCategory,
    isCustomCategory,
    typeOptions,
    categoryOptions,
    typeDisabled,
    categoryDisabled,
    customCategoryName,
    customCategoryDescription,
    setCustomCategoryName,
    setCustomCategoryDescription,
    handleTypeChange,
    handleCategoryChange,
  } = useTransactionFormState({
    transactionTypes,
    categories,
    transactionTypesLoading,
    categoriesLoading,
    initialTypeId: transaction.typeId ?? null,
    initialCategoryId: transaction.categoryId ?? CUSTOM_CATEGORY_VALUE,
  });

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
      const normalized = normalizeTransactionFormData({
        formData,
        selectedType,
        selectedCategory,
        customCategoryName,
        customCategoryDescription,
        showNotification,
      });

      if (!normalized) {
        return;
      }

      setIsSubmitting(true);

      const context = createOperationContext('update', 'transacción', 'la transacción');

      const result = await handleUpdate(async () => {
        const { amount, date, typeId, categoryId, category, description } = normalized;
        return updateTransaction(transaction.transactionId, {
          transactionId: transaction.transactionId,
          accountId,
          amount,
          date,
          typeId,
          categoryId,
          category,
          description,
        });
      }, 'transacción');

      setIsSubmitting(false);

      if (result) {
        onSuccess?.();
      }
    },
    [
      accountId,
      customCategoryDescription,
      customCategoryName,
      selectedCategory,
      selectedType,
      showNotification,
      transaction.transactionId,
      updateTransaction,
      onSuccess,
      handleUpdate,
    ]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="amount"
          type="number"
          step="0.01"
          label="Monto"
          defaultValue={Math.abs(transaction.amount)}
          required
          icon="fas fa-money-bill-wave"
        />

        <Input
          name="date"
          type="date"
          label="Fecha"
          defaultValue={transaction.date.slice(0, 10)}
          required
          icon="fas fa-calendar-days"
        />

        <DropMenu
          name="typeId"
          label="Tipo de transacción"
          options={typeOptions}
          required
          disabled={true}
          onValueChange={handleTypeChange}
          value={selectedType ?? undefined}
        />

        <DropMenu
          name="categoryId"
          label="Categoría"
          placeholder={categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
          options={categoryOptions}
          disabled={categoryDisabled}
          value={selectedCategory}
          onValueChange={value => {
            if (typeof value === 'string') {
              handleCategoryChange(value);
            }
          }}
        />

        {isCustomCategory && (
          <Box className="space-y-4">
            <Input
              name="customCategoryName"
              label="Nombre de la nueva categoría"
              placeholder="Ej. Suscripciones"
              required
              icon="fas fa-tag"
              value={customCategoryName}
              onValueChange={value => setCustomCategoryName(String(value))}
            />
            <Input
              name="customCategoryDescription"
              label="Descripción de la nueva categoría"
              placeholder="Detalle para recordar el uso"
              required
              icon="fas fa-align-left"
              value={customCategoryDescription}
              onValueChange={value => setCustomCategoryDescription(String(value))}
            />
          </Box>
        )}

        <Input
          name="description"
          label="Descripción del movimiento"
          defaultValue={transaction.description ?? ''}
          icon="fas fa-pen"
        />
      </Box>
    </FormWrapper>
  );
}

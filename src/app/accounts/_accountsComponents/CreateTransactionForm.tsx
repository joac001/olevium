'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { useTransactionData } from '@/context/TransactionContext';
import { normalizeTransactionFormData, useTransactionFormState } from './transactionFormUtils';

interface CreateTransactionFormProps {
  accountId: string;
  onSuccess?: () => void;
}

export default function CreateTransactionForm({
  accountId,
  onSuccess,
}: CreateTransactionFormProps) {
  const { showNotification } = useNotification();
  const { transactionTypes, categories, transactionTypesLoading, categoriesLoading } =
    useTransactionData();
  const createTransaction = useTransactionsStore(state => state.createTransaction);

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
    initialTypeId: transactionTypes[0]?.typeId ?? null,
    shouldAutofillCategory: true,
  });

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Guardando...' : 'Agregar transacción',
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
      try {
        const { amount, date, typeId, categoryId, category, description } = normalized;
        await createTransaction({
          accountId,
          amount,
          date,
          typeId,
          categoryId,
          category,
          description,
        });

        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Transacción creada',
          'Registramos el movimiento en la cuenta.'
        );

        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo crear la transacción.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al crear transacción',
          message
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      accountId,
      createTransaction,
      customCategoryDescription,
      customCategoryName,
      selectedType,
      showNotification,
      onSuccess,
      selectedCategory,
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
          placeholder="0"
          required
          icon="fas fa-money-bill-wave"
        />

        <Input name="date" type="date" label="Fecha" required icon="fas fa-calendar-days" />

        <DropMenu
          name="typeId"
          label="Tipo de transacción"
          options={typeOptions}
          required
          disabled={typeDisabled}
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
          placeholder="Detalle del movimiento"
          icon="fas fa-pen"
        />
      </Box>
    </FormWrapper>
  );
}

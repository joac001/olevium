'use client';

import { useMemo, useState, useCallback } from 'react';

import { Box, FormWrapper, Input, DropMenu } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { TransactionCategory, TransactionType } from '@/types';

interface EditCategoryFormProps {
  category: TransactionCategory;
  transactionTypes: TransactionType[];
  loadingTypes: boolean;
  onSuccess?: () => void;
}

export default function EditCategoryForm({
  category,
  transactionTypes,
  loadingTypes,
  onSuccess,
}: EditCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const updateCategory = useTransactionsStore(state => state.updateCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map(type => ({
        value: type.typeId,
        label: type.name,
      })),
    [transactionTypes]
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
      if (!category.userId) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Acción no permitida',
          'Esta categoría no se puede editar.'
        );
        return;
      }

      const descriptionValue = formData.get('description');
      const typeValue = formData.get('typeId');
      const colorValue = formData.get('color');

      if (typeof descriptionValue !== 'string' || typeof typeValue !== 'string') {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Formulario incompleto',
          'Descripción y tipo son obligatorios.'
        );
        return;
      }

      const trimmedDescription = descriptionValue.trim();
      if (!trimmedDescription) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Datos inválidos',
          'La descripción no puede estar vacía.'
        );
        return;
      }

      const typeId = Number(typeValue);
      if (!Number.isFinite(typeId)) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Tipo inválido',
          'Selecciona un tipo válido.'
        );
        return;
      }

      const color =
        typeof colorValue === 'string' && colorValue.trim().length ? colorValue.trim() : null;

      setIsSubmitting(true);

      try {
        await updateCategory({
          categoryId: category.categoryId,
          description: trimmedDescription,
          typeId,
          color,
          userId: category.userId,
        });

        const context = createOperationContext('update', 'categoría', 'la categoría');
        showSuccess('Categoría actualizada exitosamente. Cambios guardados.', context);

        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('update', 'categoría', 'la categoría');
        showError(error, context);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      category.categoryId,
      category.userId,
      showNotification,
      updateCategory,
      onSuccess,
      showError,
      showSuccess,
    ]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="description"
          label="Descripción"
          defaultValue={category.description}
          required
          icon="fas fa-tag"
        />

        <DropMenu
          name="typeId"
          label="Tipo"
          options={typeOptions}
          required
          disabled={loadingTypes || !typeOptions.length}
          defaultValue={category.typeId}
        />

        <Input
          name="color"
          label="Color (opcional)"
          defaultValue={category.color ?? ''}
          placeholder="#AABBCC"
          icon="fas fa-palette"
        />
      </Box>
    </FormWrapper>
  );
}

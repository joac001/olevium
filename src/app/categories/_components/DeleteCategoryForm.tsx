'use client';

import { useMemo, useState, useCallback } from 'react';

import { Box, FormWrapper, Typography } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { TransactionCategory } from '@/types';

interface DeleteCategoryFormProps {
  category: TransactionCategory;
  onSuccess?: () => void;
}

export default function DeleteCategoryForm({ category, onSuccess }: DeleteCategoryFormProps) {
  const deleteCategory = useTransactionsStore(state => state.deleteCategory);
  const { showNotification, showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Eliminando...' : 'Eliminar',
        htmlType: 'submit' as const,
        type: 'danger' as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      void formData;

      if (!category.userId) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Acción no permitida',
          'No puedes eliminar una categoría predefinida.'
        );
        return;
      }

      setIsSubmitting(true);
      try {
        await deleteCategory(category.categoryId);

        const context = createOperationContext('delete', 'categoría', 'la categoría');
        showSuccess('Categoría eliminada exitosamente.', context);

        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('delete', 'categoría', 'la categoría');
        showError(error, context);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      category.categoryId,
      category.userId,
      deleteCategory,
      onSuccess,
      showNotification,
      showError,
      showSuccess,
    ]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-3">
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          ¿Deseas eliminar la categoría{' '}
          <span className="font-semibold text-[color:var(--text-primary)]">
            {category.description}
          </span>
          ? Esta acción no se puede deshacer.
        </Typography>
      </Box>
    </FormWrapper>
  );
}

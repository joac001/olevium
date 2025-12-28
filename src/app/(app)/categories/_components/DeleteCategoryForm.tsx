'use client';

import { useState, useCallback, useEffect } from 'react';

import { Box, Typography, ButtonBase } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import {
  deleteCategory as apiDeleteCategory,
  getCategoryTransactionCount,
} from '@/lib/api/categories';
import type { Category } from '@/lib/types';

interface DeleteCategoryFormProps {
  category: Category;
  onSuccess?: () => void;
}

export default function DeleteCategoryForm({ category, onSuccess }: DeleteCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const count = await getCategoryTransactionCount(category.category_id);
        setTransactionCount(count);
      } catch {
        setTransactionCount(0);
      } finally {
        setLoadingCount(false);
      }
    }
    fetchCount();
  }, [category.category_id]);

  const handleDelete = useCallback(async () => {
    if (!category.user_id) {
      showNotification(
        'fa-solid fa-triangle-exclamation',
        'danger',
        'Accion no permitida',
        'No puedes eliminar una categoria predefinida.'
      );
      return;
    }

    if (transactionCount && transactionCount > 0) {
      showNotification(
        'fa-solid fa-triangle-exclamation',
        'danger',
        'Accion no permitida',
        'Esta categoria tiene transacciones asociadas. Desactivala en su lugar.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiDeleteCategory(category.category_id);
      const context = createOperationContext('delete', 'categoria', 'la categoria');
      showSuccess('Categoria eliminada permanentemente.', context);
      onSuccess?.();
    } catch (error) {
      const context = createOperationContext('delete', 'categoria', 'la categoria');
      showError(error, context);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    category.category_id,
    category.user_id,
    transactionCount,
    onSuccess,
    showNotification,
    showError,
    showSuccess,
  ]);

  const canDelete = transactionCount === 0;

  return (
    <Box className="flex flex-col gap-5">
      <Box className="space-y-3">
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          Categoria:{' '}
          <span className="font-semibold text-[color:var(--text-primary)]">
            {category.description}
          </span>
        </Typography>

        {loadingCount ? (
          <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
            Verificando uso...
          </Typography>
        ) : (
          <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
            {transactionCount === 0
              ? 'Esta categoria no tiene transacciones asociadas y puede eliminarse.'
              : `Esta categoria tiene ${transactionCount} transaccion${transactionCount === 1 ? '' : 'es'} asociada${transactionCount === 1 ? '' : 's'}. No puede eliminarse, pero puedes desactivarla.`}
          </Typography>
        )}
      </Box>

      <ButtonBase
        variant="danger"
        onClick={handleDelete}
        disabled={isSubmitting || loadingCount || !canDelete}
        className="w-full"
      >
        {isSubmitting ? 'Eliminando...' : 'Eliminar permanentemente'}
      </ButtonBase>
    </Box>
  );
}

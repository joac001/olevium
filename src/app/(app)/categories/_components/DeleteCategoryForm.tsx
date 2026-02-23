'use client';

import { useState, useCallback, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Box, Typography, ButtonBase } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import { getCategoryTransactionCount } from '@/lib/api/categories';
import { useDeleteCategoryMutation } from '@/features/categories/queries';
import type { Category } from '@/lib/types';

interface DeleteCategoryFormProps {
  category: Category;
  onSuccess?: () => void;
}

export default function DeleteCategoryForm({ category, onSuccess }: DeleteCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const deleteCategoryMutation = useDeleteCategoryMutation();
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
        <AlertTriangle className="h-5 w-5" />,
        'danger',
        'Accion no permitida',
        'No puedes eliminar una categoria predefinida.'
      );
      return;
    }

    if (transactionCount && transactionCount > 0) {
      showNotification(
        <AlertTriangle className="h-5 w-5" />,
        'danger',
        'Accion no permitida',
        'Esta categoria tiene transacciones asociadas. Desactivala en su lugar.'
      );
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(category.category_id);
      const context = createOperationContext('delete', 'categoria', 'la categoria');
      showSuccess('Categoria eliminada permanentemente.', context);
      onSuccess?.();
    } catch (error) {
      const context = createOperationContext('delete', 'categoria', 'la categoria');
      showError(error, context);
    }
  }, [
    category.category_id,
    category.user_id,
    transactionCount,
    onSuccess,
    showNotification,
    deleteCategoryMutation,
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
        disabled={deleteCategoryMutation.isPending || loadingCount || !canDelete}
        className="w-full"
      >
        {deleteCategoryMutation.isPending ? 'Eliminando...' : 'Eliminar permanentemente'}
      </ButtonBase>
    </Box>
  );
}

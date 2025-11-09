'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Typography } from '@/components/shared/ui';
import type { AccountTransaction } from '@/types';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { formatAmount, formatDate } from '@/lib/utils/parser';

interface DeleteTransactionFormProps {
  transaction: AccountTransaction;
  currency: string | null;
  onSuccess?: () => void;
}

export default function DeleteTransactionForm({
  transaction,
  currency,
  onSuccess,
}: DeleteTransactionFormProps) {
  const deleteTransaction = useTransactionsStore(state => state.deleteTransaction);
  const { showNotification } = useNotification();
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
      setIsSubmitting(true);
      try {
        await deleteTransaction(transaction.transactionId);
        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Transacción eliminada',
          'Quitamos el movimiento de la cuenta.'
        );
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo eliminar la transacción.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al eliminar',
          message
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleteTransaction, showNotification, transaction.transactionId, onSuccess]
  );

  const amountLabel = useMemo(
    () => formatAmount(transaction.amount, currency),
    [transaction.amount, currency]
  );
  const dateLabel = useMemo(() => formatDate(transaction.date, 'dd/mm/aaaa'), [transaction.date]);

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-3">
        <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
          ¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.
        </Typography>
        <Box className="rounded-2xl border border-[color:var(--surface-muted)] p-4">
          <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
            {transaction.description && transaction.description.trim().length
              ? transaction.description
              : 'Sin descripción'}
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Fecha:{' '}
            <span className="font-semibold text-[color:var(--text-primary)]">{dateLabel}</span>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Monto: <span className="font-semibold">{amountLabel}</span>
          </Typography>
        </Box>
      </Box>
    </FormWrapper>
  );
}

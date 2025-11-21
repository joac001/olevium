'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Typography } from '@/components/shared/ui';
import type { AccountTransaction } from '@/types';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
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
      setIsSubmitting(true);
      try {
        await deleteTransaction(transaction.transactionId);
        const context = createOperationContext('delete', 'transacción', 'la transacción');
        showSuccess(
          'Transacción eliminada exitosamente. Movimiento quitado de la cuenta.',
          context
        );
        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('delete', 'transacción', 'la transacción');
        showError(error, context);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      deleteTransaction,
      showNotification,
      transaction.transactionId,
      onSuccess,
      showError,
      showSuccess,
    ]
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

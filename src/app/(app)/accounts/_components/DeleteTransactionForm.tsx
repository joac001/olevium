'use client';

import { useCallback, useMemo } from 'react';

import { Box, FormWrapper, Typography } from '@/components/shared/ui';
import type { AccountTransaction } from '@/types';
import { useDeleteTransactionMutation } from '@/features/transactions/queries';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import { formatAmount, formatDate } from '@/lib/utils/parser';
import { toSignedAmount } from '@/lib/utils/transactions';

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
  const deleteTransactionMutation = useDeleteTransactionMutation();
  const { showNotification, showError, showSuccess } = useNotification();
  const isSubmitting = deleteTransactionMutation.isPending;
  const signedAmount = useMemo(
    () => toSignedAmount(transaction.amount, transaction.typeId),
    [transaction.amount, transaction.typeId]
  );

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
      try {
        await deleteTransactionMutation.mutateAsync({
          transactionId: transaction.transactionId,
          accountId: transaction.accountId,
        });
        const context = createOperationContext('delete', 'transacción', 'la transacción');
        showSuccess(
          'Transacción eliminada exitosamente. Movimiento quitado de la cuenta.',
          context
        );
        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('delete', 'transacción', 'la transacción');
        showError(error, context);
      }
    },
    [
      deleteTransactionMutation,
      showNotification,
      transaction.transactionId,
      transaction.accountId,
      onSuccess,
      showError,
      showSuccess,
    ]
  );

  const amountLabel = useMemo(() => formatAmount(signedAmount, currency), [signedAmount, currency]);
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
            <Box as="span" className="font-semibold text-[color:var(--text-primary)]">
              {dateLabel}
            </Box>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Monto:{' '}
            <Box as="span" className="font-semibold">
              {amountLabel}
            </Box>
          </Typography>
        </Box>
      </Box>
    </FormWrapper>
  );
}

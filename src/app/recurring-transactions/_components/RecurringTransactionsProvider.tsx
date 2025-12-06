'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import { useRecurringTransactionsQuery } from '@/features/recurring-transactions/queries';
import { useDeleteRecurringTransactionMutation } from '@/features/recurring-transactions/mutations';
import type { RecurringTransaction } from '@/lib/types';

const RecurringTransactionFormModal = dynamic(() => import('./RecurringTransactionFormModal'), {
  ssr: false,
  loading: () => (
    <Box className="w-full max-w-xl space-y-4 p-4">
      <Typography variant="body">Cargando formulario...</Typography>
    </Box>
  )
});

type RecurringTransactionsContextValue = {
  isLoading: boolean;
  isRefreshing: boolean;
  usingMockData: boolean;
  recurringTransactions: RecurringTransaction[];
  handleCreateRecurringTransaction: () => void;
  handleEditRecurringTransaction: (transaction: RecurringTransaction) => void;
  handleDeleteRecurringTransaction: (transaction: RecurringTransaction) => Promise<void>;
  handleRefresh: () => Promise<void>;
};

const RecurringTransactionsContext = createContext<RecurringTransactionsContextValue | null>(null);

export function useRecurringTransactionsPage() {
  const context = useContext(RecurringTransactionsContext);
  if (!context) {
    throw new Error('useRecurringTransactionsPage debe usarse dentro de RecurringTransactionsProvider');
  }
  return context;
}

export default function RecurringTransactionsProvider({ children }: { children: ReactNode }) {
  const { showModal, hideModal } = useModal();
  const { showNotification } = useNotification();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const recurringTransactionsQuery = useRecurringTransactionsQuery();
  const { refetch: refetchRecurringTransactions } = recurringTransactionsQuery;
  const recurringTransactions = recurringTransactionsQuery.data?.data ?? [];
  const isLoading = recurringTransactionsQuery.isLoading;
  const usingMockData = recurringTransactionsQuery.data?.isMock ?? false;

  const deleteMutation = useDeleteRecurringTransactionMutation();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchRecurringTransactions();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchRecurringTransactions]);

  const handleCreateRecurringTransaction = useCallback(() => {
    showModal(
      <RecurringTransactionFormModal
        mode="create"
        onCancel={hideModal}
        onCompleted={async () => {
          hideModal();
          await refetchRecurringTransactions();
          showNotification(
            'fas fa-circle-check',
            'success',
            'Transacción recurrente creada',
            'La transacción recurrente se creó correctamente.'
          );
        }}
      />
    );
  }, [hideModal, refetchRecurringTransactions, showModal, showNotification]);

  const handleEditRecurringTransaction = useCallback(
    (transaction: RecurringTransaction) => {
      showModal(
        <RecurringTransactionFormModal
          mode="edit"
          transaction={transaction}
          onCancel={hideModal}
          onCompleted={async () => {
            hideModal();
            await refetchRecurringTransactions();
            showNotification(
              'fas fa-pen-to-square',
              'success',
              'Transacción recurrente actualizada',
              'Los cambios se guardaron correctamente.'
            );
          }}
        />
      );
    },
    [hideModal, refetchRecurringTransactions, showModal, showNotification]
  );

  const handleDeleteRecurringTransaction = useCallback(
    async (transaction: RecurringTransaction) => {
      const confirmed = window.confirm(`¿Eliminar la transacción recurrente "${transaction.description}"?`);
      if (!confirmed) return;

      try {
        await deleteMutation.mutateAsync(transaction.recurring_transaction_id);
        await refetchRecurringTransactions();
        showNotification(
          'fas fa-trash-check',
          'accent',
          'Transacción recurrente eliminada',
          'La transacción recurrente se eliminó correctamente.'
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la transacción recurrente';
        showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
      }
    },
    [deleteMutation, refetchRecurringTransactions, showNotification]
  );

  const value: RecurringTransactionsContextValue = {
    isLoading,
    isRefreshing,
    usingMockData,
    recurringTransactions,
    handleCreateRecurringTransaction,
    handleEditRecurringTransaction,
    handleDeleteRecurringTransaction,
    handleRefresh,
  };

  return <RecurringTransactionsContext.Provider value={value}>{children}</RecurringTransactionsContext.Provider>;
}

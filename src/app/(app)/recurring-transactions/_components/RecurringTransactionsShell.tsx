'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode
} from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import { useDeleteRecurringTransactionMutation } from '@/features/recurring-transactions/mutations';
import { getRecurringTransactions } from '@/lib/api';
import type { RecurringTransaction, Category } from '@/lib/types';
import type { Account } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

const RecurringTransactionFormModal = dynamic(() => import('./RecurringTransactionFormModal'), {
  ssr: false,
  loading: () => (
    <Box className="w-full max-w-xl space-y-4 p-4">
      <Typography variant="body">Cargando formulario...</Typography>
    </Box>
  )
});

type RecurringTransactionsContextValue = {
  isRefreshing: boolean;
  recurringTransactions: RecurringTransaction[];
  accounts: Account[];
  categories: Category[];
  handleCreateRecurringTransaction: () => void;
  handleEditRecurringTransaction: (transaction: RecurringTransaction) => void;
  handleDeleteRecurringTransaction: (transaction: RecurringTransaction) => Promise<void>;
  handleRefresh: () => Promise<void>;
};

const RecurringTransactionsContext = createContext<RecurringTransactionsContextValue | null>(null);

export function useRecurringTransactionsPage() {
  const context = useContext(RecurringTransactionsContext);
  if (!context) {
    throw new Error('useRecurringTransactionsPage debe usarse dentro de RecurringTransactionsShell');
  }
  return context;
}

interface RecurringTransactionsShellProps {
  initialRecurringTransactions: RecurringTransaction[];
  initialAccounts: Account[];
  initialCategories: Category[];
  children: ReactNode;
}

export default function RecurringTransactionsShell({
  initialRecurringTransactions,
  initialAccounts,
  initialCategories,
  children
}: RecurringTransactionsShellProps) {
  const { showModal, hideModal } = useModal();
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(initialRecurringTransactions);
  const [accounts] = useState<Account[]>(initialAccounts);
  const [categories] = useState<Category[]>(initialCategories);

  const deleteMutation = useDeleteRecurringTransactionMutation();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      const { data } = await getRecurringTransactions();
      setRecurringTransactions(data);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const handleCreateRecurringTransaction = useCallback(() => {
    showModal(
      <RecurringTransactionFormModal
        mode="create"
        accounts={accounts}
        categories={categories}
        onCancel={hideModal}
        onCompleted={async () => {
          hideModal();
          await handleRefresh();
          showNotification(
            'fas fa-circle-check',
            'success',
            'Transacción recurrente creada',
            'La transacción recurrente se creó correctamente.'
          );
        }}
      />
    );
  }, [hideModal, handleRefresh, showModal, showNotification, accounts, categories]);

  const handleEditRecurringTransaction = useCallback(
    (transaction: RecurringTransaction) => {
      showModal(
        <RecurringTransactionFormModal
          mode="edit"
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          onCancel={hideModal}
          onCompleted={async () => {
            hideModal();
            await handleRefresh();
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
    [hideModal, handleRefresh, showModal, showNotification, accounts, categories]
  );

  const handleDeleteRecurringTransaction = useCallback(
    async (transaction: RecurringTransaction) => {
      const confirmed = window.confirm(`¿Eliminar la transacción recurrente "${transaction.description}"?`);
      if (!confirmed) return;

      try {
        await deleteMutation.mutateAsync(transaction.recurring_transaction_id);
        // Update local state
        setRecurringTransactions(prev =>
          prev.filter(t => t.recurring_transaction_id !== transaction.recurring_transaction_id)
        );
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
    [deleteMutation, showNotification]
  );

  const value: RecurringTransactionsContextValue = {
    isRefreshing,
    recurringTransactions,
    accounts,
    categories,
    handleCreateRecurringTransaction,
    handleEditRecurringTransaction,
    handleDeleteRecurringTransaction,
    handleRefresh,
  };

  return <RecurringTransactionsContext.Provider value={value}>{children}</RecurringTransactionsContext.Provider>;
}

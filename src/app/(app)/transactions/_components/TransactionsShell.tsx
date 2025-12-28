'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Box, Typography, Container } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import { useDeleteTransactionMutation } from '@/features/transactions/mutations';
import { getTransactions, getCategories } from '@/lib/api';
import type { Category, Transaction } from '@/lib/types';
import type { Account } from '@/types';
import { formatAccountName } from '@/lib/format';
import type { DateFilter, TypeFilter, TransactionsSummary as TransactionsSummaryType } from './types';
import { toSignedAmount } from '@/lib/utils/transactions';
import TransactionsHeader from './TransactionsHeader';
import TransactionsSummary from './TransactionsSummary';
import TransactionsFilters from './TransactionsFilters';
import TransactionsTable from './TransactionsTable';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

const TransactionFormModal = dynamic(() => import('./TransactionFormModal'), {
  ssr: false,
  loading: () => (
    <Box className="w-full max-w-xl space-y-4 p-4">
      <Typography variant="body">Cargando formulario...</Typography>
    </Box>
  )
});

interface TransactionsShellProps {
  initialTransactions: Transaction[];
  initialAccounts: Account[];
  initialCategories: Category[];
}

function buildAccountDictionary(accounts: Account[]): Record<string, Account> {
  return accounts.reduce<Record<string, Account>>((acc, account) => {
    acc[String(account.accountId)] = account;
    return acc;
  }, {});
}

function buildCategoryDictionary(categories: Category[]): Record<string, Category> {
  return categories.reduce<Record<string, Category>>((acc, category) => {
    acc[String(category.category_id)] = category;
    return acc;
  }, {});
}

function filterTransactions(
  transactions: Transaction[],
  typeFilter: TypeFilter,
  categoryFilter: string,
  dateFilter: DateFilter,
  searchTerm: string,
  categoryDictionary: Record<string, Category>
) {
  const now = new Date();
  const threshold = new Date(now);
  if (dateFilter === '30d') {
    threshold.setDate(now.getDate() - 30);
  } else if (dateFilter === '90d') {
    threshold.setDate(now.getDate() - 90);
  } else {
    threshold.setFullYear(now.getFullYear() - 10);
  }
  const term = searchTerm.trim().toLowerCase();

  return transactions.filter((tx) => {
    const signedAmount = toSignedAmount(tx.amount, tx.type_id);
    const isIncome = signedAmount >= 0;
    const isExpense = signedAmount < 0;
    if (typeFilter === 'income' && !isIncome) return false;
    if (typeFilter === 'expense' && !isExpense) return false;

    const categoryRecord = categoryDictionary[String(tx.category_id ?? '')];
    const categoryName =
      typeof tx.category === 'string'
        ? tx.category
        : tx.category && typeof tx.category === 'object' && 'description' in tx.category
          ? String((tx.category as any).description ?? '')
          : categoryRecord
            ? [categoryRecord.icon, categoryRecord.description].filter(Boolean).join(' ').trim()
            : '';

    if (categoryFilter !== 'all' && categoryName.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }

    if (term) {
      const haystack = `${tx.description ?? ''} ${categoryName}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    const txDate = new Date(tx.date);
    if (txDate < threshold) return false;
    return true;
  });
}

export default function TransactionsShell({
  initialTransactions,
  initialAccounts,
  initialCategories,
}: TransactionsShellProps) {
  const queryClient = useQueryClient();
  const { showModal, hideModal } = useModal();
  const { showNotification } = useNotification();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('90d');
  const [searchTerm, setSearchTerm] = useState('');

  // Usar datos iniciales del servidor
  const [transactions, setTransactions] = useState(initialTransactions);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [categories, setCategories] = useState(initialCategories);

  const deleteTransactionMutation = useDeleteTransactionMutation();

  const accountDictionary = useMemo(() => buildAccountDictionary(accounts), [accounts]);
  const categoryDictionary = useMemo(() => buildCategoryDictionary(categories), [categories]);

  const categoryOptions = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => a.description.localeCompare(b.description)),
    [categories]
  );

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(
        transactions,
        typeFilter,
        categoryFilter,
        dateFilter,
        searchTerm,
        categoryDictionary
      ),
    [transactions, typeFilter, categoryFilter, dateFilter, searchTerm, categoryDictionary]
  );

  const summary = useMemo<TransactionsSummaryType>(() => {
    const totals = filteredTransactions.reduce(
      (acc, tx) => {
        const signedAmount = toSignedAmount(tx.amount, tx.type_id);

        if (signedAmount >= 0) {
          acc.incomeTotal += Math.abs(signedAmount);
        } else {
          acc.expenseTotal += Math.abs(signedAmount);
        }
        acc.netTotal += signedAmount;
        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0, netTotal: 0 }
    );
    return {
      incomeTotal: totals.incomeTotal,
      expenseTotal: totals.expenseTotal,
      netTotal: totals.netTotal,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const clearFilters = useCallback(() => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('90d');
    setSearchTerm('');
  }, []);

  const refetchTransactions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    const { data } = await getTransactions();
    setTransactions(data);
  }, [queryClient]);

  const refetchCategories = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    const { data } = await getCategories();
    setCategories(data);
  }, [queryClient]);

  const handleCreateTransaction = useCallback(() => {
    showModal(
      <TransactionFormModal
        mode="create"
        accounts={accounts}
        categories={categories}
        onCancel={hideModal}
        onCompleted={async () => {
          hideModal();
          await Promise.all([refetchTransactions(), refetchCategories()]);
          showNotification(
            'fas fa-circle-check',
            'success',
            'Transacción creada',
            'La transacción se registró correctamente.'
          );
        }}
      />
    );
  }, [
    accounts,
    categories,
    hideModal,
    refetchCategories,
    refetchTransactions,
    showModal,
    showNotification
  ]);

  const handleEditTransaction = useCallback(
    (transaction: Transaction) => {
      showModal(
        <TransactionFormModal
          mode="edit"
          transaction={transaction}
          accounts={accounts}
          categories={categories}
          onCancel={hideModal}
          onCompleted={async () => {
            hideModal();
            await Promise.all([refetchTransactions(), refetchCategories()]);
            showNotification(
              'fas fa-pen-to-square',
              'success',
              'Transacción actualizada',
              'Los cambios se guardaron correctamente.'
            );
          }}
        />
      );
    },
    [
      accounts,
      categories,
      hideModal,
      refetchCategories,
      refetchTransactions,
      showModal,
      showNotification
    ]
  );

  const handleDeleteTransaction = useCallback(
    async (transaction: Transaction) => {
      const account = accountDictionary[transaction.account_id];
      const label = transaction.description ?? transaction.date;
      const currencyLabel =
        typeof account?.currency === 'string'
          ? account.currency
          : (account?.currency as any)?.label ?? 'ARS';
      const confirmed = window.confirm(
        `¿Eliminar la transacción "${label}" de ${account ? formatAccountName(account.name, currencyLabel) : 'la cuenta seleccionada'}?`
      );
      if (!confirmed) return;

      try {
        await deleteTransactionMutation.mutateAsync(transaction.transaction_id);
        await refetchTransactions();
        showNotification(
          'fas fa-trash-check',
          'accent',
          'Transacción eliminada',
          'El movimiento se eliminó correctamente.'
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo eliminar la transacción';
        showNotification('fas fa-triangle-exclamation', 'danger', 'Error', message);
      }
    },
    [accountDictionary, deleteTransactionMutation, refetchTransactions, showNotification]
  );

  return (
    <Container className="gap-6">
      <TransactionsHeader onCreateTransaction={handleCreateTransaction} />
      <TransactionsSummary summary={summary} />
      <TransactionsFilters
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        categories={categoryOptions}
        onTypeFilterChange={setTypeFilter}
        onCategoryFilterChange={setCategoryFilter}
        onDateFilterChange={setDateFilter}
        onSearchTermChange={setSearchTerm}
        onClearFilters={clearFilters}
      />
      <TransactionsTable
        transactions={filteredTransactions}
        accounts={accountDictionary}
        categories={categoryDictionary}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </Container>
  );
}

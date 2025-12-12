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
import { useQuery } from '@tanstack/react-query';
import { Box, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import { useTransactionsQuery } from '@/features/transactions/queries';
import { useDeleteTransactionMutation } from '@/features/transactions/mutations';
import { getAccounts, getCategories } from '@/lib/api';
import { mockAccounts, mockTransactions } from '@/lib/mockData';
import type { Account, Category, Transaction } from '@/lib/types';
import { formatAccountName } from '@/lib/format';
import type { DateFilter, TypeFilter, TransactionsSummary } from './types';
import { toSignedAmount } from '@/lib/utils/transactions';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

type TransactionsContextValue = {
  isLoading: boolean;
  usingMockData: boolean;
  filters: {
    typeFilter: TypeFilter;
    categoryFilter: string;
    dateFilter: DateFilter;
    searchTerm: string;
  };
  setTypeFilter: (value: TypeFilter) => void;
  setCategoryFilter: (value: string) => void;
  setDateFilter: (value: DateFilter) => void;
  setSearchTerm: (value: string) => void;
  clearFilters: () => void;
  accounts: Account[];
  categories: Category[];
  categoryOptions: Category[];
  accountDictionary: Record<string, Account>;
  categoryDictionary: Record<string, Category>;
  summary: TransactionsSummary;
  filteredTransactions: Transaction[];
  handleCreateTransaction: () => void;
  handleEditTransaction: (transaction: Transaction) => void;
  handleDeleteTransaction: (transaction: Transaction) => Promise<void>;
};

export function useTransactionsPage() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactionsPage debe usarse dentro de TransactionsProvider');
  }
  return context;
}

function buildAccountDictionary(accounts: Account[]): Record<string, Account> {
  return accounts.reduce<Record<string, Account>>((acc, account) => {
    acc[String(account.account_id)] = account;
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

const TransactionFormModal = dynamic(() => import('./TransactionFormModal'), {
  ssr: false,
  loading: () => (
    <Box className="w-full max-w-xl space-y-4 p-4">
      <Typography variant="body">Cargando formulario...</Typography>
    </Box>
  )
});

export default function TransactionsProvider({ children }: { children: ReactNode }) {
  const { showModal, hideModal } = useModal();
  const { showNotification } = useNotification();

  const [typeFilter, setTypeFilterState] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilterState] = useState<string>('all');
  const [dateFilter, setDateFilterState] = useState<DateFilter>('30d');
  const [searchTerm, setSearchTermState] = useState('');

  const transactionsQuery = useTransactionsQuery();
  const accountsQuery = useQuery({ queryKey: ['accounts'], queryFn: getAccounts });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { refetch: refetchTransactions } = transactionsQuery;
  const { refetch: refetchCategories } = categoriesQuery;

  const deleteTransactionMutation = useDeleteTransactionMutation();

  const transactions = transactionsQuery.data?.data ?? mockTransactions;
  const accounts = accountsQuery.data?.data ?? mockAccounts;
  const categories = categoriesQuery.data?.data ?? [];

  const isLoading =
    transactionsQuery.isLoading || accountsQuery.isLoading || categoriesQuery.isLoading;
  const usingMockData = Boolean(
    transactionsQuery.data?.isMock || accountsQuery.data?.isMock || categoriesQuery.data?.isMock
  );

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

  const summary = useMemo<TransactionsSummary>(() => {
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
    setTypeFilterState('all');
    setCategoryFilterState('all');
    setDateFilterState('30d');
    setSearchTermState('');
  }, []);

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

  const value = useMemo<TransactionsContextValue>(
    () => ({
      isLoading,
      usingMockData,
      filters: {
        typeFilter,
        categoryFilter,
        dateFilter,
        searchTerm
      },
      setTypeFilter: setTypeFilterState,
      setCategoryFilter: setCategoryFilterState,
      setDateFilter: setDateFilterState,
      setSearchTerm: setSearchTermState,
      clearFilters,
      accounts,
      categories,
      categoryOptions,
      accountDictionary,
      categoryDictionary,
      summary,
      filteredTransactions,
      handleCreateTransaction,
      handleEditTransaction,
      handleDeleteTransaction
    }),
    [
      accountDictionary,
      accounts,
      categories,
      categoryDictionary,
      categoryFilter,
      categoryOptions,
      clearFilters,
      dateFilter,
      filteredTransactions,
      handleCreateTransaction,
      handleDeleteTransaction,
      handleEditTransaction,
      isLoading,
      searchTerm,
      summary,
      typeFilter,
      usingMockData
    ]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

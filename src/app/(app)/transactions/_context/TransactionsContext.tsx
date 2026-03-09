'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Pencil, Trash2, FileDown, AlertTriangle } from 'lucide-react';
import { Box, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useNotification } from '@/context/NotificationContext';
import {
  useDeleteTransactionMutation,
  useTransactionsQuery,
} from '@/features/transactions/queries';
import { useAccountsQuery } from '@/features/accounts/queries';
import { useCategoriesQuery } from '@/features/categories/queries';
import { exportTransactionsCsv } from '@/lib/api';
import { formatAccountName } from '@/lib/format';
import type { Category, Transaction } from '@/lib/types';
import type { Account, TransactionQueryParams } from '@/types';
import type { DateFilter, TypeFilter, TransactionsSummary } from '../_components/types';

const TransactionFormModal = dynamic(() => import('../_components/TransactionFormModal'), {
  ssr: false,
  loading: () => (
    <Box className="w-full max-w-xl space-y-4 p-4">
      <Typography variant="body">Cargando formulario...</Typography>
    </Box>
  ),
});

const PAGE_SIZE = 5;
const FILTERS_KEY = 'olevium_tx_filters';

type StoredFilters = {
  typeFilter: TypeFilter;
  categoryFilter: string;
  dateFilter: DateFilter;
  searchTerm: string;
};

function readStoredFilters(): Partial<StoredFilters> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    return raw ? (JSON.parse(raw) as Partial<StoredFilters>) : {};
  } catch {
    return {};
  }
}

function writeStoredFilters(filters: StoredFilters) {
  try {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  } catch {}
}

function buildAccountDictionary(accounts: Account[]): Record<string, Account> {
  return accounts.reduce<Record<string, Account>>((acc, account) => {
    acc[String(account.accountId)] = account;
    return acc;
  }, {});
}

function dateFilterToRange(dateFilter: DateFilter): { startDate?: string; endDate?: string } {
  const now = new Date();
  if (dateFilter === '30d' || dateFilter === '90d') {
    const days = dateFilter === '30d' ? 30 : 90;
    const from = new Date(now);
    from.setDate(now.getDate() - days);
    return {
      startDate: from.toISOString().slice(0, 10),
      endDate: now.toISOString().slice(0, 10),
    };
  }
  return {};
}

type TransactionsContextValue = {
  transactions: Transaction[];
  accountDictionary: Record<string, Account>;
  categoryOptions: Category[];
  summary: TransactionsSummary;
  page: number;
  totalPages: number;
  isFetching: boolean;
  typeFilter: TypeFilter;
  categoryFilter: string;
  dateFilter: DateFilter;
  searchTerm: string;
  isExporting: boolean;
  setPage: (page: number) => void;
  setTypeFilter: (v: TypeFilter) => void;
  setCategoryFilter: (v: string) => void;
  setDateFilter: (v: DateFilter) => void;
  setSearchTerm: (v: string) => void;
  clearFilters: () => void;
  handleCreateTransaction: () => void;
  handleEditTransaction: (tx: Transaction) => void;
  handleDeleteTransaction: (tx: Transaction) => Promise<void>;
  handleExportCsv: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export function useTransactionsPage() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactionsPage debe usarse dentro de TransactionsProvider');
  }
  return context;
}

interface TransactionsProviderProps {
  initialAccounts: Account[];
  initialCategories: Category[];
  children: ReactNode;
}

export default function TransactionsProvider({
  initialAccounts,
  initialCategories,
  children,
}: TransactionsProviderProps) {
  const { showModal, hideModal } = useModal();
  const { showNotification } = useNotification();

  const [typeFilter, setTypeFilterState] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilterState] = useState<string>('all');
  const [dateFilter, setDateFilterState] = useState<DateFilter>('90d');
  const [searchTerm, setSearchTermState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPageState] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Hydrate filters from localStorage on mount (client-only)
  useEffect(() => {
    const stored = readStoredFilters();
    if (stored.typeFilter) setTypeFilterState(stored.typeFilter);
    if (stored.categoryFilter) setCategoryFilterState(stored.categoryFilter);
    if (stored.dateFilter) setDateFilterState(stored.dateFilter);
    if (stored.searchTerm !== undefined) {
      setSearchTermState(stored.searchTerm);
      setDebouncedSearch(stored.searchTerm);
    }
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    writeStoredFilters({ typeFilter, categoryFilter, dateFilter, searchTerm });
  }, [typeFilter, categoryFilter, dateFilter, searchTerm]);

  // Debounce search: only update the query value 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageState(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryParams = useMemo((): TransactionQueryParams => {
    const { startDate, endDate } = dateFilterToRange(dateFilter);
    const typeId = typeFilter === 'income' ? 2 : typeFilter === 'expense' ? 1 : undefined;
    return {
      page,
      limit: PAGE_SIZE,
      typeId,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
      startDate,
      endDate,
      search: debouncedSearch.trim() || undefined,
    };
  }, [page, typeFilter, categoryFilter, dateFilter, debouncedSearch]);

  const { data: transactionsResult, isFetching } = useTransactionsQuery(queryParams);
  const { data: accounts = initialAccounts } = useAccountsQuery({ initialData: initialAccounts });
  const { data: categories = initialCategories } = useCategoriesQuery({ initialData: initialCategories });

  const deleteTransactionMutation = useDeleteTransactionMutation();
  const accountDictionary = useMemo(() => buildAccountDictionary(accounts), [accounts]);
  const categoryOptions = useMemo(
    () => categories.slice().sort((a, b) => a.description.localeCompare(b.description)),
    [categories]
  );

  const transactions = transactionsResult?.items ?? [];
  const total = transactionsResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const summary = useMemo<TransactionsSummary>(() => {
    if (!transactionsResult?.summary) {
      return { incomeTotal: 0, expenseTotal: 0, netTotal: 0, count: 0 };
    }
    return {
      incomeTotal: transactionsResult.summary.incomeTotal,
      expenseTotal: transactionsResult.summary.expenseTotal,
      netTotal: transactionsResult.summary.netTotal,
      count: total,
    };
  }, [transactionsResult, total]);

  const setPage = useCallback((p: number) => setPageState(p), []);
  const setTypeFilter = useCallback((v: TypeFilter) => { setTypeFilterState(v); setPageState(1); }, []);
  const setCategoryFilter = useCallback((v: string) => { setCategoryFilterState(v); setPageState(1); }, []);
  const setDateFilter = useCallback((v: DateFilter) => { setDateFilterState(v); setPageState(1); }, []);
  const setSearchTerm = useCallback((v: string) => { setSearchTermState(v); }, []);
  const clearFilters = useCallback(() => {
    setTypeFilterState('all');
    setCategoryFilterState('all');
    setDateFilterState('90d');
    setSearchTermState('');
    setDebouncedSearch('');
    setPageState(1);
  }, []);

  const handleCreateTransaction = useCallback(() => {
    showModal(
      <TransactionFormModal
        mode="create"
        accounts={accounts}
        categories={categories}
        onCancel={hideModal}
        onCompleted={() => {
          hideModal();
          showNotification(<CheckCircle className="h-5 w-5" />, 'success', 'Transacción creada', 'La transacción se registró correctamente.');
        }}
      />
    );
  }, [accounts, categories, hideModal, showModal, showNotification]);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    showModal(
      <TransactionFormModal
        mode="edit"
        transaction={transaction}
        accounts={accounts}
        categories={categories}
        onCancel={hideModal}
        onCompleted={() => {
          hideModal();
          showNotification(<Pencil className="h-5 w-5" />, 'success', 'Transacción actualizada', 'Los cambios se guardaron correctamente.');
        }}
      />
    );
  }, [accounts, categories, hideModal, showModal, showNotification]);

  const handleDeleteTransaction = useCallback(async (transaction: Transaction) => {
    const account = accountDictionary[transaction.account_id];
    const label = transaction.description ?? transaction.date;
    const currencyLabel = account?.currency ?? 'ARS';
    const confirmed = window.confirm(
      `¿Eliminar la transacción "${label}" de ${account ? formatAccountName(account.name, currencyLabel) : 'la cuenta seleccionada'}?`
    );
    if (!confirmed) return;
    try {
      await deleteTransactionMutation.mutateAsync({
        transactionId: transaction.transaction_id,
        accountId: transaction.account_id,
      });
      showNotification(<Trash2 className="h-5 w-5" />, 'accent', 'Transacción eliminada', 'El movimiento se eliminó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar la transacción';
      showNotification(<AlertTriangle className="h-5 w-5" />, 'danger', 'Error', message);
    }
  }, [accountDictionary, deleteTransactionMutation, showNotification]);

  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      const { startDate, endDate } = dateFilterToRange(dateFilter);
      const blob = await exportTransactionsCsv({ startDate, endDate });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.href = url;
      link.download = `olevium-transacciones-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification(<FileDown className="h-5 w-5" />, 'success', 'Exportación iniciada', 'El archivo CSV se está descargando.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo exportar las transacciones a CSV.';
      showNotification(<AlertTriangle className="h-5 w-5" />, 'danger', 'Error al exportar', message);
    } finally {
      setIsExporting(false);
    }
  }, [dateFilter, showNotification]);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        accountDictionary,
        categoryOptions,
        summary,
        page,
        totalPages,
        isFetching,
        typeFilter,
        categoryFilter,
        dateFilter,
        searchTerm,
        isExporting,
        setPage,
        setTypeFilter,
        setCategoryFilter,
        setDateFilter,
        setSearchTerm,
        clearFilters,
        handleCreateTransaction,
        handleEditTransaction,
        handleDeleteTransaction,
        handleExportCsv,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

import type { Category, Transaction } from '@/lib/types';
import type { Account } from '@/types';

export type TypeFilter = 'all' | 'income' | 'expense';
export type DateFilter = '30d' | '90d' | 'all';

export type TransactionsSummary = {
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  count: number;
};

export type TransactionListItem = Transaction;

export type TransactionFormMode = 'create' | 'edit';

export type TransactionFormModalProps = {
  mode: TransactionFormMode;
  transaction?: Transaction;
  accounts: Account[];
  categories: Category[];
  onCompleted: (status: 'created' | 'updated') => void;
  onCancel: () => void;
};

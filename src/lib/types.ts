import type {
  ApiUserAccount,
  ApiAccountType,
  ApiCurrency,
  ApiUserTransaction,
} from '@/types';
import type { RecurringTransaction as RootRecurringTransaction } from '@/types/recurring';

export type Account = ApiUserAccount;
export type AccountType = ApiAccountType;

export type Category = {
  category_id: string;
  user_id: string | null;
  type_id: number;
  description: string;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
  is_default?: boolean;
};

export type Transaction = ApiUserTransaction & {
  account?: unknown;
  transaction_type?: unknown;
};
export type RecurringTransaction = RootRecurringTransaction;

export type TransactionType = {
  type_id: number;
  name: string;
  created_at: string;
};

export type CreateAccountPayload = {
  name: string;
  type_id: number;
  currency_id: number;
  balance?: number;
};

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export type CreateCategoryPayload = {
  description: string;
  type_id: number;
  color?: string | null;
  icon?: string | null;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type CreateTransactionPayload = {
  account_id: string;
  amount: number;
  type_id: number;
  category_id?: string;
  category?: {
    description: string;
    type_id: number;
    color?: string | null;
    icon?: string | null;
  };
  description?: string;
  date: string;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export type CreateRecurringTransactionPayload = {
  account_id: string;
  category_id?: string;
  category?: {
    description: string;
    type_id: number;
    color?: string | null;
    icon?: string | null;
  };
  type_id: number;
  amount: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval?: number;
  weekday?: number;
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  require_confirmation?: boolean;
};

export type UpdateRecurringTransactionPayload = Partial<CreateRecurringTransactionPayload> & {
  is_active?: boolean;
};

export type Currency = ApiCurrency;

// Central type barrel — all domain types live in src/types/.
// This file re-exports them under the aliases that existing consumers expect.

export type {
  ApiUserAccount as Account,
  ApiAccountType as AccountType,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '@/types';

export type {
  ApiCategory as Category,
  Transaction,
  ApiTransactionType as TransactionType,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from '@/types';

export type {
  RecurringTransaction,
  CreateRecurringTransactionPayload,
  UpdateRecurringTransactionPayload,
} from '@/types';

export type { ApiCurrency as Currency } from '@/types';

export type { FeedbackPayload } from '@/types';

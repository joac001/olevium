import type { Iso8601DateTimeString, Nullable, Ulid } from './common';
import type { ApiUserAccount } from './accounts';

export interface ApiCategoryData {
  description: string;
  type_id: number;
  color?: Nullable<string>;
  icon?: Nullable<string>;
}

export interface ApiUserTransaction {
  transaction_id: Ulid;
  user_id: Ulid;
  account_id: Ulid;
  amount: number;
  type_id: number;
  date: Iso8601DateTimeString;
  transaction_date?: Iso8601DateTimeString; // alternative field name in some API responses
  category_id: Nullable<Ulid>;
  category?: Nullable<ApiTransactionCategorySummary>;
  transaction_type?: Nullable<ApiTransactionTypeSummary>;
  type?: Nullable<ApiTransactionTypeSummary>; // alternative field name in some API responses
  type_name?: Nullable<string>;
  description?: Nullable<string>;
  created_at: Iso8601DateTimeString;
  account?: Nullable<ApiUserAccount>; // embedded account (returned by some endpoints)
}

export interface ApiTransactionType {
  type_id: number;
  name: string;
  created_at: Iso8601DateTimeString;
}

export interface ApiTransactionCategory {
  category_id: Ulid;
  user_id: Nullable<Ulid>;
  type_id: number;
  description: string;
  color: Nullable<string>;
  created_at: Iso8601DateTimeString;
  is_default: boolean;
  is_active: boolean;
  transaction_type?: Nullable<ApiTransactionTypeSummary>;
}

export interface ApiTransactionTypeSummary {
  type_id: number;
  name: string;
}

export interface ApiTransactionCategorySummary {
  category_id: Ulid;
  description: string;
  color?: Nullable<string>;
  transaction_type?: Nullable<ApiTransactionTypeSummary>;
}

export interface AccountTransaction {
  transactionId: Ulid;
  accountId: Ulid;
  amount: number;
  typeId: number;
  date: Iso8601DateTimeString;
  createdAt: Iso8601DateTimeString;
  categoryId: Nullable<Ulid>;
  category: Nullable<TransactionCategorySummary>;
  transactionType: Nullable<TransactionTypeSummary>;
  typeName: Nullable<string>;
  description: Nullable<string>;
}

export interface TransactionType {
  typeId: number;
  name: string;
  createdAt: Iso8601DateTimeString;
}

export interface TransactionTypeSummary {
  typeId: number;
  name: string;
}

export interface TransactionCategory {
  categoryId: Ulid;
  userId: Nullable<Ulid>;
  typeId: number;
  description: string;
  color: Nullable<string>;
  createdAt: Iso8601DateTimeString;
  isDefault: boolean;
  isActive: boolean;
  transactionType: Nullable<TransactionTypeSummary>;
}

export interface TransactionCategorySummary {
  categoryId: Ulid;
  description: string;
  color: Nullable<string>;
  transactionType: Nullable<TransactionTypeSummary>;
}

export interface TransactionCategoryCreateInput {
  description: string;
  typeId: number;
  color?: Nullable<string>;
}

type UserTransactionPayloadBase = {
  accountId: Ulid;
  amount: number;
  date: Iso8601DateTimeString;
  typeId: number;
  categoryId?: Nullable<Ulid>;
  category?: Nullable<ApiCategoryData>;
  description?: Nullable<string>;
};

export type UserTransactionCreateInput = UserTransactionPayloadBase;

export type UserTransactionUpdateInput = UserTransactionPayloadBase & {
  transactionId: Ulid;
};

export interface TransactionCategoryUpdateInput {
  categoryId: Ulid;
  userId: Nullable<Ulid>;
  typeId: number;
  description: string;
  color: Nullable<string>;
}

// Raw API category shape (snake_case) — used by components that work with API data directly.
// Includes icon which ApiTransactionCategory omits.
export interface ApiCategory {
  category_id: string;
  user_id: string | null;
  type_id: number;
  description: string;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
  is_default?: boolean;
  is_active?: boolean;
}

// Raw API transaction augmented with optional embedded account (snake_case).
// Used by components that consume API data before normalization.
export type Transaction = ApiUserTransaction & {
  account?: Nullable<ApiUserAccount>;
};

// API input payloads (snake_case, sent directly to backend)
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
  category?: ApiCategoryData;
  description?: string;
  date: string;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

import type { Iso8601DateTimeString, Nullable, Ulid } from "./common";

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
  category_id: Nullable<Ulid>;
  category?: Nullable<string>;
  type_name?: Nullable<string>;
  description?: Nullable<string>;
  created_at: Iso8601DateTimeString;
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
}

export interface AccountTransaction {
  transactionId: Ulid;
  accountId: Ulid;
  amount: number;
  typeId: number;
  date: Iso8601DateTimeString;
  createdAt: Iso8601DateTimeString;
  categoryId: Nullable<Ulid>;
  category: Nullable<string>;
  typeName: Nullable<string>;
  description: Nullable<string>;
}

export interface TransactionType {
  typeId: number;
  name: string;
  createdAt: Iso8601DateTimeString;
}

export interface TransactionCategory {
  categoryId: Ulid;
  userId: Nullable<Ulid>;
  typeId: number;
  description: string;
  color: Nullable<string>;
  createdAt: Iso8601DateTimeString;
  isDefault: boolean;
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

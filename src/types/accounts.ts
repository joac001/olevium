import type { CurrencyCode, Iso8601DateTimeString, Nullable, Ulid } from './common';

export interface ApiUserAccount {
  account_id: Ulid;
  user_id: Ulid;
  name: string;
  type_id: number;
  currency: Nullable<CurrencyCode>;
  balance: number;
  created_at: Iso8601DateTimeString;
  deleted: boolean;
  description?: Nullable<string>;
}

export interface ApiAccountType {
  type_id: number;
  name: string;
  created_at: Iso8601DateTimeString;
}

export interface Account {
  accountId: Ulid;
  name: string;
  typeId: number;
  currency: Nullable<CurrencyCode>;
  balance: number;
  createdAt: Iso8601DateTimeString;
  deleted: boolean;
  description?: Nullable<string>;
}

export type AccountDetail = Account;

export interface AccountType {
  typeId: number;
  name: string;
  createdAt: Iso8601DateTimeString;
}

export interface AccountCreateInput {
  name: string;
  typeId: number;
  currency: CurrencyCode;
  balance: number;
}

export interface ApiUserAccount {
  account_id: number;
  user_id: number;
  name: string;
  type_id: number;
  currency: string | null;
  balance: number;
  created_at: string;
  deleted: boolean;
  description?: string | null;
}

export interface ApiAccountType {
  type_id: number;
  name: string;
  created_at: string;
}

export interface Account {
  accountId: number;
  name: string;
  typeId: number;
  currency: string | null;
  balance: number;
  createdAt: string;
  deleted: boolean;
  description?: string | null;
}

export type AccountDetail = Account;

export interface AccountType {
  typeId: number;
  name: string;
  createdAt: string;
}

export interface AccountCreateInput {
  name: string;
  typeId: number;
  currency: string;
  balance: number;
}

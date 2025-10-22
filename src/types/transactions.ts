export interface ApiCategoryData {
  description: string;
  type_id: number;
  color?: string | null;
  icon?: string | null;
}

export interface ApiUserTransaction {
  transaction_id: number;
  user_id: number;
  account_id: number;
  amount: number;
  date: string;
  category_id: number | null;
  category?: string | null;
  description?: string | null;
  created_at: string;
}

export interface ApiTransactionType {
  type_id: number;
  name: string;
  created_at: string;
}

export interface ApiTransactionCategory {
  category_id: number;
  user_id: number | null;
  type_id: number;
  description: string;
  color?: string | null;
  created_at: string;
  is_default: boolean;
}

export interface AccountTransaction {
  transactionId: number;
  accountId: number;
  amount: number;
  date: string;
  createdAt: string;
  categoryId: number | null;
  category: string | null;
  description: string | null;
}

export interface TransactionType {
  typeId: number;
  name: string;
  createdAt: string;
}

export interface TransactionCategory {
  categoryId: number;
  userId: number | null;
  typeId: number;
  description: string;
  color?: string | null;
  createdAt: string;
  isDefault: boolean;
}

export interface UserTransactionCreateInput {
  accountId: number;
  amount: number;
  date: string;
  typeId: number;
  categoryId?: number | null;
  category?: ApiCategoryData | null;
  description?: string | null;
}

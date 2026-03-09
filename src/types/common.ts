export type Ulid = string;

export type Iso8601DateTimeString = string;

export type CurrencyCode = string;

export type Nullable<T> = T | null;

export interface TransactionSummary {
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  summary: TransactionSummary;
}

export interface TransactionQueryParams {
  page: number;
  limit: number;
  accountId?: string;
  typeId?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

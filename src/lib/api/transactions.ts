import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Transaction,
  ApiUserTransaction,
  ApiTransactionType,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  PaginatedResult,
  TransactionQueryParams,
  TransactionSummary,
} from '@/types';

type TransactionType = ApiTransactionType;

type RawSummary = { income_total: number; expense_total: number; net_total: number };

type RawDashboardStats = {
  transactions: ApiUserTransaction[];
  summary: RawSummary;
  prev_summary?: RawSummary | null;
};

type RawPaginatedResponse = {
  items: ApiUserTransaction[];
  total: number;
  summary: {
    income_total: number;
    expense_total: number;
    net_total: number;
  };
};

const normalizeTransaction = (raw: ApiUserTransaction): Transaction => {
  const typeId = Number(raw.type_id ?? 0);
  const amount = Number(raw.amount ?? 0);

  return {
    transaction_id: String(raw.transaction_id ?? ''),
    account_id: String(raw.account_id ?? ''),
    user_id: String(raw.user_id ?? ''),
    amount,
    type_id: typeId,
    category_id: raw.category_id ? String(raw.category_id) : '',
    description: raw.description ?? null,
    date: String(raw.date ?? raw.transaction_date ?? new Date().toISOString()),
    created_at: String(raw.created_at ?? new Date().toISOString()),
    category: raw.category ?? null,
    account: raw.account ?? null,
    transaction_type: raw.type ?? null,
  };
};

export async function getTransactions(
  params: TransactionQueryParams
): Promise<PaginatedResult<Transaction>> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page));
  searchParams.set('per_page', String(params.limit));
  if (params.accountId) searchParams.set('account_id', params.accountId);
  if (params.typeId !== undefined) searchParams.set('type_id', String(params.typeId));
  if (params.categoryId) searchParams.set('category_id', params.categoryId);
  if (params.startDate) searchParams.set('start_date', params.startDate);
  if (params.endDate) searchParams.set('end_date', params.endDate);
  if (params.search) searchParams.set('search', params.search);

  const response = await apiRequest(`/transactions/?${searchParams.toString()}`);
  if (!response.ok) {
    return {
      items: [],
      total: 0,
      summary: { incomeTotal: 0, expenseTotal: 0, netTotal: 0 },
    };
  }
  const raw = (await response.json()) as RawPaginatedResponse;
  const summary: TransactionSummary = {
    incomeTotal: raw.summary?.income_total ?? 0,
    expenseTotal: raw.summary?.expense_total ?? 0,
    netTotal: raw.summary?.net_total ?? 0,
  };
  return {
    items: (raw.items ?? []).map(normalizeTransaction),
    total: raw.total ?? 0,
    summary,
  };
}

export interface DashboardStats {
  transactions: Transaction[];
  summary: TransactionSummary;
  prevSummary: TransactionSummary | null;
}

export interface CategoryStat {
  categoryId: string;
  description: string;
  color: string | null;
  currentTotal: number;
  prevTotal: number;
  typeId: number;
}

const normalizeSummary = (raw?: RawSummary | null): TransactionSummary | null => {
  if (!raw) return null;
  return {
    incomeTotal: raw.income_total ?? 0,
    expenseTotal: raw.expense_total ?? 0,
    netTotal: raw.net_total ?? 0,
  };
};

export async function getDashboardStats(params?: {
  startDate?: string;
  endDate?: string;
  prevStartDate?: string;
  prevEndDate?: string;
}): Promise<DashboardStats> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('start_date', params.startDate);
  if (params?.endDate) searchParams.set('end_date', params.endDate);
  if (params?.prevStartDate) searchParams.set('prev_start_date', params.prevStartDate);
  if (params?.prevEndDate) searchParams.set('prev_end_date', params.prevEndDate);
  const query = searchParams.toString();
  const response = await apiRequest(`/transactions/dashboard${query ? `?${query}` : ''}`);
  if (!response.ok) {
    return {
      transactions: [],
      summary: { incomeTotal: 0, expenseTotal: 0, netTotal: 0 },
      prevSummary: null,
    };
  }
  const raw = (await response.json()) as RawDashboardStats;
  return {
    transactions: (raw.transactions ?? []).map(normalizeTransaction),
    summary: normalizeSummary(raw.summary) ?? { incomeTotal: 0, expenseTotal: 0, netTotal: 0 },
    prevSummary: normalizeSummary(raw.prev_summary ?? null),
  };
}

export async function getCategoryStats(params: {
  categoryIds: string[];
  startDate: string;
  endDate: string;
  prevStartDate?: string;
  prevEndDate?: string;
}): Promise<CategoryStat[]> {
  const searchParams = new URLSearchParams();
  params.categoryIds.forEach(id => searchParams.append('category_ids', id));
  searchParams.set('start_date', params.startDate);
  searchParams.set('end_date', params.endDate);
  if (params.prevStartDate) searchParams.set('prev_start_date', params.prevStartDate);
  if (params.prevEndDate) searchParams.set('prev_end_date', params.prevEndDate);
  const response = await apiRequest(`/transactions/category-stats?${searchParams.toString()}`);
  if (!response.ok) return [];
  const raw = (await response.json()) as Array<{
    category_id: string;
    description: string;
    color: string | null;
    current_total: number;
    prev_total: number;
    type_id: number;
  }>;
  return raw.map(r => ({
    categoryId: r.category_id,
    description: r.description,
    color: r.color,
    currentTotal: r.current_total,
    prevTotal: r.prev_total,
    typeId: r.type_id,
  }));
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<{ data: Transaction[] }> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  const response = await apiRequest(`/transactions/by_date_range?${params.toString()}`);
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as ApiUserTransaction[];
  return { data: raw.map(normalizeTransaction) };
}

export async function postTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const safePayload: CreateTransactionPayload = {
    ...payload,
    amount: Math.abs(payload.amount),
  };

  const response = await apiRequest('/transactions/', {
    method: 'POST',
    body: JSON.stringify([safePayload]),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la transacción (status ${response.status})`);
  }
  const body = await response.json() as { created: ApiUserTransaction[]; errors: { index: number; detail: string }[] };
  if (body.created.length === 0) {
    throw new Error(body.errors[0]?.detail ?? 'No se pudo crear la transacción');
  }
  return normalizeTransaction(body.created[0]);
}

export async function putTransaction(
  transactionId: string,
  payload: UpdateTransactionPayload
): Promise<Transaction> {
  const safePayload: UpdateTransactionPayload = {
    ...payload,
    ...(payload.amount !== undefined ? { amount: Math.abs(payload.amount) } : {}),
  };

  const response = await apiRequest(`/transactions/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify(safePayload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la transacción (status ${response.status})`);
  }
  const raw = (await response.json()) as ApiUserTransaction;
  return normalizeTransaction(raw);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const response = await apiRequest(`/transactions/${transactionId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la transacción (status ${response.status})`);
  }
}

export async function getTransactionTypes(): Promise<{ data: TransactionType[] }> {
  const response = await apiRequest('/transactions/types');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as ApiTransactionType[];
  const normalized = raw.map(item => ({
    type_id: Number(item.type_id ?? 0),
    name: String(item.name ?? 'Desconocido'),
    created_at: String(item.created_at ?? new Date().toISOString()),
  }));
  return { data: normalized };
}

export type TransactionsExportParams = {
  accountId?: string;
  startDate?: string;
  endDate?: string;
};

export async function exportTransactionsCsv(params: TransactionsExportParams): Promise<Blob> {
  const searchParams = new URLSearchParams();

  if (params.accountId) {
    searchParams.set('account_id', params.accountId);
  }
  if (params.startDate) {
    searchParams.set('start_date', params.startDate);
  }
  if (params.endDate) {
    searchParams.set('end_date', params.endDate);
  }

  const query = searchParams.toString();
  const path = `/transactions/export.csv${query ? `?${query}` : ''}`;

  const response = await apiRequest(path, {
    headers: {
      Accept: 'text/csv',
    },
  });

  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo exportar las transacciones (status ${response.status})`);
  }

  return response.blob();
}

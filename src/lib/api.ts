import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Account,
  AccountType,
  Category,
  CreateAccountPayload,
  CreateCategoryPayload,
  CreateTransactionPayload,
  FeedbackPayload,
  Transaction,
  UpdateAccountPayload,
  UpdateCategoryPayload,
  UpdateTransactionPayload,
} from '@/lib/types';
import type { RecurringTransaction } from '@/types';
import type { RecurringFrequency } from '@/types/recurring';

export type ApiCollectionResult<T> = {
  data: T;
  isMock: boolean;
};

const normalizeAccount = (raw: any): Account => ({
  account_id: String(raw.account_id),
  user_id: String(raw.user_id ?? ''),
  name: String(raw.name ?? ''),
  type_id: Number(raw.type_id ?? raw.account_type_id ?? 0),
  currency_id: Number(raw.currency_id ?? 0),
  currency: raw.currency ?? null,
  balance: Number(raw.balance ?? 0),
  created_at: String(raw.created_at ?? ''),
  deleted: Boolean(raw.deleted ?? false),
});

const normalizeCategory = (raw: any): Category => ({
  category_id: String(raw.category_id ?? raw.id ?? ''),
  user_id: raw.user_id ? String(raw.user_id) : null,
  type_id: Number(raw.type_id ?? 0),
  description: String(raw.description ?? ''),
  color: raw.color ?? null,
  icon: raw.icon ?? null,
  created_at: raw.created_at ? String(raw.created_at) : undefined,
  is_default: Boolean(raw.is_default ?? false),
});

const normalizeTransaction = (raw: any): Transaction => ({
  transaction_id: String(raw.transaction_id ?? ''),
  account_id: String(raw.account_id ?? ''),
  user_id: String(raw.user_id ?? ''),
  amount: Number(raw.amount ?? 0),
  type_id: Number(raw.type_id ?? raw.transaction_type_id ?? 0),
  category_id: raw.category_id ? String(raw.category_id) : '',
  description: raw.description ?? null,
  date: String(raw.date ?? raw.transaction_date ?? new Date().toISOString()),
  created_at: String(raw.created_at ?? new Date().toISOString()),
  category: raw.category ?? null,
  account: raw.account ?? null,
  transaction_type: raw.type ?? null,
});

export async function getAccounts(): Promise<ApiCollectionResult<Account[]>> {
  const response = await apiRequest('/accounts/');
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeAccount), isMock: false };
}

export async function getAccountTypes(): Promise<ApiCollectionResult<AccountType[]>> {
  const response = await apiRequest('/accounts/types');
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as any[];
  const normalized = raw.map(item => ({
    type_id: Number(item.type_id ?? item.account_type_id ?? 0),
    name: String(item.name ?? 'Desconocido'),
    created_at: String(item.created_at ?? item.createdAt ?? new Date().toISOString()),
  }));
  return { data: normalized, isMock: false };
}

export async function getTransactions(): Promise<ApiCollectionResult<Transaction[]>> {
  const response = await apiRequest('/transactions/');
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeTransaction), isMock: false };
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<ApiCollectionResult<Transaction[]>> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  const response = await apiRequest(`/transactions/by_date_range?${params.toString()}`);
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeTransaction), isMock: false };
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

export async function getCategories(): Promise<ApiCollectionResult<Category[]>> {
  const response = await apiRequest('/categories/');
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeCategory), isMock: false };
}

export async function postAccount(payload: CreateAccountPayload): Promise<Account> {
  const response = await apiRequest('/accounts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la cuenta (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeAccount(raw);
}

export async function putAccount(accountId: string, payload: UpdateAccountPayload): Promise<Account> {
  const response = await apiRequest(`/accounts/${accountId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la cuenta (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeAccount(raw);
}

export async function deleteAccount(accountId: string): Promise<void> {
  const response = await apiRequest(`/accounts/${accountId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la cuenta (status ${response.status})`);
  }
}

export async function postCategory(payload: CreateCategoryPayload): Promise<Category> {
  const response = await apiRequest('/categories/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function putCategory(categoryId: string, payload: UpdateCategoryPayload): Promise<Category> {
  const response = await apiRequest(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await apiRequest(`/categories/${categoryId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la categoría (status ${response.status})`);
  }
}

export async function postTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const response = await apiRequest('/transactions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la transacción (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeTransaction(raw);
}

export async function putTransaction(transactionId: string, payload: UpdateTransactionPayload): Promise<Transaction> {
  const response = await apiRequest(`/transactions/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la transacción (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeTransaction(raw);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const response = await apiRequest(`/transactions/${transactionId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la transacción (status ${response.status})`);
  }
}

export async function getRecurringTransactions(): Promise<ApiCollectionResult<RecurringTransaction[]>> {
  const response = await apiRequest('/recurring-transactions/');
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as any[];
  const normalized = raw.map(item => {
    const freqRaw = typeof item.frequency === 'string' ? item.frequency.toLowerCase() : '';
    const frequency: RecurringFrequency =
      freqRaw === 'daily' || freqRaw === 'weekly' || freqRaw === 'monthly' ? freqRaw : 'monthly';
    const weekdayValue =
      item.weekday === null || item.weekday === undefined ? null : Number(item.weekday);
    const dayOfMonthValue =
      item.day_of_month === null || item.day_of_month === undefined
        ? null
        : Number(item.day_of_month);

    return {
      recurring_transaction_id: String(item.recurring_transaction_id),
      account_id: String(item.account_id),
      category_id: item.category_id ? String(item.category_id) : null,
      type_id: Number(item.type_id ?? 0),
      amount: Number(item.amount ?? 0),
      description: item.description ?? null,
      frequency,
      interval: Number(item.interval ?? 1),
      weekday: Number.isFinite(weekdayValue) ? weekdayValue : null,
      day_of_month: Number.isFinite(dayOfMonthValue) ? dayOfMonthValue : null,
      start_date: String(item.start_date),
      end_date: item.end_date ? String(item.end_date) : null,
      next_run_date: item.next_run_date ? String(item.next_run_date) : null,
      last_run_date: item.last_run_date ? String(item.last_run_date) : null,
      require_confirmation: Boolean(item.require_confirmation ?? true),
      is_active: Boolean(item.is_active ?? true),
    };
  });
  return { data: normalized, isMock: false };
}

export async function postFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await apiRequest('/feedback/', {
    method: 'POST',
    body: JSON.stringify({
      type: payload.type,
      message: payload.message,
      page_path: payload.page_path,
      metadata: payload.metadata,
    }),
  });

  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo enviar el feedback (status ${response.status})`);
  }
}

// Presupuestos por categoría

export type CategoryBudgetSummary = {
  budget_id: string;
  category_id: string;
  category_name: string;
  year: number;
  month: number;
  amount: number;
  currency_id: number;
  currency_label: string | null;
  spent: number;
  remaining: number;
  used_percent: number;
  is_over_budget: boolean;
};

export type CategoryBudgetUpsertPayload = {
  category_id: string;
  year: number;
  month: number;
  amount: number;
  currency_id: number;
};

export async function getCategoryBudgets(
  year: number,
  month: number
): Promise<ApiCollectionResult<CategoryBudgetSummary[]>> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const response = await apiRequest(`/budgets?${params.toString()}`);
  if (!response.ok) {
    return { data: [], isMock: true };
  }
  const raw = (await response.json()) as any[];
  const normalized: CategoryBudgetSummary[] = raw.map(item => ({
    budget_id: String(item.budget_id),
    category_id: String(item.category_id),
    category_name: String(item.category_name ?? ''),
    year: Number(item.year ?? year),
    month: Number(item.month ?? month),
    amount: Number(item.amount ?? 0),
    currency_id: Number(item.currency_id ?? 0),
    currency_label: item.currency_label ?? null,
    spent: Number(item.spent ?? 0),
    remaining: Number(item.remaining ?? 0),
    used_percent: Number(item.used_percent ?? 0),
    is_over_budget: Boolean(item.is_over_budget ?? false),
  }));
  return { data: normalized, isMock: false };
}

export async function upsertCategoryBudget(payload: CategoryBudgetUpsertPayload): Promise<void> {
  const response = await apiRequest('/budgets/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo guardar el presupuesto (status ${response.status})`);
  }
}

import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Transaction,
  TransactionType,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from '@/lib/types';
import type { ApiCollectionResult } from './types';

const normalizeTransaction = (raw: any): Transaction => {
  const typeId = Number(raw.type_id ?? raw.transaction_type_id ?? 0);
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

export async function getTransactions(): Promise<ApiCollectionResult<Transaction[]>> {
  const response = await apiRequest('/transactions/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeTransaction) };
}

export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<ApiCollectionResult<Transaction[]>> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  const response = await apiRequest(`/transactions/by_date_range?${params.toString()}`);
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeTransaction) };
}

export async function postTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const safePayload: CreateTransactionPayload = {
    ...payload,
    amount: Math.abs(payload.amount),
  };

  const response = await apiRequest('/transactions/', {
    method: 'POST',
    body: JSON.stringify(safePayload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la transacción (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeTransaction(raw);
}

export async function putTransaction(transactionId: string, payload: UpdateTransactionPayload): Promise<Transaction> {
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

export async function getAccountTransactions(accountId: string): Promise<ApiCollectionResult<Transaction[]>> {
  const response = await apiRequest(`/transactions/by_account/${accountId}`);
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeTransaction) };
}

export async function getTransactionTypes(): Promise<ApiCollectionResult<TransactionType[]>> {
  const response = await apiRequest('/transactions/types');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as any[];
  const normalized = raw.map(item => ({
    type_id: Number(item.type_id ?? item.transaction_type_id ?? 0),
    name: String(item.name ?? 'Desconocido'),
    created_at: String(item.created_at ?? item.createdAt ?? new Date().toISOString()),
  }));
  return { data: normalized };
}

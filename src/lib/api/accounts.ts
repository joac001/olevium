import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Account,
  AccountType,
} from '@/types';
import type { ApiCollectionResult } from './types';

type CreateAccountPayload = {
  name: string;
  type_id: number;
  currency_id: number;
  balance?: number;
};

type UpdateAccountPayload = Partial<CreateAccountPayload>;

const normalizeAccount = (raw: any): Account => ({
  accountId: String(raw.account_id),
  name: String(raw.name ?? ''),
  typeId: Number(raw.type_id ?? raw.account_type_id ?? 0),
  currencyId: Number(raw.currency_id ?? 0),
  currency: raw.currency?.label ?? raw.currency?.name ?? null,
  balance: Number(raw.balance ?? 0),
  createdAt: String(raw.created_at ?? ''),
  deleted: Boolean(raw.deleted ?? false),
  description: raw.description ?? null,
});

export async function getAccounts(): Promise<ApiCollectionResult<Account[]>> {
  const response = await apiRequest('/accounts/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeAccount) };
}

export async function getAccountTypes(): Promise<ApiCollectionResult<AccountType[]>> {
  const response = await apiRequest('/accounts/types');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as any[];
  const normalized = raw.map(item => ({
    typeId: Number(item.type_id ?? item.account_type_id ?? 0),
    name: String(item.name ?? 'Desconocido'),
    createdAt: String(item.created_at ?? item.createdAt ?? new Date().toISOString()),
  }));
  return { data: normalized };
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

export async function getAccountDetail(accountId: string): Promise<ApiCollectionResult<Account>> {
  const response = await apiRequest(`/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener el detalle de la cuenta (status ${response.status})`);
  }
  const raw = await response.json();
  return { data: normalizeAccount(raw) };
}

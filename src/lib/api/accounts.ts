import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Account,
  AccountType,
  ApiUserAccount,
  ApiAccountType,
  ApiCurrency,
  Currency,
  CreateAccountPayload,
  UpdateAccountPayload,
} from '@/types';
import type { ApiCollectionResult } from './types';

const normalizeAccount = (raw: ApiUserAccount): Account => ({
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

const normalizeAccountType = (raw: ApiAccountType): AccountType => ({
  typeId: Number(raw.type_id ?? 0),
  name: String(raw.name ?? 'Desconocido'),
  createdAt: String(raw.created_at ?? new Date().toISOString()),
});

export async function getAccounts(): Promise<ApiCollectionResult<Account[]>> {
  const response = await apiRequest('/accounts/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as ApiUserAccount[];
  return { data: raw.map(normalizeAccount) };
}

export async function getAccountTypes(): Promise<ApiCollectionResult<AccountType[]>> {
  const response = await apiRequest('/accounts/types');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as ApiAccountType[];
  return { data: raw.map(normalizeAccountType) };
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
  const raw = (await response.json()) as ApiUserAccount;
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
  const raw = (await response.json()) as ApiUserAccount;
  return normalizeAccount(raw);
}

export async function deleteAccount(accountId: string): Promise<void> {
  const response = await apiRequest(`/accounts/${accountId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la cuenta (status ${response.status})`);
  }
}

export async function getCurrencies(): Promise<Currency[]> {
  const response = await apiRequest('/currencies/');
  if (!response.ok) {
    return [];
  }
  const raw = (await response.json()) as ApiCurrency[];
  return raw.map(item => ({
    currencyId: item.currency_id,
    label: item.label,
    name: item.name,
  }));
}

export async function getAccountDetail(accountId: string): Promise<ApiCollectionResult<Account>> {
  const response = await apiRequest(`/accounts/${accountId}`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener el detalle de la cuenta (status ${response.status})`);
  }
  const raw = (await response.json()) as ApiUserAccount;
  return { data: normalizeAccount(raw) };
}

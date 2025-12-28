'use client';

import { create } from 'zustand';

import { api } from '@/lib/http';
import type {
  Account,
  AccountDetail,
  AccountType,
  AccountCreateInput,
  ApiUserAccount,
  ApiAccountType,
  ApiCurrency,
  Currency,
} from '@/types';
import { resolveError } from '@/lib/utils/errorHandling';

interface AccountsState {
  accounts: Account[];
  accountTypes: AccountType[];
  currencies: Currency[];
  accountDetails: Record<string, AccountDetail>;
  loading: boolean;
  loadingTypes: boolean;
  loadingCurrencies: boolean;
  creating: boolean;
  fetchAccounts: () => Promise<Account[]>;
  fetchAccountTypes: () => Promise<AccountType[]>;
  fetchCurrencies: () => Promise<Currency[]>;
  getCurrencies: () => Promise<Currency[]>;
  fetchAccountDetail: (accountId: string) => Promise<AccountDetail>;
  createAccount: (input: AccountCreateInput) => Promise<Account>;
  updateAccount: (accountId: string, payload: Partial<AccountCreateInput>) => Promise<AccountDetail>;
  deleteAccount: (accountId: string) => Promise<void>;
  applyBalanceDelta: (accountId: string, delta: number) => void;
  reset: () => void;
}

const mapAccount = (payload: ApiUserAccount): Account => ({
  accountId: payload.account_id,
  name: payload.name,
  typeId: payload.type_id,
  currencyId: payload.currency_id,
  currency: payload.currency?.label ?? null,
  balance: payload.balance,
  createdAt: payload.created_at,
  deleted: payload.deleted,
  description: payload.description ?? null,
});

const mapAccountDetail = (payload: ApiUserAccount): AccountDetail => mapAccount(payload);

const mapAccountType = (payload: ApiAccountType): AccountType => ({
  typeId: payload.type_id,
  name: payload.name,
  createdAt: payload.created_at,
});

const mapCurrency = (payload: ApiCurrency): Currency => ({
  currencyId: payload.currency_id,
  label: payload.label,
  name: payload.name,
});

const ACCOUNTS_ERROR_FALLBACK = 'No se pudo completar la operación sobre cuentas.';
const CURRENCIES_ERROR_FALLBACK = 'No pudimos cargar las monedas disponibles.';

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  accountTypes: [],
  currencies: [],
  accountDetails: {},
  loading: false,
  loadingTypes: false,
  loadingCurrencies: false,
  creating: false,

  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<ApiUserAccount[]>('/accounts/');
      const mapped = data.map(mapAccount);
      set({ accounts: mapped, loading: false });
      return mapped;
    } catch (error) {
      set({ loading: false });
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  fetchAccountTypes: async () => {
    if (get().accountTypes.length) {
      return get().accountTypes;
    }

    set({ loadingTypes: true });
    try {
      const { data } = await api.get<ApiAccountType[]>('/accounts/types');
      const mapped = data.map(mapAccountType);
      set({ accountTypes: mapped, loadingTypes: false });
      return mapped;
    } catch (error) {
      set({ loadingTypes: false });
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  fetchCurrencies: async () => {
    set({ loadingCurrencies: true });
    try {
      const { data } = await api.get<ApiCurrency[]>('/currencies/');
      const mapped = data.map(mapCurrency);
      set({ currencies: mapped, loadingCurrencies: false });
      return mapped;
    } catch (error) {
      set({ loadingCurrencies: false });
      throw resolveError(error, CURRENCIES_ERROR_FALLBACK);
    }
  },

  getCurrencies: async () => {
    const cached = get().currencies;
    if (cached.length) {
      return cached;
    }
    return get().fetchCurrencies();
  },

  createAccount: async input => {
    set({ creating: true });
    try {
      const payload = {
        name: input.name,
        type_id: input.typeId,
        currency_id: input.currencyId,
        balance: input.balance,
      };

      const { data } = await api.post<ApiUserAccount>('/accounts/', payload);
      const account = mapAccount(data);
      set(prev => ({ accounts: [account, ...prev.accounts], creating: false }));
      return account;
    } catch (error) {
      set({ creating: false });
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  fetchAccountDetail: async accountId => {
    const cached = get().accountDetails[accountId];
    if (cached) {
      return cached;
    }

    try {
      const { data } = await api.get<ApiUserAccount>(`/accounts/${accountId}`);
      const detail = mapAccountDetail(data);
      set(prev => ({
        accountDetails: { ...prev.accountDetails, [accountId]: detail },
      }));
      return detail;
    } catch (error) {
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  updateAccount: async (accountId, payload) => {
    try {
      const { data } = await api.put<ApiUserAccount>(`/accounts/${accountId}`, {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.typeId !== undefined ? { type_id: payload.typeId } : {}),
        ...(payload.currencyId !== undefined ? { currency_id: payload.currencyId } : {}),
        ...(payload.balance !== undefined ? { balance: payload.balance } : {}),
      });
      const updated = mapAccountDetail(data);
      set(prev => ({
        accounts: prev.accounts.map(acc => (acc.accountId === accountId ? updated : acc)),
        accountDetails: { ...prev.accountDetails, [accountId]: updated },
      }));
      return updated;
    } catch (error) {
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  deleteAccount: async accountId => {
    try {
      await api.delete(`/accounts/${accountId}`);
      set(prev => {
        const restDetails = { ...prev.accountDetails };
        delete restDetails[accountId];

        return {
          accounts: prev.accounts.filter(acc => acc.accountId !== accountId),
          accountDetails: restDetails,
        };
      });
    } catch (error) {
      throw resolveError(error, ACCOUNTS_ERROR_FALLBACK);
    }
  },

  applyBalanceDelta: (accountId, delta) => {
    set(prev => {
      const accounts = prev.accounts.map(acc =>
        acc.accountId === accountId ? { ...acc, balance: acc.balance + delta } : acc
      );
      const detail = prev.accountDetails[accountId];
      const accountDetails = detail
        ? {
            ...prev.accountDetails,
            [accountId]: { ...detail, balance: detail.balance + delta },
          }
        : prev.accountDetails;

      return { accounts, accountDetails };
    });
  },

  reset: () =>
    set({
      accounts: [],
      accountTypes: [],
      currencies: [],
      accountDetails: {},
      loading: false,
      loadingTypes: false,
      loadingCurrencies: false,
      creating: false,
    }),
}));

'use client';

import { AxiosError } from "axios";
import { create } from "zustand";

import { http } from "@/lib/utils/axios";
import type {
  Account,
  AccountDetail,
  AccountType,
  AccountCreateInput,
  ApiUserAccount,
  ApiAccountType,
} from "@/types";

interface AccountsState {
  accounts: Account[];
  accountTypes: AccountType[];
  accountDetails: Record<string, AccountDetail>;
  loading: boolean;
  loadingTypes: boolean;
  creating: boolean;
  fetchAccounts: () => Promise<Account[]>;
  fetchAccountTypes: () => Promise<AccountType[]>;
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
  currency: payload.currency,
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

const normalizeError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { detail?: string; message?: string; error?: string } | undefined;
    const detail = payload?.detail ?? payload?.message ?? payload?.error;
    if (detail) {
      return new Error(detail);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("No se pudo completar la operación sobre cuentas.");
};

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  accountTypes: [],
  accountDetails: {},
  loading: false,
  loadingTypes: false,
  creating: false,

  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const { data } = await http.get<ApiUserAccount[]>("/accounts/");
      const mapped = data.map(mapAccount);
      set({ accounts: mapped, loading: false });
      return mapped;
    } catch (error) {
      set({ loading: false });
      throw normalizeError(error);
    }
  },

  fetchAccountTypes: async () => {
    if (get().accountTypes.length) {
      return get().accountTypes;
    }

    set({ loadingTypes: true });
    try {
      const { data } = await http.get<ApiAccountType[]>("/accounts/types");
      const mapped = data.map(mapAccountType);
      set({ accountTypes: mapped, loadingTypes: false });
      return mapped;
    } catch (error) {
      set({ loadingTypes: false });
      throw normalizeError(error);
    }
  },

  createAccount: async (input) => {
    set({ creating: true });
    try {
      const payload = {
        name: input.name,
        type_id: input.typeId,
        currency: input.currency,
        balance: input.balance,
      };

      const { data } = await http.post<ApiUserAccount>("/accounts/", payload);
      const account = mapAccount(data);
      set((prev) => ({ accounts: [account, ...prev.accounts], creating: false }));
      return account;
    } catch (error) {
      set({ creating: false });
      throw normalizeError(error);
    }
  },

  fetchAccountDetail: async (accountId) => {
    const cached = get().accountDetails[accountId];
    if (cached) {
      return cached;
    }

    try {
      const { data } = await http.get<ApiUserAccount>(`/accounts/${accountId}`);
      const detail = mapAccountDetail(data);
      set((prev) => ({
        accountDetails: { ...prev.accountDetails, [accountId]: detail },
      }));
      return detail;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  updateAccount: async (accountId, payload) => {
    try {
      const { data } = await http.put<ApiUserAccount>(`/accounts/${accountId}`, {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.typeId !== undefined ? { type_id: payload.typeId } : {}),
        ...(payload.currency ? { currency: payload.currency } : {}),
        ...(payload.balance !== undefined ? { balance: payload.balance } : {}),
      });
      const updated = mapAccountDetail(data);
      set((prev) => ({
        accounts: prev.accounts.map((acc) => (acc.accountId === accountId ? updated : acc)),
        accountDetails: { ...prev.accountDetails, [accountId]: updated },
      }));
      return updated;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  deleteAccount: async (accountId) => {
    try {
      await http.delete(`/accounts/${accountId}`);
      set((prev) => {
        const restDetails = { ...prev.accountDetails };
        delete restDetails[accountId];

        return {
          accounts: prev.accounts.filter((acc) => acc.accountId !== accountId),
          accountDetails: restDetails,
        };
      });
    } catch (error) {
      throw normalizeError(error);
    }
  },

  applyBalanceDelta: (accountId, delta) => {
    set((prev) => {
      const accounts = prev.accounts.map((acc) =>
        acc.accountId === accountId ? { ...acc, balance: acc.balance + delta } : acc,
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
      accountDetails: {},
      loading: false,
      loadingTypes: false,
      creating: false,
    }),
}));

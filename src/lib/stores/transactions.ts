'use client';

import { create } from 'zustand';

import { http } from '@/lib/utils/axios';
import type {
  AccountTransaction,
  ApiTransactionCategory,
  ApiTransactionCategorySummary,
  ApiTransactionType,
  ApiTransactionTypeSummary,
  ApiUserTransaction,
  TransactionCategory,
  TransactionCategoryCreateInput,
  TransactionCategorySummary,
  TransactionCategoryUpdateInput,
  TransactionType,
  TransactionTypeSummary,
  UserTransactionCreateInput,
  UserTransactionUpdateInput,
} from '@/types';
import { useAccountsStore } from '@/lib/stores/accounts';
import { resolveAxiosError } from '@/lib/utils/errorHandling';

const mapTransactionTypeSummary = (payload: ApiTransactionTypeSummary): TransactionTypeSummary => ({
  typeId: payload.type_id,
  name: payload.name,
});

const mapTransactionCategorySummary = (
  payload: ApiTransactionCategorySummary
): TransactionCategorySummary => ({
  categoryId: payload.category_id,
  description: payload.description,
  color: payload.color ?? null,
  transactionType: payload.transaction_type
    ? mapTransactionTypeSummary(payload.transaction_type)
    : null,
});

const mapTransaction = (payload: ApiUserTransaction): AccountTransaction => ({
  transactionId: payload.transaction_id,
  accountId: payload.account_id,
  amount: Number(payload.amount ?? 0),
  typeId: payload.type_id,
  date: payload.date,
  createdAt: payload.created_at,
  categoryId: payload.category_id ?? null,
  category: payload.category ? mapTransactionCategorySummary(payload.category) : null,
  transactionType: payload.transaction_type
    ? mapTransactionTypeSummary(payload.transaction_type)
    : null,
  typeName: payload.type_name ?? null,
  description: payload.description ?? null,
});

const mapTransactionType = (payload: ApiTransactionType): TransactionType => ({
  typeId: payload.type_id,
  name: payload.name,
  createdAt: payload.created_at,
});

const mapCategory = (payload: ApiTransactionCategory): TransactionCategory => ({
  categoryId: payload.category_id,
  userId: payload.user_id ?? null,
  typeId: payload.type_id,
  description: payload.description,
  color: payload.color ?? null,
  createdAt: payload.created_at,
  isDefault: payload.is_default,
  transactionType: payload.transaction_type
    ? mapTransactionTypeSummary(payload.transaction_type)
    : null,
});

const TRANSACTION_ERROR_FALLBACK = 'No se pudo completar la operación sobre transacciones.';

interface TransactionsState {
  accountTransactions: Record<string, AccountTransaction[]>;
  transactionTypes: TransactionType[];
  transactionTypesLoading: boolean;
  categories: TransactionCategory[];
  categoriesLoading: boolean;
  fetchAccountTransactions: (accountId: string) => Promise<AccountTransaction[]>;
  fetchTransactionTypes: () => Promise<TransactionType[]>;
  fetchCategories: () => Promise<TransactionCategory[]>;
  createTransaction: (payload: UserTransactionCreateInput) => Promise<AccountTransaction>;
  updateTransaction: (
    transactionId: string,
    payload: UserTransactionUpdateInput
  ) => Promise<AccountTransaction>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  createCategory: (payload: TransactionCategoryCreateInput) => Promise<TransactionCategory>;
  updateCategory: (payload: TransactionCategoryUpdateInput) => Promise<TransactionCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reset: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  accountTransactions: {},
  transactionTypes: [],
  transactionTypesLoading: false,
  categories: [],
  categoriesLoading: false,

  fetchAccountTransactions: async accountId => {
    // No usamos el flag global para no bloquear otros fetches; el estado de carga de tipos/categor��as se maneja aparte.
    try {
      const { data } = await http.get<ApiUserTransaction[]>(
        `/transactions/by_account/${accountId}`
      );
      const transactions = data.map(mapTransaction);
      set(prev => ({
        accountTransactions: { ...prev.accountTransactions, [accountId]: transactions },
      }));
      return transactions;
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  fetchTransactionTypes: async () => {
    const { transactionTypes, transactionTypesLoading } = get();
    if (transactionTypes.length) return transactionTypes;
    if (transactionTypesLoading) return transactionTypes;

    set({ transactionTypesLoading: true });
    try {
      const { data } = await http.get<ApiTransactionType[]>(`/transactions/types`);
      const mapped = data.map(mapTransactionType);
      set({ transactionTypes: mapped, transactionTypesLoading: false });
      return mapped;
    } catch (error) {
      set({ transactionTypesLoading: false });
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  fetchCategories: async () => {
    const { categories, categoriesLoading } = get();
    if (categories.length) return categories;
    if (categoriesLoading) return categories;

    set({ categoriesLoading: true });
    try {
      const { data } = await http.get<ApiTransactionCategory[]>(`/categories/`);
      const mapped = data.map(mapCategory);
      set({ categories: mapped, categoriesLoading: false });
      return mapped;
    } catch (error) {
      set({ categoriesLoading: false });
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  createTransaction: async ({
    accountId,
    amount,
    date,
    typeId,
    categoryId,
    category,
    description,
  }) => {
    try {
      const normalizedAmount = Math.abs(amount);
      const delta = typeId === 1 ? -normalizedAmount : normalizedAmount;
      const payload: Record<string, unknown> = {
        account_id: accountId,
        amount: normalizedAmount,
        date,
        type_id: typeId,
      };

      if (categoryId !== undefined) payload.category_id = categoryId;
      if (category !== undefined) payload.category = category;
      if (description !== undefined) payload.description = description;

      const { data } = await http.post<ApiUserTransaction>('/transactions/', payload);
      const mapped = mapTransaction(data);

      set(prev => ({
        accountTransactions: {
          ...prev.accountTransactions,
          [accountId]: [mapped, ...(prev.accountTransactions[accountId] ?? [])],
        },
      }));

      useAccountsStore.getState().applyBalanceDelta(accountId, delta);
      return mapped;
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  updateTransaction: async (transactionId, payload) => {
    const state = get();
    let previousAccountId: string | null = null;
    let previousTransaction: AccountTransaction | null = null;

    for (const [accId, txs] of Object.entries(state.accountTransactions)) {
      const found = txs.find(tx => tx.transactionId === transactionId);
      if (found) {
        previousAccountId = accId;
        previousTransaction = found;
        break;
      }
    }

    try {
      // Construir body solo con campos definidos
      const body: Record<string, unknown> = {};

      if (payload.amount !== undefined) body.amount = Math.abs(payload.amount);
      if (payload.date !== undefined) body.date = payload.date;
      if (payload.categoryId !== undefined) body.category_id = payload.categoryId;
      if (payload.accountId !== undefined) body.account_id = payload.accountId;
      if (payload.typeId !== undefined) body.type_id = payload.typeId;
      if (payload.description !== undefined) body.description = payload.description;

      const { data } = await http.put<ApiUserTransaction>(`/transactions/${transactionId}`, body);
      const mapped = mapTransaction(data);

      set(prev => {
        const accountId = mapped.accountId;
        const current = prev.accountTransactions[accountId] ?? [];
        return {
          accountTransactions: {
            ...prev.accountTransactions,
            [accountId]: current.map(tx => (tx.transactionId === transactionId ? mapped : tx)),
          },
        };
      });

      if (previousTransaction) {
        const accountsStore = useAccountsStore.getState();
        const previousDelta =
          previousTransaction.typeId === 1
            ? -previousTransaction.amount
            : previousTransaction.amount;
        const mappedDelta = mapped.typeId === 1 ? -mapped.amount : mapped.amount;

        if (previousAccountId && previousAccountId !== mapped.accountId) {
          // Revertir el delta original en la cuenta anterior y aplicar en la nueva
          accountsStore.applyBalanceDelta(previousAccountId, -previousDelta);
          accountsStore.applyBalanceDelta(mapped.accountId, mappedDelta);
        } else {
          // Mismo accountId: revertir delta anterior y aplicar nuevo delta
          const delta = mappedDelta - previousDelta;
          accountsStore.applyBalanceDelta(mapped.accountId, delta);
        }
      }

      return mapped;
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  deleteTransaction: async transactionId => {
    const state = get();
    let targetAccountId: string | null = null;
    let targetTransaction: AccountTransaction | null = null;
    for (const [accId, txs] of Object.entries(state.accountTransactions)) {
      const found = txs.find(tx => tx.transactionId === transactionId);
      if (found) {
        targetAccountId = accId;
        targetTransaction = found;
        break;
      }
    }

    try {
      await http.delete(`/transactions/${transactionId}`);
      set(prev => {
        if (!targetAccountId) {
          return prev;
        }
        const txs = prev.accountTransactions[targetAccountId] ?? [];
        return {
          accountTransactions: {
            ...prev.accountTransactions,
            [targetAccountId]: txs.filter(tx => tx.transactionId !== transactionId),
          },
        };
      });

      if (targetAccountId && targetTransaction) {
        const originalDelta =
          targetTransaction.typeId === 1
            ? -targetTransaction.amount
            : targetTransaction.amount;
        useAccountsStore.getState().applyBalanceDelta(targetAccountId, -originalDelta);
      }
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  createCategory: async ({ description, typeId, color }) => {
    try {
      const body: Record<string, unknown> = {
        description,
        type_id: typeId,
      };
      if (color !== undefined) {
        body.color = color;
      }

      const { data } = await http.post<ApiTransactionCategory>('/categories/', body);
      const mapped = mapCategory(data);
      set(prev => ({
        categories: [...prev.categories, mapped],
      }));
      return mapped;
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  updateCategory: async ({ categoryId, description, typeId, color, userId }) => {
    try {
      const body: Record<string, unknown> = {
        description,
        type_id: typeId,
        color,
        user_id: userId,
      };

      const { data } = await http.put<ApiTransactionCategory>(`/categories/${categoryId}`, body);
      const mapped = mapCategory(data);
      set(prev => ({
        categories: prev.categories.map(category =>
          category.categoryId === categoryId ? mapped : category
        ),
      }));
      return mapped;
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  deleteCategory: async categoryId => {
    try {
      await http.delete(`/categories/${categoryId}`);
      set(prev => ({
        categories: prev.categories.filter(category => category.categoryId !== categoryId),
      }));
    } catch (error) {
      throw resolveAxiosError(error, TRANSACTION_ERROR_FALLBACK);
    }
  },

  reset: () =>
    set({
      accountTransactions: {},
      transactionTypes: [],
      transactionTypesLoading: false,
      categories: [],
      categoriesLoading: false,
    }),
}));

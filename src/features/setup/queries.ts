import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccountTypes, getAccounts, getCategories, getTransactions, postAccount, postCategory, postTransaction } from '@/lib/api';
import type { CreateAccountPayload, CreateCategoryPayload, CreateTransactionPayload, UpdateAccountPayload } from '@/lib/types';

export const setupKeys = {
  accounts: ['accounts'] as const,
  accountTypes: ['accountTypes'] as const,
  categories: ['categories'] as const,
  transactions: ['transactions'] as const
};

export const useSetupAccounts = () => useQuery({ queryKey: setupKeys.accounts, queryFn: getAccounts });
export const useSetupAccountTypes = () => useQuery({ queryKey: setupKeys.accountTypes, queryFn: getAccountTypes });
export const useSetupCategories = () => useQuery({ queryKey: setupKeys.categories, queryFn: getCategories });
export const useSetupTransactions = () => useQuery({ queryKey: setupKeys.transactions, queryFn: getTransactions });

export function useSetupCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => postAccount(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: setupKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: setupKeys.accountTypes })
      ]);
    }
  });
}

export function useSetupCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => postCategory({
      description: payload.description.trim(),
      type_id: payload.type_id,
      color: payload.color?.trim() || undefined,
      icon: payload.icon?.trim() || undefined
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: setupKeys.categories });
    }
  });
}

export function useSetupCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => postTransaction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: setupKeys.transactions });
    }
  });
}

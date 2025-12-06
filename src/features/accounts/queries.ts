import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, getAccountTypes, getAccounts, postAccount, putAccount } from '@/lib/api';
import type { CreateAccountPayload, UpdateAccountPayload } from '@/lib/types';

export const accountsKeys = {
  all: ['accounts'] as const,
  list: () => [...accountsKeys.all] as const,
  types: () => ['accountTypes'] as const
};

export function useAccountsQuery() {
  return useQuery({ queryKey: accountsKeys.list(), queryFn: getAccounts });
}

export function useAccountTypesQuery() {
  return useQuery({ queryKey: accountsKeys.types(), queryFn: getAccountTypes });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => postAccount(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.types() })
      ]);
    }
  });
}

export function useUpdateAccountMutation(accountId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAccountPayload) => {
      if (!accountId) throw new Error('accountId is required');
      return putAccount(accountId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
    }
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => deleteAccount(accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
    }
  });
}

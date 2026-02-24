import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import {
  deleteTransaction,
  getAccountTransactions,
  getTransactions,
  getTransactionTypes,
  postTransaction,
  putTransaction,
} from '@/lib/api';
import { accountsKeys } from '@/features/accounts/queries';
import type { Transaction, ApiTransactionType } from '@/types';
import type { CreateTransactionPayload, UpdateTransactionPayload } from '@/lib/types';

export const transactionsKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionsKeys.all] as const,
  byAccount: (accountId: string) => [...transactionsKeys.all, accountId] as const,
  detail: (id: string) => [...transactionsKeys.all, id] as const,
};

export const transactionTypesKeys = {
  all: ['transactionTypes'] as const,
};

type TransactionsQueryOptions = Omit<UseQueryOptions<Transaction[], Error>, 'queryKey' | 'queryFn'>;
type TransactionTypesQueryOptions = Omit<UseQueryOptions<ApiTransactionType[], Error>, 'queryKey' | 'queryFn'>;

export function useTransactionsQuery(options?: TransactionsQueryOptions) {
  return useQuery<Transaction[], Error>({
    queryKey: transactionsKeys.list(),
    queryFn: () => getTransactions().then(r => r.data),
    ...options,
  });
}

export function useAccountTransactionsQuery(accountId: string, options?: TransactionsQueryOptions) {
  return useQuery<Transaction[], Error>({
    queryKey: transactionsKeys.byAccount(accountId),
    queryFn: () => getAccountTransactions(accountId).then(r => r.data),
    ...options,
  });
}

export function useTransactionTypesQuery(options?: TransactionTypesQueryOptions) {
  return useQuery<ApiTransactionType[], Error>({
    queryKey: transactionTypesKeys.all,
    queryFn: () => getTransactionTypes().then(r => r.data),
    ...options,
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => postTransaction(payload),
    onSuccess: async (_, variables) => {
      const accountId = variables.account_id;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: transactionsKeys.byAccount(accountId) }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) }),
      ]);
    },
  });
}

export function useUpdateTransactionMutation(transactionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTransactionPayload) => {
      if (!transactionId) throw new Error('transactionId is required');
      return putTransaction(transactionId, payload);
    },
    onSuccess: async (_, variables) => {
      const accountId = variables.account_id;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        ...(accountId
          ? [
              queryClient.invalidateQueries({ queryKey: transactionsKeys.byAccount(accountId) }),
              queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) }),
            ]
          : []),
      ]);
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId }: { transactionId: string; accountId: string }) =>
      deleteTransaction(transactionId),
    onSuccess: async (_, variables) => {
      const { accountId } = variables;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: transactionsKeys.byAccount(accountId) }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) }),
      ]);
    },
  });
}

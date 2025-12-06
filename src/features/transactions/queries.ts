import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteTransaction,
  getTransactions,
  postTransaction,
  putTransaction
} from '@/lib/api';
import { accountsKeys } from '@/features/accounts/queries';
import type { CreateTransactionPayload, UpdateTransactionPayload } from '@/lib/types';

export const transactionsKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionsKeys.all] as const,
  detail: (id: string) => [...transactionsKeys.all, id] as const
};

export function useTransactionsQuery() {
  return useQuery({ queryKey: transactionsKeys.list(), queryFn: getTransactions });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => postTransaction(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() })
      ]);
    }
  });
}

export function useUpdateTransactionMutation(transactionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTransactionPayload) => {
      if (!transactionId) throw new Error('transactionId is required');
      return putTransaction(transactionId, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() })
      ]);
    }
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() })
      ]);
    }
  });
}

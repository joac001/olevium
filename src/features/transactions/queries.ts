import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import {
  deleteTransaction,
  getDashboardStats,
  getCategoryStats,
  getTransactions,
  getTransactionTypes,
  postTransaction,
  putTransaction,
} from '@/lib/api';
import { accountsKeys } from '@/features/accounts/queries';
import type { ApiTransactionType, PaginatedResult, Transaction, TransactionQueryParams } from '@/types';
import type { CreateTransactionPayload, UpdateTransactionPayload } from '@/lib/types';
import type { DashboardStats, CategoryStat } from '@/lib/api';

export const transactionsKeys = {
  all: ['transactions'] as const,
  list: (params: TransactionQueryParams) => [...transactionsKeys.all, params] as const,
};

type DashboardStatsParams = {
  startDate?: string;
  endDate?: string;
  prevStartDate?: string;
  prevEndDate?: string;
};

export const dashboardStatsKeys = {
  all: ['dashboardStats'] as const,
  filtered: (params?: DashboardStatsParams) =>
    [...dashboardStatsKeys.all, params ?? {}] as const,
};

type CategoryStatsParams = {
  categoryIds: string[];
  startDate: string;
  endDate: string;
  prevStartDate?: string;
  prevEndDate?: string;
};

export const categoryStatsKeys = {
  all: ['categoryStats'] as const,
  filtered: (params: CategoryStatsParams) => [...categoryStatsKeys.all, params] as const,
};

export const transactionTypesKeys = {
  all: ['transactionTypes'] as const,
};

type TransactionsQueryOptions = Omit<
  UseQueryOptions<PaginatedResult<Transaction>, Error>,
  'queryKey' | 'queryFn'
>;
type TransactionTypesQueryOptions = Omit<
  UseQueryOptions<ApiTransactionType[], Error>,
  'queryKey' | 'queryFn'
>;

export function useTransactionsQuery(
  params: TransactionQueryParams,
  options?: TransactionsQueryOptions
) {
  return useQuery<PaginatedResult<Transaction>, Error>({
    queryKey: transactionsKeys.list(params),
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useDashboardStatsQuery(params?: DashboardStatsParams) {
  return useQuery<DashboardStats, Error>({
    queryKey: dashboardStatsKeys.filtered(params),
    queryFn: () => getDashboardStats(params),
  });
}

export function useCategoryStatsQuery(params: CategoryStatsParams | null) {
  return useQuery<CategoryStat[], Error>({
    queryKey: params ? categoryStatsKeys.filtered(params) : ['categoryStats', 'disabled'],
    queryFn: () => (params ? getCategoryStats(params) : Promise.resolve([])),
    enabled: params !== null && params.categoryIds.length > 0,
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
        queryClient.invalidateQueries({ queryKey: transactionsKeys.all }),
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
        queryClient.invalidateQueries({ queryKey: transactionsKeys.all }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        ...(accountId
          ? [queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) })]
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
        queryClient.invalidateQueries({ queryKey: transactionsKeys.all }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) }),
      ]);
    },
  });
}

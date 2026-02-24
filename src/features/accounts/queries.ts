import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import {
  deleteAccount,
  getAccountDetail,
  getAccountTypes,
  getAccounts,
  getCurrencies,
  postAccount,
  putAccount,
} from '@/lib/api';
import type { Account, AccountType, Currency } from '@/types';
import type { CreateAccountPayload, UpdateAccountPayload } from '@/lib/types';

export const accountsKeys = {
  all: ['accounts'] as const,
  list: () => [...accountsKeys.all] as const,
  detail: (id: string) => [...accountsKeys.all, id] as const,
  types: () => ['accountTypes'] as const,
};

export const currenciesKeys = {
  all: ['currencies'] as const,
};

type AccountsQueryOptions = Omit<UseQueryOptions<Account[], Error>, 'queryKey' | 'queryFn'>;
type AccountDetailQueryOptions = Omit<UseQueryOptions<Account, Error>, 'queryKey' | 'queryFn'>;
type AccountTypesQueryOptions = Omit<UseQueryOptions<AccountType[], Error>, 'queryKey' | 'queryFn'>;
type CurrenciesQueryOptions = Omit<UseQueryOptions<Currency[], Error>, 'queryKey' | 'queryFn'>;

export function useAccountsQuery(options?: AccountsQueryOptions) {
  return useQuery<Account[], Error>({
    queryKey: accountsKeys.list(),
    queryFn: () => getAccounts().then(r => r.data),
    ...options,
  });
}

export function useAccountDetailQuery(accountId: string, options?: AccountDetailQueryOptions) {
  return useQuery<Account, Error>({
    queryKey: accountsKeys.detail(accountId),
    queryFn: () => getAccountDetail(accountId).then(r => r.data),
    ...options,
  });
}

export function useAccountTypesQuery(options?: AccountTypesQueryOptions) {
  return useQuery<AccountType[], Error>({
    queryKey: accountsKeys.types(),
    queryFn: () => getAccountTypes().then(r => r.data),
    ...options,
  });
}

export function useCurrenciesQuery(options?: CurrenciesQueryOptions) {
  return useQuery<Currency[], Error>({
    queryKey: currenciesKeys.all,
    queryFn: getCurrencies,
    ...options,
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => postAccount(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
    },
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsKeys.list() }),
        ...(accountId
          ? [queryClient.invalidateQueries({ queryKey: accountsKeys.detail(accountId) })]
          : []),
      ]);
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => deleteAccount(accountId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountsKeys.list() });
    },
  });
}

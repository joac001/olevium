import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAccount, postCategory, postTransaction } from '@/lib/api';
import type { CreateAccountPayload, CreateCategoryPayload, CreateTransactionPayload } from '@/lib/types';
import { setupKeys } from '@/features/setup/queries';

export function useCreateAccountMutation() {
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

export function useCreateCategoryMutation() {
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

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => postTransaction(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: setupKeys.transactions });
    }
  });
}

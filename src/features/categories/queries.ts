import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import {
  deleteCategory,
  deactivateCategory,
  getCategories,
  postCategory,
  putCategory,
  reactivateCategory,
} from '@/lib/api';
import type { ApiCategory as Category } from '@/types';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@/lib/types';

export const categoriesKeys = {
  all: ['categories'] as const,
  list: () => [...categoriesKeys.all] as const,
};

type CategoriesQueryOptions = Omit<UseQueryOptions<Category[], Error>, 'queryKey' | 'queryFn'>;

export function useCategoriesQuery(options?: CategoriesQueryOptions) {
  return useQuery<Category[], Error>({
    queryKey: categoriesKeys.list(),
    queryFn: () => getCategories().then(r => r.data),
    ...options,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => postCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

export function useUpdateCategoryMutation(categoryId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) => {
      if (!categoryId) throw new Error('categoryId is required');
      return putCategory(categoryId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

export function useDeactivateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deactivateCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

export function useReactivateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => reactivateCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    },
  });
}

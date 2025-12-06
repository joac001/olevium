import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteCategory, getCategories, postCategory, putCategory } from '@/lib/api';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@/lib/types';

export const categoriesKeys = {
  all: ['categories'] as const,
  list: () => [...categoriesKeys.all] as const
};

export function useCategoriesQuery() {
  return useQuery({ queryKey: categoriesKeys.list(), queryFn: getCategories });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => postCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    }
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
    }
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.list() });
    }
  });
}

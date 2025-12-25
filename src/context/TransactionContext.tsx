'use client';

import type { TransactionCategory, TransactionType } from '@/types';

interface TransactionDataContextValue {
  transactionTypes: TransactionType[];
  transactionTypesLoading: boolean;
  categories: TransactionCategory[];
  categoriesLoading: boolean;
}

/**
 * DEPRECATED: This hook is deprecated and should not be used.
 * All data is now provided via SSR through Shell components.
 * This is kept only for backward compatibility with old forms.
 * Returns empty arrays to prevent fetch errors.
 */
export function useTransactionData(): TransactionDataContextValue {
  return {
    transactionTypes: [],
    transactionTypesLoading: false,
    categories: [],
    categoriesLoading: false,
  };
}

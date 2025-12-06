'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';

import { useTransactionsStore } from '@/lib/stores/transactions';
import { useAuthStore } from '@/lib/stores/auth';
import type { TransactionCategory, TransactionType } from '@/types';

interface TransactionDataContextValue {
  transactionTypes: TransactionType[];
  transactionTypesLoading: boolean;
  categories: TransactionCategory[];
  categoriesLoading: boolean;
}

const TransactionDataContext = createContext<TransactionDataContextValue | undefined>(undefined);

export function useTransactionData() {
  const context = useContext(TransactionDataContext);
  if (!context) {
    throw new Error('useTransactionData debe usarse dentro de TransactionDataProvider');
  }
  return context;
}

interface TransactionDataProviderProps {
  children: React.ReactNode;
}

export function TransactionDataProvider({ children }: TransactionDataProviderProps) {
  const transactionTypes = useTransactionsStore(state => state.transactionTypes);
  const transactionTypesLoading = useTransactionsStore(state => state.transactionTypesLoading);

  const categories = useTransactionsStore(state => state.categories);
  const categoriesLoading = useTransactionsStore(state => state.categoriesLoading);

  const fetchTransactionTypes = useTransactionsStore(state => state.fetchTransactionTypes);
  const fetchCategories = useTransactionsStore(state => state.fetchCategories);
  const authLoading = useAuthStore(state => state.loading);
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshToken = useAuthStore(state => state.refreshToken);

  useEffect(() => {
    if (transactionTypes.length || transactionTypesLoading) {
      return;
    }

    // Evitar llamadas 401 durante hidrataci��n o antes de tener tokens disponibles
    if (authLoading || (!accessToken && !refreshToken)) {
      return;
    }

    fetchTransactionTypes().catch(error => {
      console.error('Transaction types fetch failed', error);
    });
  }, [
    accessToken,
    authLoading,
    fetchTransactionTypes,
    refreshToken,
    transactionTypes.length,
    transactionTypesLoading,
  ]);

  useEffect(() => {
    if (categories.length || categoriesLoading) {
      return;
    }

    // Evitar llamadas 401 durante hidrataci��n o antes de tener tokens disponibles
    if (authLoading || (!accessToken && !refreshToken)) {
      return;
    }

    fetchCategories().catch(error => {
      console.error('Categories fetch failed', error);
    });
  }, [categories.length, categoriesLoading, fetchCategories, authLoading, accessToken, refreshToken]);

  const value = useMemo<TransactionDataContextValue>(
    () => ({
      transactionTypes,
      transactionTypesLoading,
      categories,
      categoriesLoading,
    }),
    [transactionTypes, transactionTypesLoading, categories, categoriesLoading]
  );

  return (
    <TransactionDataContext.Provider value={value}>{children}</TransactionDataContext.Provider>
  );
}

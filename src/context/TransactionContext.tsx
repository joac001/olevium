'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useTransactionsStore } from '@/lib/stores/transactions';
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
  const [transactionTypesLoading, setTransactionTypesLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const transactionTypes = useTransactionsStore(state => state.transactionTypes);
  const categories = useTransactionsStore(state => state.categories);
  const fetchTransactionTypes = useTransactionsStore(state => state.fetchTransactionTypes);
  const fetchCategories = useTransactionsStore(state => state.fetchCategories);

  useEffect(() => {
    if (transactionTypes.length) {
      return;
    }

    let active = true;
    setTransactionTypesLoading(true);
    fetchTransactionTypes()
      .catch(error => {
        if (!active) return;
        console.error('Transaction types fetch failed', error);
      })
      .finally(() => {
        if (!active) return;
        setTransactionTypesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchTransactionTypes, transactionTypes.length]);

  useEffect(() => {
    if (categories.length) {
      return;
    }

    let active = true;
    setCategoriesLoading(true);
    fetchCategories()
      .catch(error => {
        if (!active) return;
        console.error('Categories fetch failed', error);
      })
      .finally(() => {
        if (!active) return;
        setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categories.length, fetchCategories]);

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

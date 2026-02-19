import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/http';
import { normalizeRecurringTransaction } from '@/lib/api';
import type { ApiCollectionResult } from '@/lib/api';
import type { RecurringTransaction } from '@/lib/types';

export async function getRecurringTransactions(): Promise<ApiCollectionResult<RecurringTransaction[]>> {
  try {
    const response = await apiRequest('/recurring-transactions/');
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const raw = (await response.json()) as Record<string, unknown>[];
    const normalized = raw
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(normalizeRecurringTransaction);
    return { data: normalized };
  } catch (error) {
    console.warn('[olevium] error al obtener transacciones recurrentes', error);
    return { data: [] };
  }
}

export const useRecurringTransactionsQuery = () => {
  return useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: getRecurringTransactions,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/http';
import type { ApiCollectionResult } from '@/lib/api';
import type { RecurringTransaction } from '@/lib/types';
import type { RecurringFrequency } from '@/types/recurring';

async function getRecurringTransactions(): Promise<ApiCollectionResult<RecurringTransaction[]>> {
  try {
    const response = await apiRequest('/recurring-transactions/');
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const raw = (await response.json()) as unknown[];
    const normalized = raw
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => {
        const freqRaw = typeof item.frequency === 'string' ? item.frequency.toLowerCase() : '';
        const frequency: RecurringFrequency =
          freqRaw === 'daily' || freqRaw === 'weekly' || freqRaw === 'monthly'
            ? freqRaw
            : 'monthly';
        const weekday =
          item.weekday === null || item.weekday === undefined
            ? null
            : Number(item.weekday);
        const day_of_month =
          item.day_of_month === null || item.day_of_month === undefined
            ? null
            : Number(item.day_of_month);

        return {
          recurring_transaction_id: String(item.recurring_transaction_id),
          user_id: String(item.user_id ?? ''),
          account_id: String(item.account_id ?? ''),
          category_id: item.category_id ? String(item.category_id) : null,
          type_id: Number(item.type_id),
          amount: Number(item.amount),
          description: item.description ? String(item.description) : null,
          frequency,
          interval: Number(item.interval ?? 1),
          weekday: Number.isFinite(weekday) ? weekday : null,
          day_of_month: Number.isFinite(day_of_month) ? day_of_month : null,
          start_date: String(item.start_date),
          end_date: item.end_date ? String(item.end_date) : null,
          next_run_date: item.next_run_date ? String(item.next_run_date) : null,
          last_run_date: item.last_run_date ? String(item.last_run_date) : null,
          require_confirmation: Boolean(item.require_confirmation ?? true),
          is_active: Boolean(item.is_active ?? true),
        };
      });
    return { data: normalized, isMock: false };
  } catch (error) {
    console.warn('[olevium] usando transacciones recurrentes de ejemplo', error);
    return { data: [], isMock: true };
  }
}

export const useRecurringTransactionsQuery = () => {
  return useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: getRecurringTransactions,
  });
};

import { apiRequest } from '@/lib/http';
import type { RecurringTransaction } from '@/types';
import type { RecurringFrequency } from '@/types/recurring';
import type { ApiCollectionResult } from './types';

export async function getRecurringTransactions(): Promise<ApiCollectionResult<RecurringTransaction[]>> {
  const response = await apiRequest('/recurring-transactions/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as any[];
  const normalized = raw.map(item => {
    const freqRaw = typeof item.frequency === 'string' ? item.frequency.toLowerCase() : '';
    const frequency: RecurringFrequency =
      freqRaw === 'daily' || freqRaw === 'weekly' || freqRaw === 'monthly' ? freqRaw : 'monthly';
    const weekdayValue =
      item.weekday === null || item.weekday === undefined ? null : Number(item.weekday);
    const dayOfMonthValue =
      item.day_of_month === null || item.day_of_month === undefined
        ? null
        : Number(item.day_of_month);

    return {
      recurring_transaction_id: String(item.recurring_transaction_id),
      account_id: String(item.account_id),
      category_id: item.category_id ? String(item.category_id) : null,
      type_id: Number(item.type_id ?? 0),
      amount: Number(item.amount ?? 0),
      description: item.description ?? null,
      frequency,
      interval: Number(item.interval ?? 1),
      weekday: Number.isFinite(weekdayValue) ? weekdayValue : null,
      day_of_month: Number.isFinite(dayOfMonthValue) ? dayOfMonthValue : null,
      start_date: String(item.start_date),
      end_date: item.end_date ? String(item.end_date) : null,
      next_run_date: item.next_run_date ? String(item.next_run_date) : null,
      last_run_date: item.last_run_date ? String(item.last_run_date) : null,
      require_confirmation: Boolean(item.require_confirmation ?? true),
      is_active: Boolean(item.is_active ?? true),
    };
  });
  return { data: normalized };
}

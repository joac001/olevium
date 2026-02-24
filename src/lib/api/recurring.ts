import { apiRequest } from '@/lib/http';
import type { RecurringTransaction } from '@/types';
import type { RecurringFrequency } from '@/types/recurring';
import type { ApiCollectionResult } from './types';

export function normalizeRecurringTransaction(item: Record<string, unknown>): RecurringTransaction {
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
    recurringTransactionId: String(item.recurring_transaction_id),
    accountId: String(item.account_id),
    categoryId: item.category_id ? String(item.category_id) : null,
    typeId: Number(item.type_id ?? 0),
    amount: Number(item.amount ?? 0),
    description: item.description ? String(item.description) : null,
    frequency,
    interval: Number(item.interval ?? 1),
    weekday: Number.isFinite(weekdayValue) ? weekdayValue : null,
    dayOfMonth: Number.isFinite(dayOfMonthValue) ? dayOfMonthValue : null,
    startDate: String(item.start_date),
    endDate: item.end_date ? String(item.end_date) : null,
    nextRunDate: item.next_run_date ? String(item.next_run_date) : null,
    lastRunDate: item.last_run_date ? String(item.last_run_date) : null,
    requireConfirmation: Boolean(item.require_confirmation ?? true),
    isActive: Boolean(item.is_active ?? true),
  };
}

export async function getRecurringTransactions(): Promise<ApiCollectionResult<RecurringTransaction[]>> {
  const response = await apiRequest('/recurring-transactions/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as Record<string, unknown>[];
  return { data: raw.map(normalizeRecurringTransaction) };
}

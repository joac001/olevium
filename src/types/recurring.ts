export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTransaction {
  recurring_transaction_id: string;
  account_id: string;
  category_id: string | null;
  type_id: number;
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  interval: number;
  weekday: number | null;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  next_run_date: string | null;
  last_run_date: string | null;
  require_confirmation: boolean;
  is_active: boolean;
}

export interface RecurringTransactionCreate {
  account_id: string;
  category_id: string;
  type_id: number;
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  interval?: number;
  weekday?: number;
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  require_confirmation?: boolean;
}

export interface RecurringTransactionUpdate {
  account_id?: string;
  category_id?: string;
  type_id?: number;
  amount?: number;
  description?: string;
  frequency?: RecurringFrequency;
  interval?: number;
  weekday?: number;
  day_of_month?: number;
  start_date?: string;
  end_date?: string;
  require_confirmation?: boolean;
  is_active?: boolean;
}

export interface RecurringOccurrence {
  occurrence_id: string;
  recurring_transaction_id: string;
  scheduled_for: string;
  status: string;
  description: string | null;
  amount: number;
  account_id: string;
  category_id: string | null;
  type_id: number;
}

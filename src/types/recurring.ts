export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurringTransaction {
  recurringTransactionId: string;
  accountId: string;
  categoryId: string | null;
  typeId: number;
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  interval: number;
  weekday: number | null;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string | null;
  lastRunDate: string | null;
  requireConfirmation: boolean;
  isActive: boolean;
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

// API input payloads (snake_case, sent directly to backend)
export type CreateRecurringTransactionPayload = {
  account_id: string;
  category_id?: string;
  category?: {
    description: string;
    type_id: number;
    color?: string | null;
    icon?: string | null;
  };
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
};

export type UpdateRecurringTransactionPayload = Partial<CreateRecurringTransactionPayload> & {
  is_active?: boolean;
};

'use client';

import { TransactionForm } from '@/components/shared/forms';
import type { TransactionFormModalProps } from './types';

export default function TransactionFormModal({
  mode,
  transaction,
  accounts,
  categories,
  onCompleted,
  onCancel,
}: TransactionFormModalProps) {
  return (
    <TransactionForm
      mode={mode}
      transaction={transaction}
      accounts={accounts}
      categories={categories}
      withCard={true}
      onSuccess={onCompleted}
      onCancel={onCancel}
    />
  );
}

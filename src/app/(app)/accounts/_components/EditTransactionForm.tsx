'use client';

import { TransactionForm } from '@/components/shared/forms';
import type { AccountTransaction } from '@/types';

interface EditTransactionFormProps {
  accountId: string;
  transaction: AccountTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditTransactionForm({
  accountId,
  transaction,
  onSuccess,
  onCancel,
}: EditTransactionFormProps) {
  return (
    <TransactionForm
      mode="edit"
      transaction={transaction}
      fixedAccountId={accountId}
      withCard={true}
      onSuccess={() => onSuccess?.()}
      onCancel={onCancel}
    />
  );
}

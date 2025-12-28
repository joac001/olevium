'use client';

import { TransactionForm } from '@/components/shared/forms';

interface CreateTransactionFormProps {
  accountId: string;
  onSuccess?: () => void;
}

export default function CreateTransactionForm({
  accountId,
  onSuccess,
}: CreateTransactionFormProps) {
  return (
    <TransactionForm
      mode="create"
      fixedAccountId={accountId}
      withCard={false}
      onSuccess={() => onSuccess?.()}
    />
  );
}

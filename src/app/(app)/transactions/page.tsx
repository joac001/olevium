import { Suspense } from 'react';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getTransactionsPageData } from './_api';
import TransactionsShell from './_components/TransactionsShell';
import TransactionsSkeleton from './_skeletons/TransactionsSkeleton';

export default async function TransactionsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getTransactionsPageData());
  const data = await handleProtectedResult(result);

  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsShell
        initialTransactions={data.transactions}
        initialAccounts={data.accounts}
        initialCategories={data.categories}
      />
    </Suspense>
  );
}

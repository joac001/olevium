import { Suspense } from 'react';
import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getRecurringTransactionsPageData } from './_api';
import RecurringTransactionsProvider from './_context/RecurringTransactionsContext';
import RecurringTransactionsHeader from './_components/RecurringTransactionsHeader';
import RecurringTransactionsTable from './_components/RecurringTransactionsTable';
import RecurringTransactionsSkeleton from './_skeletons/RecurringTransactionsSkeleton';

export default async function RecurringTransactionsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getRecurringTransactionsPageData());
  const data = await handleProtectedResult(result);

  return (
    <Suspense fallback={<RecurringTransactionsSkeleton />}>
      <RecurringTransactionsProvider
        initialRecurringTransactions={data.recurringTransactions}
        initialAccounts={data.accounts}
        initialCategories={data.categories}
      >
        <Container className="gap-6">
          <RecurringTransactionsHeader />
          <RecurringTransactionsTable />
        </Container>
      </RecurringTransactionsProvider>
    </Suspense>
  );
}

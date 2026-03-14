import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/shared/ui';

export const metadata: Metadata = {
  title: 'Transacciones | Olevium',
};
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getTransactionsPageData } from './_api';
import TransactionsSkeleton from './_skeletons/TransactionsSkeleton';
import TransactionsProvider from './_context/TransactionsContext';
import TransactionsHeader from './_components/TransactionsHeader';
import TransactionsSummary from './_components/TransactionsSummary';
import TransactionsFilters from './_components/TransactionsFilters';
import TransactionsTable from './_components/TransactionsTable';

export default async function TransactionsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getTransactionsPageData());
  const data = await handleProtectedResult(result);

  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsProvider
        initialAccounts={data.accounts}
        initialCategories={data.categories}
      >
        <Container className="gap-6">
          <TransactionsHeader />
          <TransactionsSummary />
          <TransactionsFilters />
          <TransactionsTable />
        </Container>
      </TransactionsProvider>
    </Suspense>
  );
}

import { Suspense } from 'react';

import DashboardShell from './_components/DashboardShell';
import DashboardSkeleton from './_skeletons/DashboardSkeleton';
import { getAccounts, getTransactions } from '@/lib/api';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';

export default async function DashboardPage() {
  await requireAuth();

  const result = await withAuthProtection(async () => {
    const [accountsResult, transactionsResult] = await Promise.all([
      getAccounts(),
      getTransactions(),
    ]);
    return { accounts: accountsResult.data, transactions: transactionsResult.data };
  });

  const { accounts, transactions } = handleProtectedResult(result);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell
        initialAccounts={accounts}
        initialTransactions={transactions}
      />
    </Suspense>
  );
}

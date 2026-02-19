import { Suspense } from 'react';

import DashboardShell from './_components/DashboardShell';
import DashboardSkeleton from './_skeletons/DashboardSkeleton';
import { getDashboardPageData } from './_api';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';

export default async function DashboardPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getDashboardPageData());
  const { accounts, transactions } = await handleProtectedResult(result);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell
        initialAccounts={accounts}
        initialTransactions={transactions}
      />
    </Suspense>
  );
}

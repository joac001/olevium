import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import DashboardShell from './_components/DashboardShell';
import DashboardSkeleton from './_skeletons/DashboardSkeleton';
import { getAccounts, getTransactions } from '@/lib/api';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const [accountsResult, transactionsResult] = await Promise.all([
    getAccounts(),
    getTransactions(),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell
        initialAccounts={accountsResult.data}
        initialTransactions={transactionsResult.data}
      />
    </Suspense>
  );
}

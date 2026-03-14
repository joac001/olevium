import type { Metadata } from 'next';
import { Suspense } from 'react';

import { Container, Box } from '@/components/shared/ui';

export const metadata: Metadata = {
  title: 'Dashboard | Olevium',
};
import DashboardSkeleton from './_skeletons/DashboardSkeleton';
import { getDashboardPageData } from './_api';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import DashboardProvider from './_context/DashboardContext';
import DashboardFilters from './_components/DashboardFilters';
import DashboardStatsCards from './_components/DashboardStatsCards';
import IncomeExpenseChart from './_components/IncomeExpenseChart';
import IncomeCategoryBreakdownChart from './_components/IncomeCategoryBreakdownChart';
import CategoryBreakdownChart from './_components/CategoryBreakdownChart';
import AccountsBalanceList from './_components/AccountsBalanceList';
import RecentTransactionsList from './_components/RecentTransactionsList';

export default async function DashboardPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getDashboardPageData());
  const { accounts } = await handleProtectedResult(result);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardProvider initialAccounts={accounts}>
        <Container className="py-8 space-y-8">
          <DashboardFilters />
          <DashboardStatsCards />
          <section className="space-y-6">
            <IncomeExpenseChart />
            <Box className="grid gap-6 lg:grid-cols-2">
              <IncomeCategoryBreakdownChart />
              <CategoryBreakdownChart />
            </Box>
          </section>
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <AccountsBalanceList />
            <RecentTransactionsList />
          </section>
        </Container>
      </DashboardProvider>
    </Suspense>
  );
}

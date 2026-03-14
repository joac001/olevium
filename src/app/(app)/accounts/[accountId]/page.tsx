import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Detalle de cuenta | Olevium',
};
import { ArrowLeft } from 'lucide-react';
import { Container, Box, AppLink } from '@/components/shared/ui';
import { requireAuth, withAuthProtection, handleProtectedResult } from '@/lib/server-auth';
import AccountDetailProvider from './_context/AccountDetailContext';
import AccountInfoCard from './_components/AccountInfoCard';
import AccountTransactionsCard from './_components/AccountTransactionsCard';
import AccountDetailSkeleton from './_skeletons/AccountDetailSkeleton';
import { getAccountDetailPageData } from './_api';

interface AccountDetailPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  await requireAuth();

  const { accountId: rawAccountId } = await params;

  if (typeof rawAccountId !== 'string' || rawAccountId.trim().length === 0) {
    notFound();
  }

  const accountId = rawAccountId.trim();

  const result = await withAuthProtection(() => getAccountDetailPageData(accountId));
  const data = await handleProtectedResult(result);

  return (
    <Container className="py-10">
      <Box className="space-y-2">
        <AppLink
          href="/accounts"
          variant="unstyled"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver
        </AppLink>
        <Suspense fallback={<AccountDetailSkeleton />}>
          <AccountDetailProvider
            accountId={accountId}
            initialAccount={data.account}
            initialAccountTypes={data.accountTypes}
          >
            <Box className="flex w-full max-w-6xl flex-col gap-6">
              <AccountInfoCard />
              <AccountTransactionsCard />
            </Box>
          </AccountDetailProvider>
        </Suspense>
      </Box>
    </Container>
  );
}

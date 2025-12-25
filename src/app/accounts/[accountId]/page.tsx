import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { Container, Box, AppLink } from '@/components/shared/ui';
import AccountDetailShell from './_components/AccountDetailShell';
import { getAccountDetailPageData } from './_api';

interface AccountDetailPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const { accountId: rawAccountId } = await params;

  if (typeof rawAccountId !== 'string' || rawAccountId.trim().length === 0) {
    notFound();
  }

  const accountId = rawAccountId.trim();

  try {
    const data = await getAccountDetailPageData(accountId);

    return (
      <Container className="py-10">
        <Box className="space-y-2">
          <AppLink
            href="/accounts"
            variant="unstyled"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)]"
          >
            <i className="fas fa-arrow-left" aria-hidden />
            Volver
          </AppLink>
          <AccountDetailShell
            accountId={accountId}
            initialAccount={data.account}
            initialTransactions={data.transactions}
            initialAccountTypes={data.accountTypes}
          />
        </Box>
      </Container>
    );
  } catch (error) {
    notFound();
  }
}

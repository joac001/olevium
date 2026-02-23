import { Suspense } from 'react';
import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getAccountsPageData } from './_api';
import AccountsSkeleton from './_skeletons/AccountsSkeleton';
import AccountsProvider from './_context/AccountsContext';
import AccountsView from './_components/AccountsView';

export default async function AccountsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getAccountsPageData());
  const data = await handleProtectedResult(result);

  return (
    <Suspense fallback={<AccountsSkeleton />}>
      <AccountsProvider initialAccounts={data.accounts} initialAccountTypes={data.accountTypes}>
        <Container className="py-10">
          <AccountsView />
        </Container>
      </AccountsProvider>
    </Suspense>
  );
}

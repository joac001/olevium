import { Suspense } from 'react';
import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getAccountsPageData } from './_api';
import AccountsShell from './_components/AccountsShell';
import AccountsSkeleton from './_skeletons/AccountsSkeleton';

export default async function AccountsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getAccountsPageData());
  const data = await handleProtectedResult(result);

  return (
    <Suspense fallback={<AccountsSkeleton />}>
      <Container className="py-10">
        <AccountsShell
          initialAccounts={data.accounts as any}
          initialAccountTypes={data.accountTypes as any}
        />
      </Container>
    </Suspense>
  );
}

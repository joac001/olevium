import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container } from '@/components/shared/ui';
import { getAccountsPageData } from './_api';
import AccountsShell from './_components/AccountsShell';

export default async function AccountsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const data = await getAccountsPageData();

  return (
    <Container className="py-10">
      <AccountsShell
        initialAccounts={data.accounts as any}
        initialAccountTypes={data.accountTypes as any}
      />
    </Container>
  );
}

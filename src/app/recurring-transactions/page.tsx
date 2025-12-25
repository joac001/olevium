import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Container } from '@/components/shared/ui';
import { getRecurringTransactionsPageData } from './_api';
import RecurringTransactionsShell from './_components/RecurringTransactionsShell';
import RecurringTransactionsHeader from './_components/RecurringTransactionsHeader';
import RecurringTransactionsTable from './_components/RecurringTransactionsTable';

export default async function RecurringTransactionsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const data = await getRecurringTransactionsPageData();

  return (
    <RecurringTransactionsShell
      initialRecurringTransactions={data.recurringTransactions}
      initialAccounts={data.accounts}
      initialCategories={data.categories}
    >
      <Container className="gap-6">
        <RecurringTransactionsHeader />
        <RecurringTransactionsTable />
      </Container>
    </RecurringTransactionsShell>
  );
}

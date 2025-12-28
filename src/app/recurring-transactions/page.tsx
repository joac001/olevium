import { Container } from '@/components/shared/ui';
import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getRecurringTransactionsPageData } from './_api';
import RecurringTransactionsShell from './_components/RecurringTransactionsShell';
import RecurringTransactionsHeader from './_components/RecurringTransactionsHeader';
import RecurringTransactionsTable from './_components/RecurringTransactionsTable';

export default async function RecurringTransactionsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getRecurringTransactionsPageData());
  const data = await handleProtectedResult(result);

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

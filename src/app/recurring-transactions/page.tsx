import { Container } from '@/components/shared/ui';
import RecurringTransactionsProvider from './_components/RecurringTransactionsProvider';
import RecurringTransactionsHeader from './_components/RecurringTransactionsHeader';
import RecurringTransactionsTable from './_components/RecurringTransactionsTable';

export default function RecurringTransactionsPage() {
  return (
    <RecurringTransactionsProvider>
      <Container className="gap-6">
        <RecurringTransactionsHeader />
        <RecurringTransactionsTable />
      </Container>
    </RecurringTransactionsProvider>
  );
}

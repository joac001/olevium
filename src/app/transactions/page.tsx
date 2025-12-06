import TransactionsProvider from './_components/TransactionsProvider';
import TransactionsHeader from './_components/TransactionsHeader';
import TransactionsSummary from './_components/TransactionsSummary';
import TransactionsFilters from './_components/TransactionsFilters';
import TransactionsTable from './_components/TransactionsTable';
import { Container } from '@/components/shared/ui';

export default function TransactionsPage() {
  return (
    <TransactionsProvider>
      <Container className="gap-6">
        <TransactionsHeader />
        <TransactionsSummary />
        <TransactionsFilters />
        <TransactionsTable />
      </Container>
    </TransactionsProvider>
  );
}

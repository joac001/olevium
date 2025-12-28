import {
  requireAuth,
  withAuthProtection,
  handleProtectedResult,
} from '@/lib/server-auth';
import { getTransactionsPageData } from './_api';
import TransactionsShell from './_components/TransactionsShell';

export default async function TransactionsPage() {
  await requireAuth();

  const result = await withAuthProtection(() => getTransactionsPageData());
  const data = handleProtectedResult(result);

  return (
    <TransactionsShell
      initialTransactions={data.transactions}
      initialAccounts={data.accounts}
      initialCategories={data.categories}
    />
  );
}

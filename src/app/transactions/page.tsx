import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTransactionsPageData } from './_api';
import TransactionsShell from './_components/TransactionsShell';

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }

  const data = await getTransactionsPageData();

  return (
    <TransactionsShell
      initialTransactions={data.transactions}
      initialAccounts={data.accounts}
      initialCategories={data.categories}
    />
  );
}

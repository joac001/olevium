import { getAccounts, getTransactions } from '@/lib/api';

export async function getDashboardPageData() {
  const [accountsResult, transactionsResult] = await Promise.all([
    getAccounts(),
    getTransactions(),
  ]);

  return {
    accounts: accountsResult.data,
    transactions: transactionsResult.data,
  };
}

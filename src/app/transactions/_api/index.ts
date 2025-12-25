import { getTransactions, getAccounts, getCategories } from '@/lib/api';

export async function getTransactionsPageData() {
  const [transactionsResult, accountsResult, categoriesResult] = await Promise.all([
    getTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return {
    transactions: transactionsResult.data,
    accounts: accountsResult.data,
    categories: categoriesResult.data,
  };
}

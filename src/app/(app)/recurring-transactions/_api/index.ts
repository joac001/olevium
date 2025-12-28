import { getRecurringTransactions, getAccounts, getCategories } from '@/lib/api';

export async function getRecurringTransactionsPageData() {
  const [recurringTransactionsResult, accountsResult, categoriesResult] = await Promise.all([
    getRecurringTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return {
    recurringTransactions: recurringTransactionsResult.data,
    accounts: accountsResult.data,
    categories: categoriesResult.data,
  };
}

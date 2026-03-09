import { getAccounts, getCategories } from '@/lib/api';

export async function getTransactionsPageData() {
  const [accountsResult, categoriesResult] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  return {
    accounts: accountsResult.data,
    categories: categoriesResult.data,
  };
}

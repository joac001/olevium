import { getCategories, getTransactionTypes, getCurrentUser } from '@/lib/api';

export async function getCategoriesPageData() {
  const [categoriesResult, transactionTypesResult, userResult] = await Promise.all([
    getCategories(),
    getTransactionTypes(),
    getCurrentUser(),
  ]);

  return {
    categories: categoriesResult.data,
    transactionTypes: transactionTypesResult.data,
    user: userResult.data,
  };
}

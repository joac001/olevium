import { getAccounts, getAccountTypes } from '@/lib/api';

export async function getAccountsPageData() {
  const [accountsResult, accountTypesResult] = await Promise.all([
    getAccounts(),
    getAccountTypes(),
  ]);

  return {
    accounts: accountsResult.data,
    accountTypes: accountTypesResult.data,
  };
}

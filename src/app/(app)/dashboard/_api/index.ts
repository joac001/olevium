import { getAccounts } from '@/lib/api';

export async function getDashboardPageData() {
  const accountsResult = await getAccounts();

  return {
    accounts: accountsResult.data,
  };
}

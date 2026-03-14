import { getAccountDetail, getAccountTypes } from '@/lib/api';

export async function getAccountDetailPageData(accountId: string) {
  const [accountResult, accountTypesResult] = await Promise.all([
    getAccountDetail(accountId),
    getAccountTypes(),
  ]);

  return {
    account: accountResult.data,
    accountTypes: accountTypesResult.data,
  };
}

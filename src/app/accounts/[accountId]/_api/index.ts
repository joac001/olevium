import { getAccountDetail, getAccountTransactions, getAccountTypes } from '@/lib/api';

export async function getAccountDetailPageData(accountId: string) {
  const [accountResult, transactionsResult, accountTypesResult] = await Promise.all([
    getAccountDetail(accountId),
    getAccountTransactions(accountId),
    getAccountTypes(),
  ]);

  return {
    account: accountResult.data,
    transactions: transactionsResult.data,
    accountTypes: accountTypesResult.data,
  };
}

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { useAccountsStore } from "@/lib/stores/accounts";
import { http } from "@/lib/utils/axios";
import type { ApiUserTransaction, Account } from "@/types";

const makeAccount = (overrides: Partial<Account> = {}): Account => ({
  accountId: "acc-1" as any,
  name: "Cuenta 1",
  typeId: 1,
  currencyId: 1,
  currency: "ARS",
  balance: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  deleted: false,
  ...overrides,
});

const makeApiTransaction = (
  overrides: Partial<ApiUserTransaction> = {},
): ApiUserTransaction => ({
  transaction_id: "tx-1" as any,
  user_id: "user-1" as any,
  account_id: "acc-1" as any,
  amount: 50,
  type_id: 1,
  date: "2024-01-01T00:00:00.000Z",
  category_id: null,
  category: null,
  transaction_type: null,
  type_name: null,
  description: "Test",
  created_at: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("useTransactionsStore - balances y listas", () => {
  beforeEach(() => {
    useTransactionsStore.setState(state => ({
      ...state,
      accountTransactions: {},
      transactionTypes: [],
      transactionTypesLoading: false,
      categories: [],
      categoriesLoading: false,
    }));

    useAccountsStore.setState(state => ({
      ...state,
      accounts: [makeAccount({ accountId: "acc-1" as any, balance: 100 })],
      accountDetails: {
        "acc-1": makeAccount({ accountId: "acc-1" as any, balance: 100 }),
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createTransaction agrega la transacción a la lista por cuenta y ajusta el balance (gasto)", async () => {
    const apiTx = makeApiTransaction({
      amount: 50,
      type_id: 1,
      account_id: "acc-1" as any,
    });

    const postSpy = vi
      .spyOn(http, "post")
      .mockResolvedValue({ data: apiTx } as any);

    const created = await useTransactionsStore
      .getState()
      .createTransaction({
        accountId: "acc-1" as any,
        amount: 50,
        date: apiTx.date,
        typeId: 1,
        categoryId: null,
        category: null,
        description: apiTx.description,
      });

    const txState = useTransactionsStore.getState();
    const list = txState.accountTransactions["acc-1"];

    expect(postSpy).toHaveBeenCalledWith(
      "/transactions/",
      expect.objectContaining({
        account_id: "acc-1",
        amount: 50,
        type_id: 1,
      }),
    );

    expect(list).toBeDefined();
    expect(list).toHaveLength(1);
    expect(list?.[0].transactionId).toBe(apiTx.transaction_id);
    expect(created.accountId).toBe("acc-1");

    const account = useAccountsStore
      .getState()
      .accounts.find(a => a.accountId === "acc-1");
    const detail = useAccountsStore.getState().accountDetails["acc-1"];

    // typeId === 1 => gasto => se resta el monto
    expect(account?.balance).toBe(50);
    expect(detail?.balance).toBe(50);
  });
});


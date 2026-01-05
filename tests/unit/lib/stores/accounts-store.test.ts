import { beforeEach, describe, expect, it } from "vitest";
import { useAccountsStore } from "@/lib/stores/accounts";
import type { Account, AccountDetail } from "@/types";

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

const makeAccountDetail = (overrides: Partial<AccountDetail> = {}): AccountDetail =>
  makeAccount(overrides);

describe("useAccountsStore - balances y listas", () => {
  beforeEach(() => {
    useAccountsStore.setState(state => ({
      ...state,
      accounts: [],
      accountDetails: {},
    }));
  });

  it("applyBalanceDelta actualiza balance en accounts y accountDetails", () => {
    useAccountsStore.setState(state => ({
      ...state,
      accounts: [
        makeAccount({ accountId: "acc-1" as any, balance: 100 }),
        makeAccount({ accountId: "acc-2" as any, balance: 50 }),
      ],
      accountDetails: {
        "acc-1": makeAccountDetail({ accountId: "acc-1" as any, balance: 100 }),
      },
    }));

    useAccountsStore.getState().applyBalanceDelta("acc-1" as any, 25);

    const { accounts, accountDetails } = useAccountsStore.getState();

    const acc1 = accounts.find(a => a.accountId === "acc-1");
    const acc2 = accounts.find(a => a.accountId === "acc-2");

    expect(acc1?.balance).toBe(125);
    expect(acc2?.balance).toBe(50);
    expect(accountDetails["acc-1"]?.balance).toBe(125);
  });

  it("applyBalanceDelta funciona aunque no haya accountDetails para la cuenta", () => {
    useAccountsStore.setState(state => ({
      ...state,
      accounts: [makeAccount({ accountId: "acc-1" as any, balance: 10 })],
      accountDetails: {},
    }));

    useAccountsStore.getState().applyBalanceDelta("acc-1" as any, -5);

    const { accounts, accountDetails } = useAccountsStore.getState();
    expect(accounts[0]?.balance).toBe(5);
    expect(accountDetails["acc-1"]).toBeUndefined();
  });
});


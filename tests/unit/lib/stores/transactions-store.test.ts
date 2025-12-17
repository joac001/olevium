import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { useAccountsStore } from "@/lib/stores/accounts";
import { http } from "@/lib/utils/axios";
import type {
  ApiTransactionCategory,
  ApiUserTransaction,
  Account,
  TransactionCategory,
} from "@/types";

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

const makeApiCategory = (
  overrides: Partial<ApiTransactionCategory> = {},
): ApiTransactionCategory => ({
  category_id: "cat-1" as any,
  user_id: "user-1" as any,
  type_id: 1,
  description: "Comida",
  color: "#FF0000",
  created_at: "2024-01-01T00:00:00.000Z",
  is_default: false,
  transaction_type: null,
  ...overrides,
});

const makeCategory = (overrides: Partial<TransactionCategory> = {}): TransactionCategory => ({
  categoryId: "cat-1" as any,
  userId: "user-1" as any,
  typeId: 1,
  description: "Comida",
  color: "#FF0000",
  createdAt: "2024-01-01T00:00:00.000Z",
  isDefault: false,
  transactionType: null,
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

  it("createCategory agrega una categoría al listado", async () => {
    const apiCat = makeApiCategory({
      category_id: "cat-1" as any,
      description: "Comida",
      type_id: 1,
      color: "#00FF00",
    });

    const postSpy = vi
      .spyOn(http, "post")
      .mockResolvedValue({ data: apiCat } as any);

    const created = await useTransactionsStore.getState().createCategory({
      description: "Comida",
      typeId: 1,
      color: "#00FF00",
    });

    const { categories } = useTransactionsStore.getState();

    expect(postSpy).toHaveBeenCalledWith(
      "/categories/",
      expect.objectContaining({
        description: "Comida",
        type_id: 1,
        color: "#00FF00",
      }),
    );

    expect(categories).toHaveLength(1);
    expect(created.description).toBe("Comida");
    expect(created.typeId).toBe(1);
    expect(created.color).toBe("#00FF00");
  });

  it("updateCategory reemplaza la categoría correspondiente en el listado", async () => {
    useTransactionsStore.setState(state => ({
      ...state,
      categories: [makeCategory({ categoryId: "cat-1" as any, description: "Vieja" })],
    }));

    const apiCatUpdated = makeApiCategory({
      category_id: "cat-1" as any,
      description: "Nueva",
      type_id: 2,
      color: "#0000FF",
    });

    const putSpy = vi
      .spyOn(http, "put")
      .mockResolvedValue({ data: apiCatUpdated } as any);

    const updated = await useTransactionsStore.getState().updateCategory({
      categoryId: "cat-1" as any,
      description: "Nueva",
      typeId: 2,
      color: "#0000FF",
      userId: "user-1" as any,
    });

    const { categories } = useTransactionsStore.getState();
    expect(putSpy).toHaveBeenCalledWith(
      "/categories/cat-1",
      expect.objectContaining({
        description: "Nueva",
        type_id: 2,
        color: "#0000FF",
      }),
    );
    expect(categories).toHaveLength(1);
    expect(categories[0].description).toBe("Nueva");
    expect(updated.typeId).toBe(2);
  });

  it("deleteCategory elimina la categoría del listado", async () => {
    useTransactionsStore.setState(state => ({
      ...state,
      categories: [
        makeCategory({ categoryId: "cat-1" as any }),
        makeCategory({ categoryId: "cat-2" as any, description: "Otra" }),
      ],
    }));

    const deleteSpy = vi
      .spyOn(http, "delete")
      .mockResolvedValue({} as any);

    await useTransactionsStore.getState().deleteCategory("cat-1" as any);

    const { categories } = useTransactionsStore.getState();
    expect(deleteSpy).toHaveBeenCalledWith("/categories/cat-1");
    expect(categories).toHaveLength(1);
    expect(categories[0].categoryId).toBe("cat-2");
  });
});

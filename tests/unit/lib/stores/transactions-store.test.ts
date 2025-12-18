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

  it("updateTransaction actualiza la transacción en la misma cuenta y ajusta el balance", async () => {
    const initialTx = {
      transactionId: "tx-1" as any,
      accountId: "acc-1" as any,
      amount: 50,
      typeId: 1,
      date: "2024-01-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      categoryId: null,
      category: null,
      transactionType: null,
      typeName: null,
      description: "Gasto original",
    };

    useTransactionsStore.setState(state => ({
      ...state,
      accountTransactions: {
        "acc-1": [initialTx as any],
      },
    }));

    const apiUpdated: ApiUserTransaction = makeApiTransaction({
      transaction_id: "tx-1" as any,
      account_id: "acc-1" as any,
      amount: 80,
      type_id: 1,
      description: "Gasto editado",
    });

    const putSpy = vi
      .spyOn(http, "put")
      .mockResolvedValue({ data: apiUpdated } as any);

    await useTransactionsStore.getState().updateTransaction("tx-1" as any, {
      transactionId: "tx-1" as any,
      accountId: "acc-1" as any,
      amount: 80,
      date: apiUpdated.date,
      typeId: 1,
      categoryId: null,
      category: null,
      description: apiUpdated.description,
    });

    expect(putSpy).toHaveBeenCalledWith(
      "/transactions/tx-1",
      expect.objectContaining({
        account_id: "acc-1",
        amount: 80,
        type_id: 1,
      }),
    );

    const txState = useTransactionsStore.getState();
    const list = txState.accountTransactions["acc-1"];
    expect(list).toHaveLength(1);
    expect(list?.[0].amount).toBe(80);
    expect(list?.[0].description).toBe("Gasto editado");

    const account = useAccountsStore
      .getState()
      .accounts.find(a => a.accountId === "acc-1");
    const detail = useAccountsStore.getState().accountDetails["acc-1"];

    // Balance inicial 100, gasto pasa de 50 a 80 => delta -30
    expect(account?.balance).toBe(70);
    expect(detail?.balance).toBe(70);
  });

  it("updateTransaction mueve la transacción a otra cuenta y ajusta ambos balances", async () => {
    const initialTx = {
      transactionId: "tx-1" as any,
      accountId: "acc-1" as any,
      amount: 50,
      typeId: 1,
      date: "2024-01-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      categoryId: null,
      category: null,
      transactionType: null,
      typeName: null,
      description: "Gasto original",
    };

    useTransactionsStore.setState(state => ({
      ...state,
      accountTransactions: {
        "acc-1": [initialTx as any],
        "acc-2": [],
      },
    }));

    useAccountsStore.setState(state => ({
      ...state,
      accounts: [
        makeAccount({ accountId: "acc-1" as any, balance: 100 }),
        makeAccount({ accountId: "acc-2" as any, balance: 200 }),
      ],
      accountDetails: {
        "acc-1": makeAccount({ accountId: "acc-1" as any, balance: 100 }),
        "acc-2": makeAccount({ accountId: "acc-2" as any, balance: 200 }),
      },
    }));

    const apiUpdated: ApiUserTransaction = makeApiTransaction({
      transaction_id: "tx-1" as any,
      account_id: "acc-2" as any,
      amount: 80,
      type_id: 1,
      description: "Gasto movido",
    });

    const putSpy = vi
      .spyOn(http, "put")
      .mockResolvedValue({ data: apiUpdated } as any);

    await useTransactionsStore.getState().updateTransaction("tx-1" as any, {
      transactionId: "tx-1" as any,
      accountId: "acc-2" as any,
      amount: 80,
      date: apiUpdated.date,
      typeId: 1,
      categoryId: null,
      category: null,
      description: apiUpdated.description,
    });

    expect(putSpy).toHaveBeenCalledWith(
      "/transactions/tx-1",
      expect.objectContaining({
        account_id: "acc-2",
        amount: 80,
        type_id: 1,
      }),
    );

    const txState = useTransactionsStore.getState();
    expect(txState.accountTransactions["acc-1"]).toHaveLength(0);
    expect(txState.accountTransactions["acc-2"]).toHaveLength(1);
    expect(txState.accountTransactions["acc-2"][0].accountId).toBe("acc-2");
    expect(txState.accountTransactions["acc-2"][0].amount).toBe(80);

    const accState = useAccountsStore.getState();
    const acc1 = accState.accounts.find(a => a.accountId === "acc-1");
    const acc2 = accState.accounts.find(a => a.accountId === "acc-2");
    const det1 = accState.accountDetails["acc-1"];
    const det2 = accState.accountDetails["acc-2"];

    // Se revierte el gasto de 50 en acc-1 (+50) y se aplica gasto de 80 en acc-2 (-80)
    expect(acc1?.balance).toBe(150);
    expect(det1?.balance).toBe(150);
    expect(acc2?.balance).toBe(120);
    expect(det2?.balance).toBe(120);
  });

  it("deleteTransaction elimina la transacción y revierte el impacto en el balance", async () => {
    const tx = {
      transactionId: "tx-1" as any,
      accountId: "acc-1" as any,
      amount: 50,
      typeId: 1,
      date: "2024-01-01T00:00:00.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      categoryId: null,
      category: null,
      transactionType: null,
      typeName: null,
      description: "Gasto a eliminar",
    };

    useTransactionsStore.setState(state => ({
      ...state,
      accountTransactions: {
        "acc-1": [tx as any],
      },
    }));

    useAccountsStore.setState(state => ({
      ...state,
      accounts: [makeAccount({ accountId: "acc-1" as any, balance: 50 })],
      accountDetails: {
        "acc-1": makeAccount({ accountId: "acc-1" as any, balance: 50 }),
      },
    }));

    const deleteSpy = vi
      .spyOn(http, "delete")
      .mockResolvedValue({} as any);

    await useTransactionsStore.getState().deleteTransaction("tx-1" as any);

    expect(deleteSpy).toHaveBeenCalledWith("/transactions/tx-1");

    const txState = useTransactionsStore.getState();
    expect(txState.accountTransactions["acc-1"]).toHaveLength(0);

    const accState = useAccountsStore.getState();
    const account = accState.accounts.find(a => a.accountId === "acc-1");
    const detail = accState.accountDetails["acc-1"];

    // Balance inicial 50 con gasto 50 aplicado; al eliminarlo, vuelve a 100
    expect(account?.balance).toBe(100);
    expect(detail?.balance).toBe(100);
  });
});

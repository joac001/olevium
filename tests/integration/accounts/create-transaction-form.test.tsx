import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateTransactionForm from "@/app/accounts/_accountsComponents/CreateTransactionForm";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { CUSTOM_CATEGORY_VALUE } from "@/app/accounts/_accountsComponents/transactionFormUtils";

const showNotification = vi.fn();
const showError = vi.fn();
const showSuccess = vi.fn();

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showNotification,
    showError,
    showSuccess,
  }),
}));

vi.mock("@/context/TransactionContext", () => ({
  useTransactionData: () => ({
    transactionTypes: [
      {
        typeId: 1,
        name: "Gasto",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ],
    transactionTypesLoading: false,
    categories: [],
    categoriesLoading: false,
  }),
}));

const createTransactionMock = vi.fn().mockResolvedValue(undefined);
const originalTxState = useTransactionsStore.getState();

beforeEach(() => {
  useTransactionsStore.setState({
    ...originalTxState,
    createTransaction: createTransactionMock,
  });
});

afterEach(() => {
  useTransactionsStore.setState(originalTxState);
  vi.clearAllMocks();
});

// Mock de la lógica interna del formulario para centrarnos en el submit
vi.mock("@/app/accounts/_accountsComponents/transactionFormUtils", async () => {
  const actual = await vi.importActual<
    typeof import("@/app/accounts/_accountsComponents/transactionFormUtils")
  >("@/app/accounts/_accountsComponents/transactionFormUtils");

  return {
    ...actual,
    useTransactionFormState: () => ({
      selectedType: 1,
      selectedCategory: "cat-1",
      isCustomCategory: false,
      typeOptions: [],
      categoryOptions: [],
      typeDisabled: false,
      categoryDisabled: false,
      customCategoryName: "",
      customCategoryDescription: "",
      setCustomCategoryName: () => {},
      setCustomCategoryDescription: () => {},
      handleTypeChange: () => {},
      handleCategoryChange: () => {},
    }),
    normalizeTransactionFormData: (args: any) => ({
      amount: 150,
      date: "2024-01-01",
      typeId: args.selectedType ?? 1,
      categoryId: args.selectedCategory === CUSTOM_CATEGORY_VALUE ? undefined : args.selectedCategory,
      category: null,
      description: "Test",
    }),
  };
});

describe.skip("CreateTransactionForm", () => {
  it("envía el formulario válido y llama a createTransaction", async () => {
    render(
      <CreateTransactionForm accountId={"acc-1" as any} />,
    );

    fireEvent.change(screen.getByLabelText(/monto/i), {
      target: { value: "150" },
    });

    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: "2024-01-01" },
    });

    // Rellenamos solo los campos básicos; el resto lo controla el mock del normalizador
    const submitButton = screen.getByRole("button", {
      name: /agregar transacción/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createTransactionMock).toHaveBeenCalledTimes(1);
      const args = createTransactionMock.mock.calls[0][0];
      expect(args.accountId).toBe("acc-1");
      expect(args.amount).toBe(150);
      expect(args.typeId).toBeDefined();
    });
  });
});

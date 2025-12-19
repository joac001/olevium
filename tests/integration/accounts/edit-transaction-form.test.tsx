import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditTransactionForm from "@/app/accounts/_accountsComponents/EditTransactionForm";
import type { AccountTransaction, TransactionCategory, TransactionType } from "@/types";

const showNotification = vi.fn();
const showError = vi.fn();
const showSuccess = vi.fn();
const updateTransaction = vi.fn();

const transactionTypes: TransactionType[] = [
  { typeId: 1, name: "Gasto", createdAt: "2024-01-01T00:00:00.000Z" },
  { typeId: 2, name: "Ingreso", createdAt: "2024-01-01T00:00:00.000Z" },
];

const categories: TransactionCategory[] = [
  {
    categoryId: "cat-1" as any,
    userId: "user-1" as any,
    typeId: 1,
    description: "Comida",
    color: "#FF0000",
    createdAt: "2024-01-01T00:00:00.000Z",
    isDefault: false,
    transactionType: null,
  },
];

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showNotification,
    showError,
    showSuccess,
  }),
}));

vi.mock("@/context/TransactionContext", () => ({
  useTransactionData: () => ({
    transactionTypes,
    transactionTypesLoading: false,
    categories,
    categoriesLoading: false,
  }),
}));

vi.mock("@/lib/stores/transactions", () => ({
  useTransactionsStore: (selector: (state: any) => any) =>
    selector({
      updateTransaction,
    }),
}));

const makeTransaction = (overrides: Partial<AccountTransaction> = {}): AccountTransaction => ({
  transactionId: "tx-1" as any,
  accountId: "acc-1" as any,
  amount: 50,
  typeId: 1,
  date: "2024-01-10T00:00:00.000Z",
  createdAt: "2024-01-10T00:00:00.000Z",
  categoryId: "cat-1" as any,
  category: {
    categoryId: "cat-1" as any,
    description: "Comida",
    color: "#FF0000",
    createdAt: "2024-01-01T00:00:00.000Z",
    isDefault: false,
    transactionType: null,
  },
  transactionType: null,
  typeName: "Gasto",
  description: "Gasto original",
  ...overrides,
});

describe("EditTransactionForm", () => {
  beforeEach(() => {
    updateTransaction.mockReset();
    updateTransaction.mockResolvedValue(makeTransaction({ amount: 80 }));
    showNotification.mockReset();
    showError.mockReset();
    showSuccess.mockReset();
  });

  it("inicializa los campos con los datos existentes y llama a updateTransaction con los valores normalizados", async () => {
    const onSuccess = vi.fn();
    const tx = makeTransaction();

    render(
      <EditTransactionForm accountId="acc-1" transaction={tx} onSuccess={onSuccess} />,
    );

    const amountInput = screen.getByLabelText(/monto/i) as HTMLInputElement;
    expect(amountInput.value).toBe("50");

    const descriptionInput = screen.getByLabelText(
      /descripción del movimiento/i,
    ) as HTMLInputElement;
    expect(descriptionInput.value).toBe("Gasto original");

    // Cambiamos el monto y la descripción
    fireEvent.change(amountInput, { target: { value: "80" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Gasto editado" },
    });

    const submitButton = screen.getByRole("button", { name: /guardar cambios/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTransaction).toHaveBeenCalledTimes(1);
    });

    const [, payload] = updateTransaction.mock.calls[0];
    expect(payload.accountId).toBe("acc-1");
    expect(payload.transactionId).toBe("tx-1");
    expect(payload.amount).toBe(80);
    expect(payload.description).toBe("Gasto editado");

    expect(showSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("muestra error cuando updateTransaction lanza y no llama a onSuccess", async () => {
    const onSuccess = vi.fn();
    const tx = makeTransaction();

    updateTransaction.mockRejectedValueOnce(new Error("fallo actualización"));

    render(
      <EditTransactionForm accountId="acc-1" transaction={tx} onSuccess={onSuccess} />,
    );

    const submitButton = screen.getByRole("button", { name: /guardar cambios/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTransaction).toHaveBeenCalledTimes(1);
    });

    expect(showError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});


import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteTransactionForm from "@/app/accounts/_accountsComponents/DeleteTransactionForm";
import type { AccountTransaction } from "@/types";

const showNotification = vi.fn();
const showError = vi.fn();
const showSuccess = vi.fn();
const deleteTransaction = vi.fn();

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showNotification,
    showError,
    showSuccess,
  }),
}));

vi.mock("@/lib/stores/transactions", () => ({
  useTransactionsStore: (selector: (state: any) => any) =>
    selector({
      deleteTransaction,
    }),
}));

const makeTransaction = (
  overrides: Partial<AccountTransaction> = {},
): AccountTransaction => ({
  transactionId: "tx-1" as any,
  accountId: "acc-1" as any,
  amount: 50,
  typeId: 1,
  date: "2024-01-10T00:00:00.000Z",
  createdAt: "2024-01-10T00:00:00.000Z",
  categoryId: null,
  category: null,
  transactionType: null,
  typeName: "Gasto",
  description: "Gasto a eliminar",
  ...overrides,
});

describe("DeleteTransactionForm", () => {
  beforeEach(() => {
    deleteTransaction.mockReset();
    deleteTransaction.mockResolvedValue(undefined);
    showNotification.mockReset();
    showError.mockReset();
    showSuccess.mockReset();
  });

  it("muestra el resumen de la transacción y elimina correctamente el movimiento", async () => {
    const onSuccess = vi.fn();
    const tx = makeTransaction();

    render(
      <DeleteTransactionForm
        transaction={tx}
        currency="ARS"
        onSuccess={onSuccess}
      />,
    );

    expect(
      screen.getByText(/gasto a eliminar/i),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledTimes(1);
    });

    expect(deleteTransaction).toHaveBeenCalledWith("tx-1");
    expect(showSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("muestra error cuando deleteTransaction lanza y no llama a onSuccess", async () => {
    const onSuccess = vi.fn();
    const tx = makeTransaction();

    deleteTransaction.mockRejectedValueOnce(new Error("fallo eliminación"));

    render(
      <DeleteTransactionForm
        transaction={tx}
        currency="ARS"
        onSuccess={onSuccess}
      />,
    );

    const submitButton = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledTimes(1);
    });

    expect(showError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});


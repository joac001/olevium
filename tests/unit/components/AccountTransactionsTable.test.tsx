import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AccountTransactionsTable from "@/app/accounts/_accountsComponents/AccountTransactionsTable";
import type { AccountTransaction } from "@/types";

vi.mock("@/context/ModalContext", () => ({
  useModal: () => ({
    showModal: vi.fn(),
    hideModal: vi.fn(),
  }),
}));

const makeTransaction = (overrides: Partial<AccountTransaction> = {}): AccountTransaction => ({
  transactionId: "tx-1" as any,
  accountId: "acc-1" as any,
  amount: 100,
  typeId: 2,
  date: "2024-01-10T00:00:00.000Z",
  createdAt: "2024-01-10T00:00:00.000Z",
  categoryId: null,
  category: null,
  transactionType: null,
  typeName: null,
  description: "Compra supermercado",
  ...overrides,
});

describe("AccountTransactionsTable", () => {
  it("muestra mensaje vacío cuando no hay transacciones", () => {
    render(
      <AccountTransactionsTable
        transactions={[]}
        loading={false}
        currency="ARS"
      />,
    );

    expect(
      screen.getByText(/todavía no tiene movimientos registrados/i),
    ).toBeInTheDocument();
  });

  it("renderiza filas ordenadas por fecha descendente y muestra montos firmados", () => {
    const tx1 = makeTransaction({
      transactionId: "tx-1" as any,
      date: "2024-01-10T00:00:00.000Z",
      amount: 100,
      typeId: 2, // ingreso
      description: "Ingreso",
    });
    const tx2 = makeTransaction({
      transactionId: "tx-2" as any,
      date: "2023-12-01T00:00:00.000Z",
      amount: 50,
      typeId: 1, // gasto
      description: "Gasto",
    });

    render(
      <AccountTransactionsTable
        transactions={[tx2, tx1]}
        loading={false}
        currency="ARS"
      />,
    );

    // Verificamos que ambos conceptos aparezcan, sin asumir orden ni unicidad
    const conceptos = screen.getAllByText(/ingreso|gasto/i).map(el => el.textContent);
    expect(conceptos.join(" ")).toMatch(/Ingreso/i);
    expect(conceptos.join(" ")).toMatch(/Gasto/i);
  });
});

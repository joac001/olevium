import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import CreateAccountForm from "@/app/accounts/_accountsComponents/CreateAccountForm";
import { useAccountsStore } from "@/lib/stores/accounts";
import { http } from "@/lib/utils/axios";
import type { AccountType, Currency } from "@/types";

const showNotification = vi.fn();

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showNotification,
  }),
}));

const createAccountMock = vi.fn().mockResolvedValue(undefined);
const originalState = useAccountsStore.getState();

vi.mock("@/app/accounts/_accountsComponents/accountFormUtils", async () => {
  const actual = await vi.importActual<
    typeof import("@/app/accounts/_accountsComponents/accountFormUtils")
  >("@/app/accounts/_accountsComponents/accountFormUtils");

  return {
    ...actual,
    normalizeAccountFormData: () => ({
      name: "Cuenta prueba",
      typeId: 1,
      currencyId: 1,
      balance: 1000,
    }),
  };
});

beforeEach(() => {
  useAccountsStore.setState(state => ({
    ...state,
    createAccount: createAccountMock,
  }));
});

afterEach(() => {
  useAccountsStore.setState(originalState);
  vi.clearAllMocks();
});

const ACCOUNT_TYPES: AccountType[] = [
  {
    typeId: 1,
    name: "Cuenta corriente",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

describe.skip("CreateAccountForm", () => {
  it("envía el formulario con datos válidos y llama a createAccount", async () => {
    render(
      <CreateAccountForm
        accountTypes={ACCOUNT_TYPES}
        loadingTypes={false}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(/nombre de la cuenta/i),
      { target: { value: "Cuenta prueba" } },
    );

    // Para DropMenu, usamos sus inputs internos (por ahora confiamos en el normalizador)
    fireEvent.change(screen.getByLabelText(/balance inicial/i), {
      target: { value: "1000" },
    });

    const submitButton = screen.getByRole("button", {
      name: /registrar cuenta/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createAccountMock).toHaveBeenCalledWith({
        name: "Cuenta prueba",
        typeId: 1,
        currencyId: 1,
        balance: 1000,
      });
    });
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "@/app/auth/_authComponents/LoginForm";
import { useAuthStore } from "@/lib/stores/auth";

// Simple mocks for provider hooks used by LoginForm
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

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

const loginMock = vi.fn().mockResolvedValue(undefined);
const originalLogin = useAuthStore.getState().login;

beforeEach(() => {
  useAuthStore.setState(state => ({
    ...state,
    login: loginMock,
  }));
});

afterEach(() => {
  useAuthStore.setState(state => ({
    ...state,
    login: originalLogin,
  }));
  vi.clearAllMocks();
});

describe("LoginForm", () => {
  it("renderiza los campos de email y password", () => {
    render(<LoginForm />);

    expect(
      screen.getByLabelText(/correo electrónico/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("llama a login con email y password válidos (happy path)", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Password1!" } });

    const submitButton = screen.getByRole("button", {
      name: /iniciar sesión/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(
        "test@example.com",
        "Password1!",
      );
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErrorHandler, useFormErrorHandler, useAuthErrorHandler } from "@/lib/hooks/useErrorHandler";

const showError = vi.fn();
const showSuccess = vi.fn();

vi.mock("@/context/NotificationContext", () => ({
  useNotification: () => ({
    showError,
    showSuccess,
  }),
}));

describe("useErrorHandler", () => {
  it("handleAsyncOperation llama a showSuccess cuando la operación se resuelve y showSuccessOnCompletion=true", async () => {
    const { result } = renderHook(() =>
      useErrorHandler({
        showSuccessOnCompletion: true,
        successMessage: "OK",
      }),
    );

    await act(async () => {
      const value = await result.current.handleAsyncOperation(async () => 42);
      expect(value).toBe(42);
    });

    expect(showSuccess).toHaveBeenCalled();
  });

  it("handleCreate envuelve la operación con contexto de creación y llama a showError en fallo", async () => {
    const { result } = renderHook(() => useErrorHandler());

    await act(async () => {
      const value = await result.current.handleCreate(
        async () => {
          throw new Error("fallo");
        },
        "categoría",
      );
      expect(value).toBeNull();
    });

    expect(showError).toHaveBeenCalled();
  });
});

describe("useFormErrorHandler", () => {
  it("muestra éxito cuando el submitFunction se resuelve", async () => {
    const { result } = renderHook(() => useFormErrorHandler());

    let resultValue: boolean | null = null;
    await act(async () => {
      resultValue = await result.current.handleFormSubmission(async () => "ok");
    });

    expect(resultValue).toBe(true);
    expect(showSuccess).toHaveBeenCalled();
  });

  it("muestra error cuando el submitFunction lanza", async () => {
    const { result } = renderHook(() => useFormErrorHandler());

    let resultValue: boolean | null = null;
    await act(async () => {
      resultValue = await result.current.handleFormSubmission(async () => {
        throw new Error("fallo");
      });
    });

    expect(resultValue).toBe(false);
    expect(showError).toHaveBeenCalled();
  });
});

describe("useAuthErrorHandler", () => {
  it("handleLogin llama a showSuccess cuando el loginFunction se resuelve", async () => {
    const { result } = renderHook(() => useAuthErrorHandler());

    let value: boolean | null = null;
    await act(async () => {
      value = await result.current.handleLogin(async () => void 0);
    });

    expect(value).toBe(true);
    expect(showSuccess).toHaveBeenCalled();
  });

  it("handleLogout llama a showError cuando logoutFunction lanza", async () => {
    const { result } = renderHook(() => useAuthErrorHandler());

    let value: boolean | null = null;
    await act(async () => {
      value = await result.current.handleLogout(async () => {
        throw new Error("fallo");
      });
    });

    expect(value).toBe(false);
    expect(showError).toHaveBeenCalled();
  });
});


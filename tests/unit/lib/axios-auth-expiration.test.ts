import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { http } from "@/lib/utils/axios";
import { useAuthStore } from "@/lib/stores/auth";

// Helper para crear una respuesta 401 simulada
const create401Error = () => {
  const error: any = new Error("Unauthorized");
  error.config = { url: "/protected", method: "get" };
  error.response = { status: 401 };
  return error;
};

const originalClearSession = useAuthStore.getState().clearSession;
const originalRefreshSession = useAuthStore.getState().refreshSession;
const originalLogout = useAuthStore.getState().logout;

describe("axios auth expiration handling", () => {
  beforeEach(() => {
    // Limpiar flags internas del módulo axios.ts reinicializando el store
    useAuthStore.setState(state => ({
      ...state,
      accessToken: null,
      refreshToken: null,
    }));
  });

  afterEach(() => {
    useAuthStore.setState(state => ({
      ...state,
      clearSession: originalClearSession,
      refreshSession: originalRefreshSession,
      logout: originalLogout,
    }));
    vi.restoreAllMocks();
  });

  it("si no hay refreshToken limpia sesión y redirige a /auth", async () => {
    const clearSession = vi.fn();
    useAuthStore.setState(state => ({
      ...state,
      refreshToken: null,
      clearSession,
    }));

    const replaceSpy = vi.fn();
    const originalLocation = window.location;
    // @ts-expect-error overwrite for test
    delete (window as any).location;
    // @ts-expect-error test stub
    window.location = {
      ...originalLocation,
      pathname: "/accounts",
      replace: replaceSpy,
    } as any;

    const interceptor: any = (http.interceptors.response as any).handlers.find(
      (h: any) => typeof h.rejected === "function",
    )?.rejected;

    expect(interceptor).toBeTruthy();

    await interceptor(create401Error()).catch(() => {});

    expect(clearSession).toHaveBeenCalled();
    expect(replaceSpy).toHaveBeenCalledWith("/auth");

    window.location = originalLocation;
  });
});


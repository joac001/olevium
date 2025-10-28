'use client';

import type { AxiosRequestConfig } from "axios";
import { create } from "zustand";

import { http } from "@/lib/utils/axios";
import { useUserStore } from "@/lib/stores/user";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { tokenStorage } from "@/lib/utils/tokenStorage";
import { resolveAxiosError } from "@/lib/utils/errorHandling";

export interface AuthLoginPayload {
  email: string;
  password: string;
}

export interface AuthSignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSignupResponse {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
}

type TokenPairResponse = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  token_type?: string;
  tokenType?: string;
  user?: {
    id?: string | number;
    email?: string;
    name?: string | null;
  };
};

interface TokenRefreshRequest {
  access_token?: string;
  refresh_token: string;
}

export interface VerifyEmailResponse {
  detail?: string;
  email_verified?: boolean;
}

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  user: {
    id?: string | number;
    email?: string;
    name?: string | null;
  } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: AuthSignupPayload) => Promise<AuthSignupResponse>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  refreshSession: () => Promise<void>;
  tryHydrate: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  setTokens: (tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    tokenType: string | null;
  }) => void;
};

const mapTokenPair = (pair: TokenPairResponse) => ({
  accessToken: pair.access_token ?? pair.accessToken ?? null,
  refreshToken: pair.refresh_token ?? pair.refreshToken ?? null,
  tokenType: pair.token_type ?? pair.tokenType ?? "bearer",
  user: pair.user ?? null,
});

const AUTH_ERROR_FALLBACK = "No se pudo completar la acción de autenticación.";

const normalizeAuthError = (error: unknown): Error => resolveAxiosError(error, AUTH_ERROR_FALLBACK);

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  user: null,
  loading: false,

  setTokens: ({ accessToken, refreshToken, tokenType }) => {
    set((prev) => ({
      accessToken,
      refreshToken,
      tokenType,
      user: prev.user,
    }));
    tokenStorage.save({ accessToken, refreshToken, tokenType });
  },

  clearSession: () => {
    set({
      accessToken: null,
      refreshToken: null,
      tokenType: null,
      user: null,
      loading: false, // Asegurar que loading se resetee
    });
    tokenStorage.clear();
    useUserStore.getState().reset();
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await http.post<TokenPairResponse>("/auth/login", { email, password });
      const tokens = mapTokenPair(data);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error("Respuesta del servidor inválida: faltan tokens de sesión.");
      }
      set(() => ({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        user: tokens.user,
        loading: false,
      }));
      tokenStorage.save(tokens);
      useUserStore.getState().reset();
      const transactionsStore = useTransactionsStore.getState();
      void transactionsStore.fetchTransactionTypes().catch((error) => {
        console.warn("Failed to prefetch transaction types:", error);
      });
      void transactionsStore.fetchCategories().catch((error) => {
        console.warn("Failed to prefetch transaction categories:", error);
      });
    } catch (error) {
      set({ loading: false });
      throw normalizeAuthError(error);
    }
  },

  signup: async (payload) => {
    try {
      const { data } = await http.post<AuthSignupResponse>("/auth/signup", payload);
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  verifyEmail: async (token) => {
    try {
      const { data } = await http.get<VerifyEmailResponse>(`/auth/verify-email/${encodeURIComponent(token)}`);
      return data;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  refreshSession: async () => {
    const { accessToken, refreshToken } = get();

    console.log("Refreshing session...");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const payload: TokenRefreshRequest = {
      ...(accessToken ? { access_token: accessToken } : {}),
      refresh_token: refreshToken,
    };

    const refreshConfig: AxiosRequestConfig & { skipAuthRefresh?: boolean } = {
      skipAuthRefresh: true,
    };

    try {
      const { data } = await http.post<TokenPairResponse>("/auth/refresh", payload, refreshConfig);

      const tokens = mapTokenPair(data);
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error("Respuesta de refresh inválida.");
      }

      set((prev) => ({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType,
        user: tokens.user ?? prev.user ?? null,
        loading: false, // Asegurar que loading se resetee
      }));
      tokenStorage.save(tokens);
    } catch (error) {
      // Limpiar tokens inválidos pero no hacer logout automático aquí
      set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        loading: false,
      });
      tokenStorage.clear();
      throw normalizeAuthError(error);
    }
  },

  tryHydrate: async () => {
    const { loading } = get();
    if (loading) return; // Evitar múltiples ejecuciones simultáneas
    
    set({ loading: true });
    try {
      const stored = tokenStorage.read();
      if (!stored.refreshToken) {
        set({
          accessToken: null,
          refreshToken: null,
          tokenType: null,
          user: null,
          loading: false,
        });
        useUserStore.getState().reset();
        return;
      }

      set((prev) => ({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        tokenType: stored.tokenType,
        user: prev.user,
        loading: stored.accessToken ? false : true, // Solo mantener loading si necesitamos refresh
      }));

      // Solo hacer refresh si no hay access token
      if (!stored.accessToken) {
        try {
          await get().refreshSession();
        } catch (error) {
          // Si falla el refresh durante hydrate, limpiar todo
          console.warn("Failed to refresh during hydrate:", error);
          set({
            accessToken: null,
            refreshToken: null,
            tokenType: null,
            user: null,
            loading: false,
          });
          tokenStorage.clear();
          useUserStore.getState().reset();
          throw error;
        }
      }
    } catch (error) {
      set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        user: null,
        loading: false,
      });
      tokenStorage.clear();
      useUserStore.getState().reset();
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    const { accessToken } = get();
    
    try {
      if (accessToken) {
        const config: AxiosRequestConfig & { skipAuthRefresh?: boolean } = { 
          skipAuthRefresh: true 
        };
        await http.post("/auth/logout", undefined, config);
      }
    } catch (error) {
      // Log el error pero continúa con la limpieza local
      console.warn("Error during logout:", error);
    } finally {
      // Siempre limpiar la sesión local
      set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        user: null,
        loading: false,
      });
      tokenStorage.clear();
      useUserStore.getState().reset();
    }
  },
}));

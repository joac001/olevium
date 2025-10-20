'use client';

import { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { create } from "zustand";

import { http } from "@/lib/utils/axios";
import { useUserStore } from "@/lib/stores/user";
import { tokenStorage } from "@/lib/utils/tokenStorage";

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

const normalizeAuthError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { detail?: string; message?: string; error?: string } | undefined;
    const detail = payload?.detail ?? payload?.message ?? payload?.error;
    if (detail) {
      return new Error(detail);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("No se pudo completar la acción de autenticación.");
};

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
      }));
      tokenStorage.save(tokens);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  tryHydrate: async () => {
    set({ loading: true });
    try {
      const stored = tokenStorage.read();
      if (!stored.refreshToken) {
        set({
          accessToken: null,
          refreshToken: null,
          tokenType: null,
          user: null,
        });
        useUserStore.getState().reset();
        return;
      }

      set((prev) => ({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken,
        tokenType: stored.tokenType,
        user: prev.user,
      }));

      if (!stored.accessToken) {
        await get().refreshSession();
      }
    } catch {
      set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        user: null,
      });
      tokenStorage.clear();
      useUserStore.getState().reset();
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const config: AxiosRequestConfig & { skipAuthRefresh?: boolean } = { skipAuthRefresh: true };
      await http.post("/auth/logout", undefined, config);
    } catch (error) {
      throw normalizeAuthError(error);
    } finally {
      set({
        accessToken: null,
        refreshToken: null,
        tokenType: null,
        user: null,
      });
      tokenStorage.clear();
      useUserStore.getState().reset();
    }
  },
}));

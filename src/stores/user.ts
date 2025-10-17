import { create } from 'zustand';
import { isAxiosError } from 'axios';
import { UserType } from '@/types/';
import axiosInstance from '@/utils/axios';
import { LocalStorageCache } from '@/utils/cache';

type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

type LoginPayload = {
    email: string;
    password: string;
};

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

type UserStoreState = {
    user: UserType | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    error: string | null;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<UserType | null>;
    logout: () => Promise<void>;
    hydrate: () => void;
    clearError: () => void;
};

const TOKEN_CACHE_KEY = 'authTokens';
const USER_CACHE_KEY = 'authUser';

const isBrowser = typeof window !== 'undefined';

const setAuthHeader = (token: string | null) => {
    if (token) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common.Authorization;
    }
};

const persistTokens = (tokens: AuthTokens | null) => {
    if (!isBrowser) {
        return;
    }

    if (tokens) {
        LocalStorageCache.set(TOKEN_CACHE_KEY, tokens);
    } else {
        LocalStorageCache.remove(TOKEN_CACHE_KEY);
    }
};

const persistUser = (user: UserType | null) => {
    if (!isBrowser) {
        return;
    }

    if (user) {
        LocalStorageCache.set(USER_CACHE_KEY, user);
    } else {
        LocalStorageCache.remove(USER_CACHE_KEY);
    }
};

const extractErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const detail = (error.response?.data as { detail?: string })?.detail;
        if (detail) {
            return detail;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Ocurrió un error inesperado. Intenta nuevamente.';
};

const useUserStore = create<UserStoreState>((set, get) => ({
    user: null,
    tokens: null,
    isLoading: false,
    error: null,
    login: async ({ email, password }) => {
        console.log('🔍 Login attempt:', { email, password, baseURL: process.env.NEXT_PUBLIC_API_URL });
        set({ isLoading: true, error: null });

        try {
            const payload = { email, password };
            console.log('📡 Sending payload:', payload);
            
            const response = await axiosInstance.post('/auth/login', payload);
            console.log('✅ Login response:', response.data);

            const tokens: AuthTokens = {
                accessToken: response.data?.access_token,
                refreshToken: response.data?.refresh_token,
            };

            if (!tokens.accessToken || !tokens.refreshToken) {
                throw new Error('No se recibieron tokens de autenticación válidos.');
            }

            persistTokens(tokens);
            setAuthHeader(tokens.accessToken);

            const existingUser = get().user ?? {};
            const nextUser: UserType = {
                ...existingUser,
                email,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };

            persistUser(nextUser);

            set({
                user: nextUser,
                tokens,
                isLoading: false,
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            if (isAxiosError(error)) {
                console.error('📄 Error response:', error.response?.data);
                console.error('📊 Error status:', error.response?.status);
                console.error('🔧 Error config:', error.config);
            }
            const message = extractErrorMessage(error);
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    register: async ({ name, email, password }) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axiosInstance.post('/auth/signup', { name, email, password });

            const createdUser: UserType = {
                id: response.data?.user_id,
                name: response.data?.name ?? name,
                email: response.data?.email ?? email,
                createdAt: response.data?.created_at,
            };

            persistUser(createdUser);
            persistTokens(null);
            setAuthHeader(null);

            set({
                user: createdUser,
                tokens: null,
                isLoading: false,
            });

            return createdUser;
        } catch (error) {
            const message = extractErrorMessage(error);
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    logout: async () => {
        const { tokens } = get();

        set({ isLoading: true, error: null });

        try {
            if (tokens?.accessToken) {
                await axiosInstance.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            persistTokens(null);
            persistUser(null);
            setAuthHeader(null);

            set({
                user: null,
                tokens: null,
                isLoading: false,
            });
        }
    },
    hydrate: () => {
        if (!isBrowser) {
            return;
        }

        const cachedTokens = LocalStorageCache.get<AuthTokens>(TOKEN_CACHE_KEY);
        const cachedUser = LocalStorageCache.get<UserType>(USER_CACHE_KEY);

        if (cachedTokens?.accessToken) {
            setAuthHeader(cachedTokens.accessToken);
        }

        set({
            tokens: cachedTokens ?? null,
            user: cachedUser ?? null,
        });
    },
    clearError: () => set({ error: null }),
}));

export { useUserStore };
export type { AuthTokens, LoginPayload, RegisterPayload, UserStoreState };

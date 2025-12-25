'use client';

import { create } from 'zustand';

import { api } from '@/lib/http';
import { resolveError } from '@/lib/utils/errorHandling';

export interface UserProfile {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
}

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  hasFetched: boolean;
  fetchCurrentUser: () => Promise<UserProfile | null>;
  setUser: (user: UserProfile | null) => void;
  reset: () => void;
}

const normalizeUserError = (error: unknown): Error =>
  resolveError(error, 'No se pudo obtener la información del usuario.');

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  hasFetched: false,

  fetchCurrentUser: async () => {
    if (get().loading) {
      return get().user;
    }

    set({ loading: true });

    try {
      const { data } = await api.get<UserProfile>('/users/me/');
      set({
        user: data,
        loading: false,
        hasFetched: true,
      });
      return data;
    } catch (error) {
      set({
        loading: false,
        hasFetched: true,
      });
      throw normalizeUserError(error);
    }
  },

  setUser: user => set({ user, hasFetched: !!user }),

  reset: () => set({ user: null, hasFetched: false, loading: false }),
}));

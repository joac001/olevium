import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { useAuthStore } from '@/lib/stores/auth';

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Flag para evitar loops
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];
let redirectingToAuth = false;

http.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

http.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const { response } = error;
    const config = (error.config ?? {}) as RetriableConfig;

    // Si no es 401, o ya intentamos refrescar en este request, seguir normal
    if (!response || response.status !== 401 || config._retry || config.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // Marcar que este request va a reintentar
    config._retry = true;

    const retry = () => http(config);

    if (isRefreshing) {
      // Encola el reintento hasta que termine el refresh en curso
      return new Promise((resolve, reject) => {
        pendingQueue.push(() => retry().then(resolve).catch(reject));
      });
    }

    isRefreshing = true;

    // Verificar si hay refresh token antes de intentar el refresh
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      // Si no hay refresh token, proceder directamente con limpieza y redirección
      useAuthStore.getState().clearSession();
      pendingQueue = [];
      isRefreshing = false;

      if (typeof window !== 'undefined' && !redirectingToAuth) {
        redirectingToAuth = true;
        if (window.location.pathname !== '/auth') {
          window.location.replace('/auth');
        }
      }

      // Rechazar el request original sin mensaje de error específico
      return Promise.reject(error);
    }

    try {
      await useAuthStore.getState().refreshSession();

      // Ejecutar la cola
      const queue = [...pendingQueue];
      pendingQueue = [];
      queue.forEach(fn => fn());
      return retry();
    } catch (e) {
      // Solo intentar logout si hay tokens para limpiar en el backend
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        try {
          await useAuthStore.getState().logout(); // limpiar estado en el backend
        } catch {
          useAuthStore.getState().clearSession();
        }
      } else {
        useAuthStore.getState().clearSession();
      }
      pendingQueue = [];
      if (typeof window !== 'undefined' && !redirectingToAuth) {
        redirectingToAuth = true;
        if (window.location.pathname !== '/auth') {
          window.location.replace('/auth');
        }
      }
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
        redirectingToAuth = false;
      }
    }
  }
);

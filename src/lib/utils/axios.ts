// lib/http.ts
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

import { useAuthStore } from "@/lib/stores/auth";

const shouldSendCredentials = process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true";

// Crear una instancia
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: shouldSendCredentials,
});

// Flag para evitar loops
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

http.interceptors.request.use((config) => {
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
  (res) => res,
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
    try {
      await useAuthStore.getState().refreshSession();

      // Ejecutar la cola
      const queue = [...pendingQueue];
      pendingQueue = [];
      queue.forEach((fn) => fn());
      return retry();
    } catch (e) {
      await useAuthStore.getState().logout(); // limpiar estado
      pendingQueue = [];
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

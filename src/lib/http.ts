import { useAuthStore } from '@/lib/stores/auth';
import { tokenStorage } from '@/lib/utils/tokenStorage';

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_BASE = RAW_BASE.replace(/\/+$/, ''); // sin slash final

type ApiRequestInit = RequestInit & {
  skipAuth?: boolean;
  isRetry?: boolean; // Flag para evitar loops infinitos de refresh
};

// Flag para evitar múltiples refreshes concurrentes
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const trimmedPath = path.trim();
  const needsSlash = !trimmedPath.startsWith('/');
  return `${API_BASE}${needsSlash ? '/' : ''}${trimmedPath}`;
}

/**
 * Get auth token from cookies (server) or Zustand store (client)
 */
async function getAuthToken(): Promise<string | null> {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('olevium_access_token')?.value || null;
    } catch {
      return null;
    }
  }

  // Client-side: intentar primero del store, luego de las cookies
  // Esto es importante porque al recargar la página, el store puede estar vacío
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) {
    return storeToken;
  }

  // Fallback a las cookies si el store está vacío
  const storedTokens = tokenStorage.read();
  return storedTokens.accessToken;
}

/**
 * Intenta refrescar el token de acceso usando el refresh token
 * Retorna true si el refresh fue exitoso, false si falló
 */
async function tryRefreshToken(): Promise<boolean> {
  // Solo en cliente
  if (typeof window === 'undefined') return false;

  // Si ya hay un refresh en progreso, esperar a que termine
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const authState = useAuthStore.getState();

      // Intentar obtener el refresh token del store primero, luego de las cookies
      // Esto es importante porque al recargar la página, el store puede estar vacío
      // pero las cookies aún tienen los tokens válidos
      const storedTokens = tokenStorage.read();
      const refreshToken = authState.refreshToken || storedTokens.refreshToken;
      const accessToken = authState.accessToken || storedTokens.accessToken;

      // Si no hay refresh token en ningún lado, no podemos refrescar
      if (!refreshToken) {
        return false;
      }

      const url = buildUrl('/auth/refresh');
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken || refreshToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar los tokens en el store y en las cookies
        const newAccessToken = data.access_token ?? data.accessToken ?? null;
        const newRefreshToken = data.refresh_token ?? data.refreshToken ?? refreshToken;
        const tokenType = data.token_type ?? data.tokenType ?? 'bearer';

        if (newAccessToken) {
          useAuthStore.getState().setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            tokenType,
          });
          return true;
        }
      }

      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Cerrar sesión y redirigir al login
 */
function handleLogout(): void {
  if (typeof window === 'undefined') return;

  useAuthStore.getState().clearSession();
  window.location.href = '/auth';
}

export async function apiRequest(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', headers.get('Accept') ?? 'application/json');

  if (!init.skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = buildUrl(path);

  // Configure fetch options
  const fetchOptions: RequestInit = {
    ...init,
    headers,
    credentials: 'include', // Required for CORS with cookies
  };

  // Add cache: 'no-store' for server-side requests
  if (typeof window === 'undefined') {
    fetchOptions.cache = 'no-store';
  }

  return fetch(url, fetchOptions);
}

export async function parseErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0];
      if (first?.msg) return String(first.msg);
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Axios-like API helpers
// ============================================================================

type ApiConfig = {
  skipAuth?: boolean;
  skipAuthRefresh?: boolean; // For backward compatibility with axios interceptors
  headers?: Record<string, string>;
};

/**
 * Helper to make HTTP requests with automatic error handling and JSON parsing
 * Incluye lógica de refresh automático del token en caso de 401
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config: ApiConfig = {},
  isRetry = false
): Promise<{ data: T }> {
  const init: ApiRequestInit = {
    method,
    skipAuth: config.skipAuth || config.skipAuthRefresh,
    headers: config.headers,
    isRetry,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await apiRequest(path, init);

  // Handle 401 Unauthorized
  if (response.status === 401 && typeof window !== 'undefined') {
    // No intentar refresh si:
    // - Es un retry (ya intentamos refresh)
    // - El request tiene skipAuth (no necesita auth)
    // - Es el endpoint de refresh mismo
    const isRefreshEndpoint = path.includes('/auth/refresh');
    const shouldTryRefresh = !isRetry && !init.skipAuth && !isRefreshEndpoint;

    if (shouldTryRefresh) {
      // Intentar refrescar el token
      const refreshSuccess = await tryRefreshToken();

      if (refreshSuccess) {
        // Reintentar el request original con el nuevo token
        return request<T>(method, path, body, config, true);
      }
    }

    // Si llegamos aquí, el refresh falló o no se intentó
    // Cerrar sesión y redirigir
    handleLogout();
    throw new Error('Sesión expirada. Redirigiendo al login...');
  }

  if (!response.ok) {
    const errorMessage = await parseErrorMessage(response);
    throw new Error(errorMessage ?? `Request failed with status ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { data: undefined as T };
  }

  const data = (await response.json()) as T;
  return { data };
}

/**
 * Axios-like API interface for easier migration from axios
 */
export const api = {
  get: <T>(path: string, config?: ApiConfig) => request<T>('GET', path, undefined, config),
  post: <T>(path: string, body?: unknown, config?: ApiConfig) =>
    request<T>('POST', path, body, config),
  put: <T>(path: string, body?: unknown, config?: ApiConfig) =>
    request<T>('PUT', path, body, config),
  patch: <T>(path: string, body?: unknown, config?: ApiConfig) =>
    request<T>('PATCH', path, body, config),
  delete: <T>(path: string, config?: ApiConfig) => request<T>('DELETE', path, undefined, config),
};

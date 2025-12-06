import { useAuthStore } from '@/lib/stores/auth';

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_BASE = RAW_BASE.replace(/\/+$/, ''); // sin slash final

type ApiRequestInit = RequestInit & {
  skipAuth?: boolean;
};

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const trimmedPath = path.trim();
  const hasApiBase = API_BASE.endsWith('/api');
  const startsWithApi = trimmedPath.startsWith('/api');
  const normalizedPath =
    hasApiBase && startsWithApi ? trimmedPath.replace(/^\/api/, '') : trimmedPath;
  const needsSlash = !normalizedPath.startsWith('/');
  return `${API_BASE}${needsSlash ? '/' : ''}${normalizedPath}`;
}

export async function apiRequest(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', headers.get('Accept') ?? 'application/json');

  if (!init.skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = buildUrl(path);
  return fetch(url, { ...init, headers });
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

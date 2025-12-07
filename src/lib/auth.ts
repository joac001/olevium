import { useAuthStore } from '@/lib/stores/auth';

export type StoredProfile = {
  name?: string;
  email?: string;
};

// Configuración de URL de API
const RAW_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_BASE = RAW_BASE.replace(/\/+$/, ''); // sin slash final

function buildApiUrl(path: string): string {
  const trimmedPath = path.trim();
  const hasApiBase = API_BASE.endsWith('/api');
  const startsWithApi = trimmedPath.startsWith('/api');
  const normalizedPath =
    hasApiBase && startsWithApi ? trimmedPath.replace(/^\/api/, '') : trimmedPath;
  const needsSlash = !normalizedPath.startsWith('/');
  return `${API_BASE}${needsSlash ? '/' : ''}${normalizedPath}`;
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await useAuthStore.getState().login(email, password);
    const profile: StoredProfile = {
      email,
      name: useAuthStore.getState().user?.name ?? undefined,
    };
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message ?? 'No se pudo iniciar sesión' };
  }
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    // Reuse login flow after signup
    await fetch(buildApiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    await useAuthStore.getState().login(payload.email, payload.password);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message ?? 'No se pudo crear la cuenta' };
  }
}

export function logout() {
  useAuthStore.getState().logout?.();
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(buildApiUrl('/api/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.detail ?? 'No se pudo procesar la solicitud');
  }

  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(buildApiUrl('/api/auth/reset-password'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.detail ?? 'No se pudo restablecer la contraseña');
  }

  return response.json();
}

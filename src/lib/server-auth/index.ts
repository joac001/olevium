import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAuthExpiredError } from '@/lib/http';

/**
 * Verifica si hay cookies de sesión.
 * Redirige a /auth si no hay sesión.
 * Usar al inicio de páginas protegidas.
 */
export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (!accessToken?.value && !refreshToken?.value) {
    redirect('/auth');
  }
}

/**
 * Verifica si hay cookies de sesión.
 * Redirige a /dashboard si ya hay sesión.
 * Usar en páginas públicas como /auth.
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('olevium_access_token');
  const refreshToken = cookieStore.get('olevium_refresh_token');

  if (accessToken?.value || refreshToken?.value) {
    redirect('/dashboard');
  }
}

/**
 * Resultado de una operación protegida por auth.
 */
export type ProtectedResult<T> =
  | { success: true; data: T }
  | { success: false; reason: 'auth_expired' };

/**
 * Ejecuta una función de fetch protegida.
 * Si hay error de auth expirado, retorna { success: false, reason: 'auth_expired' }.
 * Otros errores se propagan normalmente.
 */
export async function withAuthProtection<T>(
  fn: () => Promise<T>
): Promise<ProtectedResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (isAuthExpiredError(error)) {
      return { success: false, reason: 'auth_expired' };
    }
    throw error;
  }
}

/**
 * Helper para manejar el resultado de withAuthProtection.
 * Redirige a /auth si la sesión expiró, o retorna los datos.
 */
export function handleProtectedResult<T>(result: ProtectedResult<T>): T {
  if (!result.success) {
    redirect('/auth');
  }
  return result.data;
}

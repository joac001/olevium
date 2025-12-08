import { useAuthStore } from '@/lib/stores/auth';
import { apiRequest, parseErrorMessage } from '@/lib/http';

export type StoredProfile = {
  name?: string;
  email?: string;
};

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
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    if (!response.ok) {
      const detail = await parseErrorMessage(response);
      throw new Error(detail ?? 'No se pudo crear la cuenta');
    }
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
  const response = await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });

  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? 'No se pudo procesar la solicitud');
  }

  return response.json();
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await apiRequest('/auth/reset-password', {
    method: 'PUT',
    body: JSON.stringify({ token, new_password: newPassword }),
    skipAuth: true,
  });

  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? 'No se pudo restablecer la contraseña');
  }

  return response.json();
}

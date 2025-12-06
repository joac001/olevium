import { useAuthStore } from '@/lib/stores/auth';

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
    const profile: StoredProfile = { email, name: useAuthStore.getState().user?.name };
    useAuthStore.getState().setProfile?.(profile as any);
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
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

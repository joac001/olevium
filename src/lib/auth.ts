import { apiRequest, parseErrorMessage } from '@/lib/http';
import { tokenStorage } from '@/lib/utils/tokenStorage';
import { resolveError } from '@/lib/utils/errorHandling';

export type StoredProfile = {
  name?: string;
  email?: string;
};

export interface AuthSignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSignupResponse {
  user_id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface VerifyEmailResponse {
  detail?: string;
  email_verified?: boolean;
}

type TokenPairResponse = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  token_type?: string;
  tokenType?: string;
};

const AUTH_ERROR_FALLBACK = 'No se pudo completar la acción de autenticación.';

function mapTokenPair(pair: TokenPairResponse) {
  return {
    accessToken: pair.access_token ?? pair.accessToken ?? null,
    refreshToken: pair.refresh_token ?? pair.refreshToken ?? null,
    tokenType: pair.token_type ?? pair.tokenType ?? 'bearer',
  };
}

function normalizeAuthError(error: unknown): Error {
  return resolveError(error, AUTH_ERROR_FALLBACK);
}

export async function login(email: string, password: string): Promise<void> {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    if (!response.ok) {
      const detail = await parseErrorMessage(response);
      throw new Error(detail ?? 'No se pudo iniciar sesión');
    }
    const data: TokenPairResponse = await response.json();
    const tokens = mapTokenPair(data);
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error('Respuesta del servidor inválida: faltan tokens de sesión.');
    }
    tokenStorage.save(tokens);
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function signup(payload: AuthSignupPayload): Promise<AuthSignupResponse> {
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
    return response.json();
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  try {
    const response = await apiRequest(`/auth/verify-email/${encodeURIComponent(token)}`, {
      method: 'GET',
      skipAuth: true,
    });
    if (!response.ok) {
      const detail = await parseErrorMessage(response);
      throw new Error(detail ?? 'No se pudo verificar el correo');
    }
    return response.json();
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    const { accessToken } = tokenStorage.read();
    if (accessToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        skipAuthRefresh: true,
      });
    }
  } catch (error) {
    console.warn('Error during logout:', error);
  } finally {
    tokenStorage.clear();
    if (typeof window !== 'undefined') {
      void fetch('/api/auth/clear-session', { method: 'GET', cache: 'no-store' }).catch(() => {});
    }
  }
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

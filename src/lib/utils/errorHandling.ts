interface ErrorPayload {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
  error?: string;
}

/**
 * Extrae el mensaje de error de una Response de fetch
 */
export async function extractErrorMessage(response: Response): Promise<string | null> {
  try {
    const data = (await response.json()) as ErrorPayload;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      const first = data.detail[0];
      if (first?.msg) return String(first.msg);
    }
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return null;
  } catch {
    return null;
  }
}

/**
 * Resuelve cualquier error a un Error con mensaje legible
 */
export const resolveError = (error: unknown, fallbackMessage: string): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

/**
 * DEPRECATED: Use resolveError instead
 * @deprecated
 */
export const resolveAxiosError = resolveError;

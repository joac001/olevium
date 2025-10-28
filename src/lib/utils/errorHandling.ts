import { AxiosError } from "axios";

interface ErrorPayload {
  detail?: string;
  message?: string;
  error?: string;
}

export const resolveAxiosError = (error: unknown, fallbackMessage: string): Error => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorPayload | undefined;
    const detail = payload?.detail ?? payload?.message ?? payload?.error;
    if (detail) {
      return new Error(detail);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

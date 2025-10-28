import { AxiosError } from "axios";

interface ErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}

export const extractAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ErrorResponse | undefined;
    if (payload?.detail) {
      return payload.detail;
    }
    if (payload?.message) {
      return payload.message;
    }
    if (payload?.error) {
      return payload.error;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

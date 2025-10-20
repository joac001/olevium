'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { Box, Button, Typography } from "@/components/shared/ui";
import { useNotification } from "@/context/NotificationContext";
import { useAuthStore } from "@/lib/stores/auth";

interface VerifyEmailHandlerProps {
  token?: string;
}

type VerifyStatus = "idle" | "loading" | "success" | "error";

interface ErrorResponse {
  detail?: string;
  message?: string;
  error?: string;
}

const extractErrorMessage = (error: unknown) => {
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

  return "No pudimos verificar tu correo. Inténtalo nuevamente.";
};

export default function VerifyEmailHandler({ token }: VerifyEmailHandlerProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const [status, setStatus] = useState<VerifyStatus>(token ? "loading" : "error");
  const [message, setMessage] = useState<string>(() =>
    token ? "Validando tu enlace de verificación..." : "Token de verificación faltante o inválido.",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;
    let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

    const verify = async () => {
      setStatus("loading");
      setMessage("Validando tu enlace de verificación...");

      try {
        const data = await verifyEmail(token);

        if (cancelled) {
          return;
        }

        setStatus("success");
        setMessage(
          data.detail ?? "Tu correo fue verificado correctamente. Te redirigiremos al inicio de sesión.",
        );

        showNotification(
          "fa-solid fa-circle-check",
          "success",
          "Email verificado",
          "Puedes iniciar sesión con tus credenciales.",
        );

        redirectTimeout = setTimeout(() => {
          router.replace("/auth");
        }, 2600);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const friendlyMessage = extractErrorMessage(error);
        setStatus("error");
        setMessage(friendlyMessage);
      }
    };

    void verify();

    return () => {
      cancelled = true;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [router, showNotification, token, verifyEmail]);

  const iconClass = useMemo(() => {
    switch (status) {
      case "success":
        return "fa-solid fa-circle-check";
      case "error":
        return "fa-solid fa-triangle-exclamation";
      case "loading":
      default:
        return "fa-solid fa-circle-notch fa-spin";
    }
  }, [status]);

  return (
    <Box className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <i className={`${iconClass} text-4xl text-[color:var(--text-muted)] md:text-5xl`} aria-hidden />
      <Typography variant="body" className="text-lg md:text-xl">
        {message}
      </Typography>

      {status === "error" && (
        <Button
          type="primary"
          text="Iniciar sesión"
          onClick={() => router.replace("/auth")}
        />
      )}
    </Box>
  );
}

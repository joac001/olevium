'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Box, Card, Typography, Button } from "@/components/shared/ui";
import { useNotification } from "@/context/NotificationContext";
import { useAuthStore } from "@/lib/stores/auth";
import { useUserStore } from "@/lib/stores/user";

const formatDate = (iso: string | undefined) => {
  if (!iso) {
    return "Fecha no disponible";
  }

  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return iso;
  }
};

export default function WelcomePanel() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const hasFetched = useUserStore((state) => state.hasFetched);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!hasFetched && accessToken) {
      fetchCurrentUser().catch((error) => {
        const message = error instanceof Error ? error.message : "No se pudo cargar tu información.";
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al obtener tus datos", message);
      });
    }
  }, [accessToken, fetchCurrentUser, hasFetched, showNotification]);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification("fa-solid fa-circle-check", "success", "Sesión finalizada", "Vuelve cuando quieras.");
      router.replace("/auth");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No pudimos cerrar tu sesión. Intenta nuevamente.";
      showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al cerrar sesión", message);
    }
  };

  const handleReloadProfile = () => {
    fetchCurrentUser().catch((error) => {
      const message = error instanceof Error ? error.message : "No se pudo cargar tu información.";
      showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al obtener tus datos", message);
    });
  };

  return (
    <Card tone="accent" title="Panel de inicio" subtitle="Tu resumen personal">
      <Box className="flex flex-col gap-6">
        {loading && !user ? (
          <Typography variant="body">Cargando tu información...</Typography>
        ) : user ? (
          <Box className="space-y-3">
            <Typography variant="h2" className="text-lg md:text-xl">
              ¡Hola, {user.name || "Usuario"}!
            </Typography>
            <Typography variant="body" className="text-[color:var(--text-muted)]">
              Has iniciado sesión con <span className="font-semibold text-[color:var(--text-primary)]">{user.email}</span>.
            </Typography>
            <Typography variant="body" className="text-[color:var(--text-muted)]">
              Formas parte de Olevium desde el <span className="font-semibold text-[color:var(--text-primary)]">{formatDate(user.created_at)}</span>.
            </Typography>
          </Box>
        ) : (
          <Box className="space-y-3">
            <Typography variant="body">
              No pudimos cargar tu perfil. Intenta nuevamente más tarde.
            </Typography>
            <Button
              type="primary"
              text="Reintentar"
              fullWidth
              icon="fas fa-rotate-right"
              onClick={handleReloadProfile}
            />
          </Box>
        )}

        <Button
          type="danger"
          text="Cerrar sesión"
          fullWidth
          onClick={() => handleLogout()}
          icon="fas fa-sign-out-alt"
        />
      </Box>
    </Card>
  );
}

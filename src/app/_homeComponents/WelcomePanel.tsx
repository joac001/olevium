'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Card, Typography, Button } from '@/components/shared/ui';
import { formatDate } from '@/lib/utils/parser';
import { useNotification } from '@/context/NotificationContext';
import { useAuthStore } from '@/lib/stores/auth';
import { useUserStore } from '@/lib/stores/user';
import { createOperationContext } from '@/lib/utils/errorSystem';

export default function WelcomePanel() {
  const router = useRouter();
  const { showNotification, showError, showSuccess } = useNotification();
  const user = useUserStore(state => state.user);
  const loading = useUserStore(state => state.loading);
  const hasFetched = useUserStore(state => state.hasFetched);
  const fetchCurrentUser = useUserStore(state => state.fetchCurrentUser);
  const accessToken = useAuthStore(state => state.accessToken);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    if (!hasFetched && accessToken) {
      fetchCurrentUser().catch(error => {
        const context = createOperationContext('fetch', 'perfil', 'el perfil');
        showError(error, context);
      });
    }
  }, [accessToken, fetchCurrentUser, hasFetched, showNotification, showError]);

  const handleLogout = async () => {
    try {
      await logout();
      const context = createOperationContext('logout', 'sesión', 'la sesión');
      showSuccess('Sesión finalizada exitosamente. ¡Vuelve cuando quieras!', context);
      router.replace('/auth');
    } catch (error) {
      const context = createOperationContext('logout', 'sesión', 'la sesión');
      showError(error, context);
    }
  };

  const handleReloadProfile = () => {
    fetchCurrentUser().catch(error => {
      const context = createOperationContext('fetch', 'perfil', 'el perfil');
      showError(error, context);
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
              ¡Hola, {user.name || 'Usuario'}!
            </Typography>
            <Typography variant="body" className="text-[color:var(--text-muted)]">
              Has iniciado sesión con{' '}
              <span className="font-semibold text-[color:var(--text-primary)]">{user.email}</span>.
            </Typography>
            <Typography variant="body" className="text-[color:var(--text-muted)]">
              Formas parte de Olevium desde el{' '}
              <span className="font-semibold text-[color:var(--text-primary)]">
                {formatDate(user.created_at ?? '', 'dd Mes aaaa') || 'Fecha no disponible'}
              </span>
              .
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

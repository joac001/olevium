'use client';

import { ActionButton, Banner, Box, Typography, Skeleton } from '@/components/shared/ui';
import { useProfilePage } from './ProfileProvider';

export default function ProfileHeader() {
  const { usingMockData, handleRefresh, isLoading } = useProfilePage();

  if (isLoading) {
    return (
      <Box className="flex flex-col gap-3">
        <Skeleton width="40%" height="32px" />
        <Skeleton width="65%" height="18px" />
        <Skeleton width="140px" height="44px" />
      </Box>
    );
  }

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Perfil de Usuario</Typography>
        <Typography variant="body">
          Gestioná tu información personal y la configuración de tu cuenta.
        </Typography>
      </Box>
      <Box className="flex flex-wrap items-center gap-2">
        <ActionButton
          icon="fas fa-rotate"
          type="accent"
          text="Actualizar"
          onClick={handleRefresh}
        />
      </Box>
      {usingMockData && (
        <Banner
          icon="fas fa-flask"
          color="warning"
          title="Datos de ejemplo"
          description="No pudimos conectar con la API, mostrando datos simulados."
        />
      )}
    </Box>
  );
}

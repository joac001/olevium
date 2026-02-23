import { Box, Typography } from '@/components/shared/ui';

export default function ProfileHeader() {
  return (
    <Box className="flex flex-col gap-2">
      <Typography variant="h1">Perfil de Usuario</Typography>
      <Typography variant="body">
        Gestioná tu información personal y la configuración de tu cuenta.
      </Typography>
    </Box>
  );
}

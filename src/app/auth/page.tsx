import { Container, Box, Typography, PageHeader } from '@/components/shared/ui';
import AuthSwitcher from './_components/AuthSwitcher';

export default function AuthPage() {
  return (
    <Container className="py-10">
      <PageHeader />
      <Box className="mx-auto flex w-full max-w-xl flex-col items-center gap-6">
        <Box className="text-center">
          <Typography variant="h1">Gestiona tu acceso</Typography>
          {/* <Typography variant="body" className="mt-2 text-[color:var(--text-muted)]">
            Ingresa con tu cuenta existente o crea una nueva para comenzar a usar Olevium.
          </Typography> */}
        </Box>

        <AuthSwitcher />
      </Box>
    </Container>
  );
}

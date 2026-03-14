import { Container, Box, Typography, AppLink } from '@/components/shared/ui';

export default function NotFound() {
  return (
    <Container className="min-h-screen flex items-center justify-center py-16">
      <Box className="flex flex-col items-center gap-6 text-center">
        <Typography variant="h1">404</Typography>
        <Typography variant="body" className="text-lg text-[color:var(--text-muted)]">
          La página que buscas no existe o fue movida.
        </Typography>
        <AppLink
          href="/"
          variant="unstyled"
          className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary)] transition-colors duration-150 hover:text-[color:var(--color-primary-dark)]"
        >
          Volver al inicio
        </AppLink>
      </Box>
    </Container>
  );
}

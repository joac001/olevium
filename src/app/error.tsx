'use client';

import { Container, Box, Typography, Button } from '@/components/shared/ui';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="min-h-screen flex items-center justify-center py-16">
      <Box className="flex flex-col items-center gap-6 text-center">
        <Typography variant="h1">Algo salió mal</Typography>
        <Typography variant="body" className="text-lg text-[color:var(--text-muted)]">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </Typography>
        <Button type="primary" text="Reintentar" onClick={reset} />
      </Box>
    </Container>
  );
}

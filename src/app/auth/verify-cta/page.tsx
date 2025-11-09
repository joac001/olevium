import Link from 'next/link';

import { Container, Box, Card, Typography } from '@/components/shared/ui';

export default function VerifyCtaPage() {
  return (
    <Container className="py-16">
      <Box className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          href="/auth"
          className="flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)]"
        >
          <i className="fas fa-arrow-left" aria-hidden />
          Volver al acceso
        </Link>

        <Card tone="neutral" className="min-h-[360px]">
          <Box className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
            <Typography variant="body" className="text-lg md:text-xl">
              Verifica tu email con el enlace que acabamos de enviar a tu bandeja de entrada.
            </Typography>
            <i
              className="fas fa-envelope text-4xl text-[color:var(--text-muted)] md:text-5xl"
              aria-hidden
            />
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

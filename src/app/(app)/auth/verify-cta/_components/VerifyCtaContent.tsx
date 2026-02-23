import { ArrowLeft, Mail } from 'lucide-react';
import { Container, Box, Card, Typography, AppLink } from '@/components/shared/ui';

export default function VerifyCtaContent() {
  return (
    <Container className="py-16">
      <Box className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <AppLink
          href="/auth"
          variant="unstyled"
          className="flex w-fit items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al acceso
        </AppLink>

        <Card tone="neutral" className="min-h-[360px]">
          <Box className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
            <Typography variant="body" className="text-lg md:text-xl">
              Verifica tu email con el enlace que acabamos de enviar a tu bandeja de entrada.
            </Typography>
            <Mail
              className="h-10 w-10 text-[color:var(--text-muted)] md:h-12 md:w-12"
              aria-hidden
            />
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

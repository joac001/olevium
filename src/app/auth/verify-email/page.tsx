import { Container, Box, Card, Typography } from '@/components/shared/ui';
import VerifyEmailHandler from './_components/VerifyEmailHandler';

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const tokenParam = params?.token;
  const token = typeof tokenParam === 'string' ? tokenParam : undefined;

  return (
    <Container className="py-16">
      <Box className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Typography variant="h1">Verificación de correo</Typography>
        <Card tone="neutral" className="min-h-[360px]">
          <VerifyEmailHandler token={token} />
        </Card>
      </Box>
    </Container>
  );
}

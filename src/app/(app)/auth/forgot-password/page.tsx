import type { Metadata } from 'next';
import { Box, Container } from '@/components/shared/ui';

export const metadata: Metadata = {
  title: 'Recuperar contraseña | Olevium',
};
import ForgotPasswordForm from './_components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Container className="min-h-screen flex items-center justify-center py-12 px-4">
      <Box className="w-full max-w-md">
        <ForgotPasswordForm />
      </Box>
    </Container>
  );
}

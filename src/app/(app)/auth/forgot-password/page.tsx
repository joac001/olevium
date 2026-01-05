'use client';

import { Box, Container } from '@/components/shared/ui';
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

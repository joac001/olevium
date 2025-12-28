'use client';

import { Suspense } from 'react';
import { Box, Container } from '@/components/shared/ui';
import ResetPasswordForm from './_components/ResetPasswordForm';

function ResetPasswordLoading() {
  return (
    <Box className="animate-pulse space-y-4">
      <Box className="h-8 bg-[var(--bg-tertiary)] rounded w-3/4 mx-auto" />
      <Box className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2 mx-auto" />
      <Box className="h-12 bg-[var(--bg-tertiary)] rounded w-full" />
      <Box className="h-12 bg-[var(--bg-tertiary)] rounded w-full" />
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container className="min-h-screen flex items-center justify-center py-12 px-4">
      <Box className="w-full max-w-md">
        <Suspense fallback={<ResetPasswordLoading />}>
          <ResetPasswordForm />
        </Suspense>
      </Box>
    </Container>
  );
}

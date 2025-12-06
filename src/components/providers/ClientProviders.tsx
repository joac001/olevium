'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NotificationProvider } from '@/context/NotificationContext';
import { ModalProvider } from '@/context/ModalContext';
import { TransactionDataProvider } from '@/context/TransactionContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <TransactionDataProvider>
          <ModalProvider>{children}</ModalProvider>
        </TransactionDataProvider>
      </QueryClientProvider>
    </NotificationProvider>
  );
}

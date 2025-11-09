'use client';

import { ReactNode } from 'react';

import { NotificationProvider } from '@/context/NotificationContext';
import { ModalProvider } from '@/context/ModalContext';
import { TransactionDataProvider } from '@/context/TransactionContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NotificationProvider>
      <TransactionDataProvider>
        <ModalProvider>{children}</ModalProvider>
      </TransactionDataProvider>
    </NotificationProvider>
  );
}

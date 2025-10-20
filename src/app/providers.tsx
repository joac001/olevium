'use client';

import { NotificationProvider } from "@/context/NotificationContext";
import { ModalProvider } from "@/context/ModalContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </NotificationProvider>
  );
}

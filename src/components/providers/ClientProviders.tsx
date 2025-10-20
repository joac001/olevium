
import { ReactNode } from "react";

import { NotificationProvider } from "@/context/NotificationContext";
import { ModalProvider } from "@/context/ModalContext";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <NotificationProvider>
      <ModalProvider>{children}</ModalProvider>
    </NotificationProvider>
  );
}

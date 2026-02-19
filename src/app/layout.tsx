import type { Metadata } from 'next';
import './globals.css';

import { Manrope } from 'next/font/google';

import { ClientProviders } from '@/components/providers/ClientProviders';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Olevium',
  description: 'Asistente financiero inteligente',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${manrope.className} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

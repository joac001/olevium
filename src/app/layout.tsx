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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${manrope.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

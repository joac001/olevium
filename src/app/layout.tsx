import type { Metadata } from 'next';
import './globals.css';

import { Manrope } from 'next/font/google';

import { NavBar, NavLink } from '@/components/layout/';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { Typography } from '@/components/shared/ui';

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

const links: NavLink[] = [
  { icon: 'fas fa-home', label: 'Inicio', href: '/dashboard' } as NavLink,
  { icon: 'fas fa-wallet', label: 'Cuentas', href: '/accounts' } as NavLink,
  { icon: 'fas fa-tags', label: 'Categorías', href: '/categories' } as NavLink,
  { icon: 'fas fa-table', label: 'Transacciones', href: '/transactions' } as NavLink,
  { icon: 'fas fa-rotate', label: 'Recurrentes', href: '/recurring-transactions' } as NavLink,
  { icon: 'fas fa-user', label: 'Perfil', href: '/profile' } as NavLink,
];

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
          <NavBar title="Olevium" links={links} />
          <main>{children}</main>
          <Typography variant="caption" className="block text-center mt-8 mb-4">
            &copy; {new Date().getFullYear()} Olevium - v0.1.1
          </Typography>
        </ClientProviders>
      </body>
    </html>
  );
}

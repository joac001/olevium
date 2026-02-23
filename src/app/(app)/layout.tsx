import type { Metadata } from 'next';
import { Home, Wallet, Tags, Table2, RefreshCw, User } from 'lucide-react';
import { NavBar, NavLink } from '@/components/layout/';
import FloatingActions from '@/components/layout/FloatingActions';
import { Typography } from '@/components/shared/ui';
import { ClientProviders } from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const links: NavLink[] = [
  { icon: <Home className="h-5 w-5 shrink-0" />, label: 'Inicio', href: '/dashboard' },
  { icon: <Wallet className="h-5 w-5 shrink-0" />, label: 'Cuentas', href: '/accounts' },
  { icon: <Tags className="h-5 w-5 shrink-0" />, label: 'Categorías', href: '/categories' },
  { icon: <Table2 className="h-5 w-5 shrink-0" />, label: 'Transacciones', href: '/transactions' },
  { icon: <RefreshCw className="h-5 w-5 shrink-0" />, label: 'Recurrentes', href: '/recurring-transactions' },
  { icon: <User className="h-5 w-5 shrink-0" />, label: 'Perfil', href: '/profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <NavBar title="Olevium" links={links} />
      <main>{children}</main>
      <Typography variant="caption" className="block text-center mt-8 mb-4">
        &copy; {new Date().getFullYear()} Olevium - v0.2.2
      </Typography>
      <FloatingActions />
    </ClientProviders>
  );
}

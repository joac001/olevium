import { NavBar, NavLink } from '@/components/layout/';
import FeedbackWidget from '@/components/layout/FeedbackWidget';
import { Typography } from '@/components/shared/ui';

const links: NavLink[] = [
  { icon: 'fas fa-home', label: 'Inicio', href: '/dashboard' },
  { icon: 'fas fa-wallet', label: 'Cuentas', href: '/accounts' },
  { icon: 'fas fa-tags', label: 'Categorías', href: '/categories' },
  { icon: 'fas fa-table', label: 'Transacciones', href: '/transactions' },
  { icon: 'fas fa-rotate', label: 'Recurrentes', href: '/recurring-transactions' },
  { icon: 'fas fa-user', label: 'Perfil', href: '/profile' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar title="Olevium" links={links} />
      <main>{children}</main>
      <Typography variant="caption" className="block text-center mt-8 mb-4">
        &copy; {new Date().getFullYear()} Olevium - v0.2.1
      </Typography>
      <FeedbackWidget />
    </>
  );
}

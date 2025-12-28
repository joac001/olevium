import DashboardShell from '../dashboard/_components/DashboardShell';

export default function Page() {
  // App demo muestra el dashboard sin datos reales
  return <DashboardShell initialAccounts={[]} initialTransactions={[]} />;
}

'use client';

import { type ReactNode } from 'react';
import clsx from 'clsx';
import { Wallet, TrendingUp, TrendingDown, Database } from 'lucide-react';

import { Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';

interface DashboardStatsCardsProps {
  totalBalanceARS: number;
  incomesPeriod: number;
  expensesPeriod: number;
  transactionsCount: number;
}

export default function DashboardStatsCards({
  totalBalanceARS,
  incomesPeriod,
  expensesPeriod,
  transactionsCount,
}: DashboardStatsCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Saldo consolidado (ARS)"
        subtitle="Saldo real según tus cuentas"
        value={formatCurrency(totalBalanceARS)}
        accent="from-emerald-500/40 via-emerald-400/20 to-emerald-500/10"
        icon={<Wallet className="h-5 w-5" />}
      />
      <DashboardCard
        title="Ingresos del período"
        subtitle="Entradas registradas en el rango seleccionado"
        value={formatCurrency(incomesPeriod)}
        accent="from-sky-500/40 via-sky-400/20 to-sky-500/10"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <DashboardCard
        title="Salidas del período"
        subtitle="Egresos registrados en el rango seleccionado"
        value={formatCurrency(expensesPeriod)}
        accent="from-rose-500/40 via-rose-400/20 to-rose-500/10"
        icon={<TrendingDown className="h-5 w-5" />}
      />
      <DashboardCard
        title="Movimientos registrados"
        subtitle="Cantidad de transacciones en el rango"
        value={transactionsCount.toString()}
        accent="from-violet-500/40 via-violet-400/20 to-violet-500/10"
        icon={<Database className="h-5 w-5" />}
      />
    </section>
  );
}

function DashboardCard({
  title,
  subtitle,
  value,
  icon,
  accent,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Box className="relative overflow-hidden rounded-2xl border border-white/5 bg-background-elevated/80 p-6 shadow-soft">
      <Box
        className={clsx(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-25 blur-3xl',
          accent
        )}
        aria-hidden
      />
      <Box className="relative flex items-center justify-between">
        <Box>
          {/* <Typography variant="caption" className="text-muted">
            {subtitle}
          </Typography> */}
          <Typography variant="body" as="h3" className="text-sm font-semibold text-white">
            {title}
          </Typography>
        </Box>
        <Box className="rounded-xl bg-white/10 p-3 text-white shadow-inset">{icon}</Box>
      </Box>
      <Typography variant="h2" className="relative mt-4 text-2xl font-semibold text-slate-50">
        {value}
      </Typography>
    </Box>
  );
}

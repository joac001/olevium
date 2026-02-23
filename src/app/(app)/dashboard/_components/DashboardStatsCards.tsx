'use client';

import { type ReactNode } from 'react';
import clsx from 'clsx';
import { Wallet, TrendingUp, TrendingDown, Database } from 'lucide-react';

import { Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { useDashboard } from '../_context/DashboardContext';

function currencyLines(map: Record<string, number>): string[] {
  const entries = Object.entries(map);
  if (entries.length === 0) return [`ARS ${formatCurrency(0)}`];
  return entries.map(([currency, amount]) => {
    const formatted = formatCurrency(amount, currency);
    return currency === 'ARS' ? `ARS ${formatted}` : formatted;
  });
}

export default function DashboardStatsCards() {
  const { balances, incomesByCurrency, expensesByCurrency } = useDashboard();
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Saldo consolidado"
        subtitle="Saldo real según tus cuentas"
        values={currencyLines(balances)}
        accent="from-emerald-500/40 via-emerald-400/20 to-emerald-500/10"
        icon={<Wallet className="h-5 w-5" />}
      />
      <DashboardCard
        title="Ingresos del período"
        subtitle="Entradas registradas en el rango seleccionado"
        values={currencyLines(incomesByCurrency)}
        accent="from-sky-500/40 via-sky-400/20 to-sky-500/10"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <DashboardCard
        title="Salidas del período"
        subtitle="Egresos registrados en el rango seleccionado"
        values={currencyLines(expensesByCurrency)}
        accent="from-rose-500/40 via-rose-400/20 to-rose-500/10"
        icon={<TrendingDown className="h-5 w-5" />}
      />
    </section>
  );
}

function DashboardCard({
  title,
  subtitle,
  values,
  icon,
  accent,
}: {
  title: string;
  subtitle: string;
  values: string[];
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
      <Box className="relative mt-4 flex flex-col gap-0.5">
        {values.map((v, i) => (
          <Typography key={i} variant="h2" className="text-2xl font-semibold text-slate-50">
            {v}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

'use client';

import { type ReactNode } from 'react';
import clsx from 'clsx';
import { Wallet, TrendingUp, TrendingDown, Scale, PiggyBank } from 'lucide-react';

import { Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { useDashboard } from '../_context/DashboardContext';

function currencyLines(map: Record<string, number>): { value: string; currency: string }[] {
  const entries = Object.entries(map);
  if (entries.length === 0) return [{ value: `ARS ${formatCurrency(0)}`, currency: 'ARS' }];
  return entries.map(([currency, amount]) => ({
    value: currency === 'ARS' ? `ARS ${formatCurrency(amount, currency)}` : formatCurrency(amount, currency),
    currency,
  }));
}

function calcDelta(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const positive = delta >= 0;
  return (
    <Typography
      variant="caption"
      as="span"
      className={clsx('text-[11px] font-medium', positive ? 'text-emerald-400' : 'text-rose-400')}
    >
      {positive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% vs período anterior
    </Typography>
  );
}

export default function DashboardStatsCards() {
  const { balances, incomesByCurrency, expensesByCurrency, prevSummary } = useDashboard();

  const mainCurrency = Object.keys(incomesByCurrency)[0] ?? Object.keys(expensesByCurrency)[0] ?? 'ARS';
  const currentIncome = incomesByCurrency[mainCurrency] ?? 0;
  const currentExpense = expensesByCurrency[mainCurrency] ?? 0;
  const netResult = currentIncome - currentExpense;
  const savingsRate = currentIncome > 0 ? (netResult / currentIncome) * 100 : null;

  const prevIncome = prevSummary?.incomeTotal ?? 0;
  const prevExpense = prevSummary?.expenseTotal ?? 0;
  const prevNet = prevIncome - prevExpense;

  const incomeDelta = calcDelta(currentIncome, prevIncome);
  const expenseDelta = calcDelta(currentExpense, prevExpense);
  const netDelta = calcDelta(netResult, prevNet);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <DashboardCard
        title="Saldo consolidado"
        values={currencyLines(balances).map(l => l.value)}
        accent="from-emerald-500/40 via-emerald-400/20 to-emerald-500/10"
        icon={<Wallet className="h-5 w-5" />}
      />
      <DashboardCard
        title="Ingresos del período"
        values={currencyLines(incomesByCurrency).map(l => l.value)}
        accent="from-sky-500/40 via-sky-400/20 to-sky-500/10"
        icon={<TrendingUp className="h-5 w-5" />}
        delta={<DeltaBadge delta={incomeDelta} />}
      />
      <DashboardCard
        title="Salidas del período"
        values={currencyLines(expensesByCurrency).map(l => l.value)}
        accent="from-rose-500/40 via-rose-400/20 to-rose-500/10"
        icon={<TrendingDown className="h-5 w-5" />}
        delta={<DeltaBadge delta={expenseDelta} />}
      />
      <DashboardCard
        title="Neto del período"
        values={currencyLines({ [mainCurrency]: Math.abs(netResult) }).map(l => l.value)}
        accent={netResult >= 0 ? 'from-emerald-500/40 via-emerald-400/20 to-emerald-500/10' : 'from-rose-500/40 via-rose-400/20 to-rose-500/10'}
        icon={<Scale className="h-5 w-5" />}
        delta={<DeltaBadge delta={netDelta} />}
        valueColor={netResult >= 0 ? 'text-emerald-300' : 'text-rose-300'}
      />
      <DashboardCard
        title="Tasa de ahorro"
        values={savingsRate !== null ? [`${savingsRate.toFixed(1)}%`] : ['—']}
        accent="from-violet-500/40 via-violet-400/20 to-violet-500/10"
        icon={<PiggyBank className="h-5 w-5" />}
      />
    </section>
  );
}

function DashboardCard({
  title,
  values,
  icon,
  accent,
  delta,
  valueColor = 'text-slate-50',
}: {
  title: string;
  values: string[];
  icon: ReactNode;
  accent: string;
  delta?: ReactNode;
  valueColor?: string;
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
        <Typography variant="body" as="h3" className="text-sm font-semibold text-white">
          {title}
        </Typography>
        <Box className="rounded-xl bg-white/10 p-3 text-white shadow-inset">{icon}</Box>
      </Box>
      <Box className="relative mt-4 flex flex-col gap-0.5">
        {values.map((v, i) => (
          <Typography key={i} variant="h2" className={clsx('text-2xl font-semibold', valueColor)}>
            {v}
          </Typography>
        ))}
        {delta && <Box className="mt-1">{delta}</Box>}
      </Box>
    </Box>
  );
}

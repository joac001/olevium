'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { BadgeCheck, Database, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import {
  Container,
  Card,
  Box,
  Typography,
  ActionButton,
  DropMenu,
  DateInput,
  MonthInput,
  AppLink,
} from '@/components/shared/ui';
import DashboardSkeleton from '../_skeletons/DashboardSkeleton';
import { formatCurrency, formatDateWithTime, formatSignedCurrency } from '@/lib/format';
import { getAccounts, getTransactions } from '@/lib/api';
import type { Account, Transaction } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/auth';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import { toSignedAmount } from '@/lib/utils/transactions';

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

type DashboardState = {
  accounts: Account[];
  transactions: Transaction[];
};

const initialState: DashboardState = {
  accounts: [],
  transactions: [],
};

const categoryPalette = [
  '#3f8aff',
  '#9f67ff',
  '#f472b6',
  '#f97316',
  '#22d3ee',
  '#facc15',
  '#4ade80',
  '#fb7185',
];
const PERIOD_OPTIONS: DropMenuOption[] = [
  { value: '10d', label: 'Últimos 10 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '365d', label: 'Último año' },
  { value: 'month', label: 'Mes específico' },
  { value: 'day', label: 'Día específico' },
];
const GROUPING_OPTIONS: DropMenuOption[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'monthly', label: 'Mensual' },
];

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<'10d' | '30d' | '365d' | 'month' | 'day'>('30d');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [grouping, setGrouping] = useState<'daily' | 'monthly'>('daily');
  const accessToken = useAuthStore(s => s.accessToken);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);

    const token =
      accessToken ??
      (typeof window !== 'undefined'
        ? window.localStorage.getItem('olevium.accessToken')
        : null);

    if (!token) {
      setIsRefreshing(false);
      return;
    }

    try {
      const [accountsResult, transactionsResult] = await Promise.all([
        getAccounts(),
        getTransactions(),
      ]);
      setState({
        accounts: accountsResult.data,
        transactions: transactionsResult.data,
      });
      setIsLoading(false);
    } catch (error) {
      console.warn('[olevium] no se pudo cargar el dashboard', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (period === '10d') start.setDate(now.getDate() - 9);
    if (period === '30d') start.setDate(now.getDate() - 29);
    if (period === '365d') start.setFullYear(now.getFullYear() - 1);

    if (period === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
      return state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
    }

    if (period === 'day' && selectedDay) {
      const dayStart = new Date(selectedDay);
      const dayEnd = new Date(selectedDay);
      dayEnd.setHours(23, 59, 59, 999);
      return state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= dayStart && txDate <= dayEnd;
      });
    }

    start.setHours(0, 0, 0, 0);
    return state.transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= now;
    });
  }, [state.transactions, period, selectedMonth, selectedDay]);

  const {
    totalBalanceARS,
    balancesByCurrency,
    incomesPeriod,
    expensesPeriod,
    transactionsCountPeriod,
  } = useMemo(() => {
    let incomes = 0;
    let expenses = 0;

    filteredTransactions.forEach(tx => {
      const signedAmount = toSignedAmount(tx.amount, tx.type_id);
      const amount = Math.abs(signedAmount);
      if (signedAmount >= 0) incomes += amount;
      else expenses += amount;
    });

    const balances = state.accounts.reduce<Record<string, number>>((acc, account) => {
      const currency =
        typeof account.currency === 'string'
          ? account.currency
          : ((account.currency as any)?.label ?? 'ARS');
      const current = acc[currency] ?? 0;
      acc[currency] = current + Number(account.balance ?? 0);
      return acc;
    }, {});

    return {
      totalBalanceARS: balances['ARS'] ?? 0,
      balancesByCurrency: balances,
      incomesPeriod: incomes,
      expensesPeriod: expenses,
      transactionsCountPeriod: filteredTransactions.length,
    };
  }, [state.accounts, filteredTransactions]);

  const { trendLabels, incomeDataset, expenseDataset } = useMemo(() => {
    const labels: string[] = [];
    const incomePoints: number[] = [];
    const expensePoints: number[] = [];

    if (grouping === 'monthly') {
      const buckets = new Map<string, { income: number; expense: number }>();
      filteredTransactions.forEach(tx => {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) buckets.set(key, { income: 0, expense: 0 });
        const bucket = buckets.get(key)!;
        const signedAmount = toSignedAmount(tx.amount, tx.type_id);
        const amount = Math.abs(signedAmount);
        if (signedAmount >= 0) bucket.income += amount;
        else bucket.expense += amount;
      });
      const orderedKeys = Array.from(buckets.keys()).sort();
      orderedKeys.forEach(key => {
        labels.push(key);
        const bucket = buckets.get(key)!;
        incomePoints.push(bucket.income);
        expensePoints.push(bucket.expense);
      });
    } else {
      const range = period === '10d' ? 10 : period === '30d' ? 30 : 365;
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - (range - 1));
      start.setHours(0, 0, 0, 0);

      const dailyMap = new Map<string, { income: number; expense: number }>();
      for (let i = 0; i < range; i += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = date.toISOString().slice(0, 10);
        dailyMap.set(key, { income: 0, expense: 0 });
      }

      filteredTransactions.forEach(tx => {
        const dateKey = new Date(tx.date).toISOString().slice(0, 10);
        if (!dailyMap.has(dateKey)) return;
        const bucket = dailyMap.get(dateKey)!;
        const signedAmount = toSignedAmount(tx.amount, tx.type_id);
        const amount = Math.abs(signedAmount);
        if (signedAmount >= 0) {
          bucket.income += amount;
        } else {
          bucket.expense += amount;
        }
      });

      labels.push(...Array.from(dailyMap.keys()));
      incomePoints.push(...labels.map(label => dailyMap.get(label)?.income ?? 0));
      expensePoints.push(...labels.map(label => dailyMap.get(label)?.expense ?? 0));
    }

    return { trendLabels: labels, incomeDataset: incomePoints, expenseDataset: expensePoints };
  }, [filteredTransactions, grouping, period]);

  const categorySlices = useMemo(() => {
    const totals = new Map<string, number>();
    filteredTransactions.forEach(tx => {
      const signedAmount = toSignedAmount(tx.amount, tx.type_id);
      if (signedAmount >= 0) return;
      const categoryValue = tx.category;
      const name =
        typeof categoryValue === 'string'
          ? categoryValue
          : categoryValue && typeof categoryValue === 'object'
            ? ((categoryValue as any).description ?? 'Sin categoría')
            : 'Sin categoría';
      const current = totals.get(name) ?? 0;
      totals.set(name, current + Math.abs(signedAmount));
    });

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [filteredTransactions]);

  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [filteredTransactions]
  );

  const doughnutData = useMemo(() => {
    const labels = categorySlices.map(([label]) => label);
    const data = categorySlices.map(([, value]) => value);
    const backgroundColor = labels.map(
      (_, index) => categoryPalette[index % categoryPalette.length]
    );

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => `${color}CC`),
          borderWidth: 1,
        },
      ],
    };
  }, [categorySlices]);

  const lineData = useMemo(
    () => ({
      labels: trendLabels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeDataset,
          fill: true,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Gastos',
          data: expenseDataset,
          fill: true,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    }),
    [trendLabels, incomeDataset, expenseDataset]
  );

  const lineOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#cbd5f5',
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: TooltipItem<'line'>) => {
              const label = tooltipItem.dataset.label ? `${tooltipItem.dataset.label}: ` : '';
              const parsedValue =
                typeof tooltipItem.parsed === 'number'
                  ? tooltipItem.parsed
                  : typeof tooltipItem.parsed.y === 'number'
                    ? tooltipItem.parsed.y
                    : Number(tooltipItem.formattedValue.replace(/[^0-9.-]/g, ''));
              const value = Number.isFinite(parsedValue) ? parsedValue : 0;
              return `${label}${formatCurrency(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#94a3b8',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
        y: {
          ticks: {
            color: '#94a3b8',
            callback: (value: string | number) => formatCurrency(Number(value)),
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
      },
    }),
    []
  );

  return (
    <Container className="py-8 space-y-8">
      <header className="flex flex-col gap-4">
        <Typography variant="h1">Resumen financiero</Typography>
        <Typography variant="body" className="text-[color:var(--text-muted)] max-w-2xl">
          Visualiza el pulso de tus finanzas: saldos consolidados, flujo de caja reciente y
          categorías que más impactan tu presupuesto.
        </Typography>
        <Box className="flex flex-wrap items-end gap-3 text-sm text-slate-200">
          <Box className="w-48">
            <DropMenu
              label="Período"
              options={PERIOD_OPTIONS}
              value={period}
              onValueChange={value => setPeriod((value as typeof period) ?? '30d')}
            />
          </Box>
          {period === 'month' && (
            <Box className="w-44">
              <MonthInput label="Mes" value={selectedMonth} onValueChange={setSelectedMonth} />
            </Box>
          )}
          {period === 'day' && (
            <Box className="w-44">
              <DateInput label="Día" value={selectedDay} onValueChange={setSelectedDay} />
            </Box>
          )}
          <Box className="w-44">
            <DropMenu
              label="Agrupar"
              options={GROUPING_OPTIONS}
              value={grouping}
              onValueChange={value => setGrouping((value as typeof grouping) ?? 'daily')}
            />
          </Box>
          <Box className="ml-auto flex flex-wrap items-center gap-3">
            <Box as="span" className="rounded-full bg-emerald-500/10 px-3 py-1">
              <Typography variant="body" as="span" className="text-xs font-medium text-emerald-300">
                {transactionsCountPeriod} movimientos en el período
              </Typography>
            </Box>
            <ActionButton
              icon="fas fa-rotate"
              text={isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
              onClick={() => loadData()}
            />
          </Box>
        </Box>
      </header>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
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
              title="Gastos del período"
              subtitle="Egresos registrados en el rango seleccionado"
              value={formatCurrency(expensesPeriod)}
              accent="from-rose-500/40 via-rose-400/20 to-rose-500/10"
              icon={<TrendingDown className="h-5 w-5" />}
            />
            <DashboardCard
              title="Movimientos registrados"
              subtitle="Cantidad de transacciones en el rango"
              value={transactionsCountPeriod.toString()}
              accent="from-violet-500/40 via-violet-400/20 to-violet-500/10"
              icon={<Database className="h-5 w-5" />}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <Box className="flex items-center justify-between gap-4 pb-4">
                <Box>
                  <Typography variant="h2">Flujo de ingresos y gastos</Typography>
                  <Typography variant="body" className="text-[color:var(--text-muted)]">
                    Seguimiento visual del flujo financiero en el período seleccionado.
                  </Typography>
                </Box>
              </Box>
              <Box className="h-72 md:h-80">
                <Line data={lineData} options={lineOptions} />
              </Box>
            </Card>

            <Card>
              <Box className="space-y-4">
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h2">Gasto por categoría</Typography>
                    <Typography variant="body" className="text-[color:var(--text-muted)]">
                      Distribución de tus principales categorías de egreso.
                    </Typography>
                  </Box>
                  <Box className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 sm:flex">
                    <BadgeCheck className="h-5 w-5" />
                  </Box>
                </Box>
                <Box className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  <Box className="h-52">
                    <Doughnut
                      data={doughnutData}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: tooltipItem => {
                                const label = doughnutData.labels?.[tooltipItem.dataIndex] ?? '';
                                const value =
                                  doughnutData.datasets[0]?.data?.[tooltipItem.dataIndex] ?? 0;
                                return `${label}: ${formatCurrency(Number(value))}`;
                              },
                            },
                          },
                        },
                        cutout: '65%',
                      }}
                    />
                  </Box>
                  <Box className="space-y-3">
                    {categorySlices.map(([name, value], index) => {
                      const color = categoryPalette[index % categoryPalette.length];
                      const percentage =
                        expensesPeriod > 0 ? Math.round((value / expensesPeriod) * 100) : 0;
                      return (
                        <Box
                          key={name}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                        >
                          <Box className="flex items-center gap-3">
                            <Box
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <Typography variant="body" as="span" className="text-sm text-slate-200">
                              {name}
                            </Typography>
                          </Box>
                          <Typography variant="body" as="span" className="text-xs text-slate-400">
                            {percentage}% · {formatCurrency(value)}
                          </Typography>
                        </Box>
                      );
                    })}
                    {categorySlices.length === 0 && (
                      <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
                        Aún no hay gastos suficientes para mostrar un desglose.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Card>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography variant="h2">Cuentas destacadas</Typography>
                  <Typography variant="body" className="text-[color:var(--text-muted)]">
                    Saldo por moneda (sin conversión)
                  </Typography>
                </Box>
              </Box>
              <Box className="space-y-4">
                {Object.entries(balancesByCurrency).map(([currency, value]) => (
                  <Box
                    key={currency}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                  >
                    <Box className="flex flex-col">
                      <Typography variant="body" as="span" className="text-xs text-muted">
                        {currency}
                      </Typography>
                      <Typography
                        variant="body"
                        as="span"
                        className="text-lg font-semibold text-white"
                      >
                        {formatCurrency(value, currency)}
                      </Typography>
                    </Box>
                    <Typography variant="body" as="span" className="text-xs text-slate-500">
                      {
                        state.accounts.filter(acc => {
                          const accCurrency =
                            typeof acc.currency === 'string'
                              ? acc.currency
                              : ((acc.currency as any)?.label ?? 'ARS');
                          return accCurrency === currency;
                        }).length
                      }{' '}
                      cuentas
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            <Card>
              <Box className="flex items-center justify-between">
                <Typography variant="h2">Transacciones recientes</Typography>
                <AppLink
                  href="/transactions"
                  variant="unstyled"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Ver todas →
                </AppLink>
              </Box>
              <Box className="space-y-3">
                {recentTransactions.map(tx => {
                  const categoryValue = tx.category;
                  const category =
                    typeof categoryValue === 'string'
                      ? categoryValue
                      : categoryValue && typeof categoryValue === 'object'
                        ? ((categoryValue as any).description ?? 'Sin categoría')
                        : 'Sin categoría';
                  const signedAmount = toSignedAmount(tx.amount, tx.type_id);
                  return (
                    <article
                      key={tx.transaction_id}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                    >
                      <Box>
                        <Typography
                          variant="body"
                          as="p"
                          className="text-sm font-medium text-white"
                        >
                          {tx.description ?? category ?? 'Movimiento'}
                        </Typography>
                        <Typography variant="body" as="p" className="text-xs text-muted">
                          {formatDateWithTime(tx.date)}
                        </Typography>
                      </Box>
                      <Box className="text-right">
                        <Typography
                          variant="body"
                          as="p"
                          className={
                            signedAmount >= 0
                              ? 'text-emerald-400 font-semibold'
                              : 'text-accent-400 font-semibold'
                          }
                        >
                          {formatSignedCurrency(signedAmount)}
                        </Typography>
                        <Typography variant="body" as="p" className="text-xs text-slate-500">
                          {category}
                        </Typography>
                      </Box>
                    </article>
                  );
                })}
                {!recentTransactions.length && (
                  <Typography variant="body" as="Box" className="text-sm text-muted">
                    No hay transacciones registradas aún.
                  </Typography>
                )}
              </Box>
            </Card>
          </section>
        </>
      )}
    </Container>
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
          <Typography variant="caption" className="text-muted">
            {subtitle}
          </Typography>
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

function BarIndicator() {
  return (
    <svg
      className="h-5 w-5 text-brand-300"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="2" y="12" width="3" height="6" rx="1.5" opacity="0.45" />
      <rect x="8" y="8" width="3" height="10" rx="1.5" opacity="0.7" />
      <rect x="14" y="4" width="3" height="14" rx="1.5" />
    </svg>
  );
}

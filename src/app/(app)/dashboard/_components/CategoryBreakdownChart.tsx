'use client';

import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BadgeCheck } from 'lucide-react';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import { toSignedAmount } from '@/lib/utils/transactions';

ChartJS.register(ArcElement, Tooltip, Legend);

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

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
  expensesByCurrency: Record<string, number>;
  accountCurrencyMap: Record<string, string>;
}

interface CategorySlice {
  name: string;
  amount: number;
  currency: string;
}

export default function CategoryBreakdownChart({
  transactions,
  expensesByCurrency,
  accountCurrencyMap,
}: CategoryBreakdownChartProps) {
  const totalExpenses = Object.values(expensesByCurrency).reduce((a, b) => a + b, 0);

  const categorySlices = useMemo<CategorySlice[]>(() => {
    const totals = new Map<string, { name: string; amount: number; currency: string }>();
    transactions.forEach(tx => {
      const signedAmount = toSignedAmount(tx.amount, tx.type_id);
      if (signedAmount >= 0) return;
      const currency = accountCurrencyMap?.[tx.account_id] ?? 'ARS';
      const categoryValue = tx.category;
      const name =
        typeof categoryValue === 'string'
          ? categoryValue
          : categoryValue && typeof categoryValue === 'object'
            ? ((categoryValue as any).description ?? 'Sin categoría')
            : 'Sin categoría';
      const key = `${name}::${currency}`;
      if (!totals.has(key)) totals.set(key, { name, amount: 0, currency });
      totals.get(key)!.amount += Math.abs(signedAmount);
    });

    return Array.from(totals.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, accountCurrencyMap]);

  const doughnutData = useMemo(() => {
    const labels = categorySlices.map(s => s.name);
    const data = categorySlices.map(s => s.amount);
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

  return (
    <Card>
      <Box className="space-y-4">
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="h2">Salidas por categoría</Typography>
            {/* <Typography variant="body" className="text-[color:var(--text-muted)]">
              Distribución de tus principales categorías de egreso.
            </Typography> */}
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
                        const value = doughnutData.datasets[0]?.data?.[tooltipItem.dataIndex] ?? 0;
                        const currency = categorySlices[tooltipItem.dataIndex]?.currency ?? 'ARS';
                        return `${label}: ${formatCurrency(Number(value), currency)}`;
                      },
                    },
                  },
                },
                cutout: '65%',
              }}
            />
          </Box>
          <Box className="space-y-3">
            {categorySlices.map((slice, index) => {
              const color = categoryPalette[index % categoryPalette.length];
              const currencyTotal = expensesByCurrency[slice.currency] ?? 0;
              const percentage = currencyTotal > 0 ? Math.round((slice.amount / currencyTotal) * 100) : 0;
              return (
                <Box
                  key={`${slice.name}::${slice.currency}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                >
                  <Box className="flex items-center gap-3">
                    <Box className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <Typography variant="body" as="span" className="text-sm text-slate-200">
                      {slice.name}
                    </Typography>
                  </Box>
                  <Typography variant="body" as="span" className="text-xs text-slate-400">
                    {percentage}% · {formatCurrency(slice.amount, slice.currency)}
                  </Typography>
                </Box>
              );
            })}
            {categorySlices.length === 0 && (
              <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
                Aún no hay salidas suficientes para mostrar un desglose.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

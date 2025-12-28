'use client';

import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import { toSignedAmount } from '@/lib/utils/transactions';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryPalette = [
  '#4ade80',
  '#22d3ee',
  '#3f8aff',
  '#facc15',
  '#9f67ff',
  '#f472b6',
  '#f97316',
  '#fb7185',
];

interface IncomeCategoryBreakdownChartProps {
  transactions: Transaction[];
  totalIncome: number;
}

export default function IncomeCategoryBreakdownChart({
  transactions,
  totalIncome,
}: IncomeCategoryBreakdownChartProps) {
  const categorySlices = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach(tx => {
      const signedAmount = toSignedAmount(tx.amount, tx.type_id);
      if (signedAmount < 0) return;
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
  }, [transactions]);

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

  return (
    <Card>
      <Box className="space-y-4">
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="h2">Ingresos por categoría</Typography>
          </Box>
          <Box className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 sm:flex">
            <TrendingUp className="h-5 w-5" />
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
              const percentage = totalIncome > 0 ? Math.round((value / totalIncome) * 100) : 0;
              return (
                <Box
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                >
                  <Box className="flex items-center gap-3">
                    <Box className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
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
                Aún no hay ingresos suficientes para mostrar un desglose.
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

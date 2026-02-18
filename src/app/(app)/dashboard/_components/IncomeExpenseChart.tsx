'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import { toSignedAmount } from '@/lib/utils/transactions';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  grouping: 'daily' | 'monthly';
  period: '10d' | '30d' | '365d' | 'month' | 'day';
  selectedMonth?: string;
  selectedYear?: string;
  selectedDay?: string;
  accountCurrencyMap?: Record<string, string>;
}

export default function IncomeExpenseChart({
  transactions,
  grouping,
  period,
  selectedMonth,
  selectedYear,
  selectedDay,
}: IncomeExpenseChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [ingresoVisible, setIngresoVisible] = useState(true);
  const [salidaVisible, setSalidaVisible] = useState(true);

  const toggleDataset = (index: number) => {
    const chart = chartRef.current;
    if (!chart) return;
    const newVisible = !chart.isDatasetVisible(index);
    chart.setDatasetVisibility(index, newVisible);
    chart.update();
    if (index === 0) setIngresoVisible(newVisible);
    else setSalidaVisible(newVisible);
  };

  const { labels, incomeDataset, expenseDataset } = useMemo(() => {
    const chartLabels: string[] = [];
    const incomePoints: number[] = [];
    const expensePoints: number[] = [];

    if (grouping === 'monthly') {
      const buckets = new Map<string, { income: number; expense: number }>();
      transactions.forEach(tx => {
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
        chartLabels.push(key);
        const bucket = buckets.get(key)!;
        incomePoints.push(bucket.income);
        expensePoints.push(bucket.expense);
      });
    } else {
      const dailyMap = new Map<string, { income: number; expense: number }>();

      if (period === 'month' && selectedMonth && selectedYear) {
        // Generar slots solo para el mes seleccionado
        const year = Number(selectedYear);
        const month = Number(selectedMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          dailyMap.set(key, { income: 0, expense: 0 });
        }
      } else if (period === 'day' && selectedDay) {
        // Un solo slot para el día seleccionado
        dailyMap.set(selectedDay, { income: 0, expense: 0 });
      } else {
        const range = period === '10d' ? 10 : period === '30d' ? 30 : 365;
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - (range - 1));
        start.setHours(0, 0, 0, 0);
        for (let i = 0; i < range; i += 1) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          const key = date.toISOString().slice(0, 10);
          dailyMap.set(key, { income: 0, expense: 0 });
        }
      }

      transactions.forEach(tx => {
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

      chartLabels.push(...Array.from(dailyMap.keys()));
      incomePoints.push(...chartLabels.map(label => dailyMap.get(label)?.income ?? 0));
      expensePoints.push(...chartLabels.map(label => dailyMap.get(label)?.expense ?? 0));
    }

    return { labels: chartLabels, incomeDataset: incomePoints, expenseDataset: expensePoints };
  }, [transactions, grouping, period, selectedMonth, selectedYear, selectedDay]);

  const lineData = useMemo(
    () => ({
      labels,
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
          label: 'Salidas',
          data: expenseDataset,
          fill: true,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    }),
    [labels, incomeDataset, expenseDataset]
  );

  const lineOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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
          beginAtZero: true,
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
    <Card className="xl:col-span-2">
      <Box className="flex items-center justify-between gap-4 pb-4">
        <Typography variant="h2">Flujo de ingresos y salidas</Typography>
        <Box className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleDataset(0)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-white/10"
            style={{ color: ingresoVisible ? '#22c55e' : '#64748b' }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: ingresoVisible ? '#22c55e' : '#475569' }}
            />
            {ingresoVisible ? 'Ocultar ingresos' : 'Mostrar ingresos'}
          </button>
          <button
            type="button"
            onClick={() => toggleDataset(1)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-white/10"
            style={{ color: salidaVisible ? '#ef4444' : '#64748b' }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: salidaVisible ? '#ef4444' : '#475569' }}
            />
            {salidaVisible ? 'Ocultar salidas' : 'Mostrar salidas'}
          </button>
        </Box>
      </Box>
      <Box className="h-72 md:h-80" style={{ minHeight: '18rem' }}>
        <Line ref={chartRef} data={lineData} options={lineOptions} />
      </Box>
    </Card>
  );
}

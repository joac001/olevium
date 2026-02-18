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
  accountCurrencyMap,
}: IncomeExpenseChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [ingresoVisible, setIngresoVisible] = useState(true);
  const [salidaVisible, setSalidaVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  const availableCurrencies = useMemo(() => {
    const currencies = new Set(Object.values(accountCurrencyMap ?? {}));
    return Array.from(currencies).sort();
  }, [accountCurrencyMap]);

  // Active currency: respect user selection if still valid, else default to first
  const activeCurrency = availableCurrencies.includes(selectedCurrency)
    ? selectedCurrency
    : (availableCurrencies[0] ?? 'ARS');

  const toggleDataset = (index: number) => {
    const chart = chartRef.current;
    if (!chart) return;
    const newVisible = !chart.isDatasetVisible(index);
    chart.setDatasetVisibility(index, newVisible);
    chart.update();
    if (index === 0) setIngresoVisible(newVisible);
    else setSalidaVisible(newVisible);
  };

  // Filter transactions by selected currency before aggregating
  const currencyTransactions = useMemo(() => {
    return transactions.filter(
      tx => (accountCurrencyMap?.[tx.account_id] ?? 'ARS') === activeCurrency
    );
  }, [transactions, activeCurrency, accountCurrencyMap]);

  const { labels, incomeDataset, expenseDataset } = useMemo(() => {
    const chartLabels: string[] = [];
    const incomePoints: number[] = [];
    const expensePoints: number[] = [];

    if (grouping === 'monthly') {
      const buckets = new Map<string, { income: number; expense: number }>();
      currencyTransactions.forEach(tx => {
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
        const year = Number(selectedYear);
        const month = Number(selectedMonth);
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          dailyMap.set(key, { income: 0, expense: 0 });
        }
      } else if (period === 'day' && selectedDay) {
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

      currencyTransactions.forEach(tx => {
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
  }, [currencyTransactions, grouping, period, selectedMonth, selectedYear, selectedDay]);

  const lineData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeDataset,
          fill: true,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#22c55e',
          borderWidth: 2,
        },
        {
          label: 'Salidas',
          data: expenseDataset,
          fill: true,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#ef4444',
          borderWidth: 2,
        },
      ],
    }),
    [labels, incomeDataset, expenseDataset]
  );

  const lineOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: 10,
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
              return `${label}${formatCurrency(value, activeCurrency)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#94a3b8',
            maxTicksLimit: 8,
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            callback: (value: string | number) => formatCurrency(Number(value), activeCurrency),
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
      },
    }),
    [activeCurrency]
  );

  return (
    <Card className="xl:col-span-2">
      <Box className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Typography variant="h2">Flujo de ingresos y salidas</Typography>
        <Box className="flex flex-wrap items-center gap-3">
          {/* Currency pills — only shown when there are multiple currencies */}
          {availableCurrencies.length > 1 && (
            <Box className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
              {availableCurrencies.map(currency => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setSelectedCurrency(currency)}
                  className="rounded-lg px-3 py-1 text-xs font-semibold transition"
                  style={{
                    backgroundColor:
                      activeCurrency === currency ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: activeCurrency === currency ? '#f1f5f9' : '#64748b',
                  }}
                >
                  {currency}
                </button>
              ))}
            </Box>
          )}
          {/* Income/expense toggles */}
          <Box className="flex items-center gap-1">
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
      </Box>
      <Box className="h-72 md:h-80" style={{ minHeight: '18rem' }}>
        <Line ref={chartRef} data={lineData} options={lineOptions} />
      </Box>
    </Card>
  );
}

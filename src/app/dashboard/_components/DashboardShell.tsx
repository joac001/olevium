'use client';

import { useState, useMemo } from 'react';

import {
  Container,
  Box,
  Typography,
  DropMenu,
  DateInput,
} from '@/components/shared/ui';
import type { Transaction } from '@/lib/types';
import type { Account } from '@/types';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import { toSignedAmount } from '@/lib/utils/transactions';

import DashboardStatsCards from './DashboardStatsCards';
import IncomeExpenseChart from './IncomeExpenseChart';
import CategoryBreakdownChart from './CategoryBreakdownChart';
import IncomeCategoryBreakdownChart from './IncomeCategoryBreakdownChart';
import AccountsBalanceList from './AccountsBalanceList';
import RecentTransactionsList from './RecentTransactionsList';

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

const MONTH_OPTIONS: DropMenuOption[] = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

function generateYearOptions(): DropMenuOption[] {
  const currentYear = new Date().getFullYear();
  const options: DropMenuOption[] = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}

const YEAR_OPTIONS = generateYearOptions();

interface DashboardShellProps {
  initialAccounts: Account[];
  initialTransactions: Transaction[];
}

export default function DashboardShell({
  initialAccounts,
  initialTransactions,
}: DashboardShellProps) {
  const [accounts] = useState<Account[]>(initialAccounts);
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<'10d' | '30d' | '365d' | 'month' | 'day'>('365d');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [grouping, setGrouping] = useState<'daily' | 'monthly'>('daily');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (period === '10d') start.setDate(now.getDate() - 9);
    if (period === '30d') start.setDate(now.getDate() - 29);
    if (period === '365d') start.setFullYear(now.getFullYear() - 1);

    if (period === 'month' && selectedMonth && selectedYear) {
      const year = Number(selectedYear);
      const month = Number(selectedMonth);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
      return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
    }

    if (period === 'day' && selectedDay) {
      const dayStart = new Date(selectedDay);
      const dayEnd = new Date(selectedDay);
      dayEnd.setHours(23, 59, 59, 999);
      return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= dayStart && txDate <= dayEnd;
      });
    }

    start.setHours(0, 0, 0, 0);
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= now;
    });
  }, [transactions, period, selectedMonth, selectedYear, selectedDay]);

  const { totalBalanceARS, incomesPeriod, expensesPeriod, transactionsCountPeriod } =
    useMemo(() => {
      let incomes = 0;
      let expenses = 0;

      filteredTransactions.forEach(tx => {
        const signedAmount = toSignedAmount(tx.amount, tx.type_id);
        const amount = Math.abs(signedAmount);
        if (signedAmount >= 0) incomes += amount;
        else expenses += amount;
      });

      const balances = accounts.reduce<Record<string, number>>((acc, account) => {
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
        incomesPeriod: incomes,
        expensesPeriod: expenses,
        transactionsCountPeriod: filteredTransactions.length,
      };
    }, [accounts, filteredTransactions]);

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
              onValueChange={value => setPeriod((value as typeof period) ?? '365d')}
            />
          </Box>
          {period === 'month' && (
            <>
              <Box className="w-36">
                <DropMenu
                  label="Mes"
                  options={MONTH_OPTIONS}
                  value={selectedMonth}
                  onValueChange={value => setSelectedMonth(String(value ?? '1'))}
                />
              </Box>
              <Box className="w-28">
                <DropMenu
                  label="Año"
                  options={YEAR_OPTIONS}
                  value={selectedYear}
                  onValueChange={value => setSelectedYear(String(value ?? new Date().getFullYear()))}
                />
              </Box>
            </>
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
          <Box className="ml-auto">
            <Box as="span" className="rounded-full bg-emerald-500/10 px-3 py-1">
              <Typography variant="body" as="span" className="text-xs font-medium text-emerald-300">
                {transactionsCountPeriod} movimientos en el período
              </Typography>
            </Box>
          </Box>
        </Box>
      </header>

      <DashboardStatsCards
        totalBalanceARS={totalBalanceARS}
        incomesPeriod={incomesPeriod}
        expensesPeriod={expensesPeriod}
        transactionsCount={transactionsCountPeriod}
      />

      <section className="space-y-6">
        <IncomeExpenseChart transactions={filteredTransactions} grouping={grouping} period={period} />
        <Box className="grid gap-6 lg:grid-cols-2">
          <IncomeCategoryBreakdownChart transactions={filteredTransactions} totalIncome={incomesPeriod} />
          <CategoryBreakdownChart transactions={filteredTransactions} totalExpenses={expensesPeriod} />
        </Box>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <AccountsBalanceList accounts={accounts} />
        <RecentTransactionsList transactions={filteredTransactions} />
      </section>
    </Container>
  );
}

'use client';

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

import type { Transaction } from '@/lib/types';
import type { Account } from '@/types';
import type { TransactionSummary } from '@/types';
import { useAccountsQuery } from '@/features/accounts/queries';
import { useDashboardStatsQuery } from '@/features/transactions/queries';
import { toSignedAmount } from '@/lib/utils/transactions';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';

export const PERIOD_OPTIONS: DropMenuOption[] = [
  { value: '10d', label: 'Últimos 10 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '365d', label: 'Último año' },
  { value: 'month', label: 'Mes específico' },
];

export const GROUPING_OPTIONS: DropMenuOption[] = [
  { value: 'daily', label: 'Diario' },
  { value: 'monthly', label: 'Mensual' },
];

export const MONTH_OPTIONS: DropMenuOption[] = [
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

export const YEAR_OPTIONS = generateYearOptions();

type Period = '10d' | '30d' | '365d' | 'month';
type Grouping = 'daily' | 'monthly';

type DateRange = {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
};

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function computeDateRange(
  period: Period,
  selectedMonth: string,
  selectedYear: string
): DateRange {
  const now = new Date();
  const today = toISODate(now);

  if (period === 'month') {
    const year = Number(selectedYear);
    const month = Number(selectedMonth);
    const startDate = toISODate(new Date(year, month - 1, 1));
    const endDate = toISODate(new Date(year, month, 0));
    const prevStartDate = toISODate(new Date(year - 1, month - 1, 1));
    const prevEndDate = toISODate(new Date(year - 1, month, 0));
    return { startDate, endDate, prevStartDate, prevEndDate };
  }

  const daysMap: Record<string, number> = { '10d': 9, '30d': 29, '365d': 364 };
  const days = daysMap[period] ?? 29;

  const start = new Date(now);
  start.setDate(now.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const prevEnd = new Date(start);
  prevEnd.setDate(start.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - days);

  return {
    startDate: toISODate(start),
    endDate: today,
    prevStartDate: toISODate(prevStart),
    prevEndDate: toISODate(prevEnd),
  };
}

type DashboardContextValue = {
  accounts: Account[];
  filteredTransactions: Transaction[];
  accountCurrencyMap: Record<string, string>;
  balances: Record<string, number>;
  incomesByCurrency: Record<string, number>;
  expensesByCurrency: Record<string, number>;
  transactionsCountPeriod: number;
  prevSummary: TransactionSummary | null;
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
  period: Period;
  setPeriod: (v: Period) => void;
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedYear: string;
  setSelectedYear: (v: string) => void;
  grouping: Grouping;
  setGrouping: (v: Grouping) => void;
  effectiveGrouping: Grouping;
  groupingAllowed: boolean;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe usarse dentro de DashboardProvider');
  }
  return context;
}

interface DashboardProviderProps {
  initialAccounts: Account[];
  children: ReactNode;
}

export default function DashboardProvider({
  initialAccounts,
  children,
}: DashboardProviderProps) {
  const now = new Date();
  const [period, setPeriod] = useState<Period>('365d');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  const [grouping, setGrouping] = useState<Grouping>('daily');

  const { startDate, endDate, prevStartDate, prevEndDate } = useMemo(
    () => computeDateRange(period, selectedMonth, selectedYear),
    [period, selectedMonth, selectedYear]
  );

  const { data: accounts = initialAccounts } = useAccountsQuery({ initialData: initialAccounts });
  const { data: dashboardStats } = useDashboardStatsQuery({
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
  });

  // El backend ya devuelve las transacciones filtradas por fecha
  const filteredTransactions: Transaction[] = dashboardStats?.transactions ?? [];

  const groupingAllowed = period === '365d';
  const effectiveGrouping: Grouping = groupingAllowed ? grouping : 'daily';

  const accountCurrencyMap = useMemo<Record<string, string>>(() => {
    return accounts.reduce<Record<string, string>>((acc, account) => {
      acc[String(account.accountId)] = account.currency ?? 'ARS';
      return acc;
    }, {});
  }, [accounts]);

  const { balances, incomesByCurrency, expensesByCurrency, transactionsCountPeriod } =
    useMemo(() => {
      const balancesMap = accounts.reduce<Record<string, number>>((acc, account) => {
        const currency = account.currency ?? 'ARS';
        acc[currency] = (acc[currency] ?? 0) + Number(account.balance ?? 0);
        return acc;
      }, {});

      const incomesMap: Record<string, number> = {};
      const expensesMap: Record<string, number> = {};

      filteredTransactions.forEach(tx => {
        const currency = accountCurrencyMap[tx.account_id] ?? 'ARS';
        const signedAmount = toSignedAmount(tx.amount, tx.type_id);
        const amount = Math.abs(signedAmount);
        if (signedAmount >= 0) {
          incomesMap[currency] = (incomesMap[currency] ?? 0) + amount;
        } else {
          expensesMap[currency] = (expensesMap[currency] ?? 0) + amount;
        }
      });

      return {
        balances: balancesMap,
        incomesByCurrency: incomesMap,
        expensesByCurrency: expensesMap,
        transactionsCountPeriod: filteredTransactions.length,
      };
    }, [accounts, filteredTransactions, accountCurrencyMap]);

  return (
    <DashboardContext.Provider
      value={{
        accounts,
        filteredTransactions,
        accountCurrencyMap,
        balances,
        incomesByCurrency,
        expensesByCurrency,
        transactionsCountPeriod,
        prevSummary: dashboardStats?.prevSummary ?? null,
        startDate,
        endDate,
        prevStartDate,
        prevEndDate,
        period,
        setPeriod,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        grouping,
        setGrouping,
        effectiveGrouping,
        groupingAllowed,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

'use client';

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

import type { Transaction } from '@/lib/types';
import type { Account } from '@/types';
import { useAccountsQuery } from '@/features/accounts/queries';
import { useTransactionsQuery } from '@/features/transactions/queries';
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

type DashboardContextValue = {
  accounts: Account[];
  filteredTransactions: Transaction[];
  accountCurrencyMap: Record<string, string>;
  balances: Record<string, number>;
  incomesByCurrency: Record<string, number>;
  expensesByCurrency: Record<string, number>;
  transactionsCountPeriod: number;
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
  initialTransactions: Transaction[];
  children: ReactNode;
}

export default function DashboardProvider({
  initialAccounts,
  initialTransactions,
  children,
}: DashboardProviderProps) {
  const { data: accounts = initialAccounts } = useAccountsQuery({ initialData: initialAccounts });
  const { data: transactions = initialTransactions } = useTransactionsQuery({ initialData: initialTransactions });

  const now = new Date();
  const [period, setPeriod] = useState<Period>('365d');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));
  const [grouping, setGrouping] = useState<Grouping>('daily');

  const groupingAllowed = period === '365d';
  const effectiveGrouping: Grouping = groupingAllowed ? grouping : 'daily';

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

    start.setHours(0, 0, 0, 0);
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= now;
    });
  }, [transactions, period, selectedMonth, selectedYear]);

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

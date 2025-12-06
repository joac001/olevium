'use client';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { useTransactionsPage } from './TransactionsProvider';

export default function TransactionsSummary() {
  const { summary } = useTransactionsPage();

  const summaryItems = [
    {
      label: 'Ingresos filtrados',
      value: formatCurrency(summary.incomeTotal),
      tone: 'success'
    },
    {
      label: 'Gastos filtrados',
      value: formatCurrency(summary.expenseTotal),
      tone: 'accent'
    },
    {
      label: 'Balance neto',
      value: formatCurrency(summary.netTotal),
      tone: summary.netTotal >= 0 ? 'success' : 'danger'
    },
    {
      label: 'Movimientos',
      value: String(summary.count),
      tone: 'neutral'
    }
  ] as const;

  return (
    <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.label} title={item.label}>
          <Typography variant="subtitle">{item.value}</Typography>
        </Card>
      ))}
    </Box>
  );
}

'use client';

import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, Box, Typography, AppLink } from '@/components/shared/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import { useRecurringTransactionsQuery } from '@/features/recurring-transactions/queries';

const FREQ_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export default function UpcomingRecurrences() {
  const { data } = useRecurringTransactionsQuery();
  const transactions = data?.data ?? [];

  const upcoming = useMemo(() => {
    return transactions
      .filter(t => t.isActive && t.nextRunDate)
      .sort((a, b) => new Date(a.nextRunDate!).getTime() - new Date(b.nextRunDate!).getTime())
      .slice(0, 4);
  }, [transactions]);

  return (
    <Card>
      <Box className="flex items-center justify-between mb-4">
        <Box className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-muted" />
          <Typography variant="h2">Próximos vencimientos</Typography>
        </Box>
        <AppLink
          href="/recurring-transactions"
          variant="unstyled"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
        >
          Ver todos →
        </AppLink>
      </Box>

      {upcoming.length === 0 ? (
        <Typography variant="body" className="text-sm text-muted">
          No hay transacciones recurrentes activas.
        </Typography>
      ) : (
        <Box className="space-y-2">
          {upcoming.map(tx => (
            <Box
              key={tx.recurringTransactionId}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <Box>
                <Typography variant="body" as="p" className="text-sm font-medium text-white">
                  {tx.description ?? FREQ_LABELS[tx.frequency] ?? 'Recurrente'}
                </Typography>
                <Typography variant="caption" as="p" className="text-xs text-muted">
                  {tx.nextRunDate ? formatDate(tx.nextRunDate) : '—'} · {FREQ_LABELS[tx.frequency]}
                </Typography>
              </Box>
              <Typography
                variant="body"
                as="span"
                className={`text-sm font-semibold ${tx.typeId === 2 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {formatCurrency(tx.amount)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}

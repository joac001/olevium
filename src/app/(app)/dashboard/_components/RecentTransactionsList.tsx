'use client';

import { useMemo } from 'react';

import { Card, Box, Typography, AppLink } from '@/components/shared/ui';
import { formatCurrency, formatDateWithTime, formatSignedCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/types';
import { toSignedAmount } from '@/lib/utils/transactions';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export default function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [transactions]
  );

  return (
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
                <Typography variant="body" as="p" className="text-sm font-medium text-white">
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
                      : 'text-rose-400 font-semibold'
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
          <Typography variant="body" as="div" className="text-sm text-muted">
            No hay transacciones registradas aún.
          </Typography>
        )}
      </Box>
    </Card>
  );
}

'use client';

import { useMemo } from 'react';
import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { toSignedAmount } from '@/lib/utils/transactions';
import { useDashboard } from '../_context/DashboardContext';

export default function TopSpendingCategories() {
  const { filteredTransactions: transactions, accountCurrencyMap } = useDashboard();

  const { top3, totalExpenses, mainCurrency } = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number; currency: string; color?: string }>();

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
      const color =
        categoryValue && typeof categoryValue === 'object'
          ? ((categoryValue as any).color ?? undefined)
          : undefined;
      const key = `${name}::${currency}`;
      if (!totals.has(key)) totals.set(key, { name, amount: 0, currency, color });
      totals.get(key)!.amount += Math.abs(signedAmount);
    });

    const sorted = Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
    const top3 = sorted.slice(0, 3);
    const currency = top3[0]?.currency ?? 'ARS';
    const totalExpenses = sorted
      .filter(s => s.currency === currency)
      .reduce((sum, s) => sum + s.amount, 0);

    return { top3, totalExpenses, mainCurrency: currency };
  }, [transactions, accountCurrencyMap]);

  const maxAmount = top3[0]?.amount ?? 1;

  return (
    <Card>
      <Typography variant="h2" className="mb-4">
        Top categorías de gasto
      </Typography>

      {top3.length === 0 ? (
        <Typography variant="body" className="text-sm text-muted">
          Sin salidas registradas en el período.
        </Typography>
      ) : (
        <Box className="space-y-4">
          {top3.map((item, i) => {
            const pct = totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0;
            const barWidth = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            return (
              <Box key={item.name} className="space-y-1">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-2">
                    <Box
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color ?? '#9f67ff' }}
                    />
                    <Typography variant="body" as="span" className="text-sm text-slate-200">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" as="span" className="text-xs text-slate-400">
                    {pct}% · {formatCurrency(item.amount, item.currency)}
                  </Typography>
                </Box>
                <Box className="h-1.5 w-full rounded-full bg-white/10">
                  <Box
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: item.color ?? '#9f67ff',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
          <Typography variant="caption" className="text-xs text-muted pt-1">
            Total salidas {mainCurrency}: {formatCurrency(totalExpenses, mainCurrency)}
          </Typography>
        </Box>
      )}
    </Card>
  );
}

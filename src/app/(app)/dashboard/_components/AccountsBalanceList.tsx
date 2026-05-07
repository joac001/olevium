'use client';

import { useMemo } from 'react';
import { AppLink, Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { useDashboard } from '../_context/DashboardContext';

const ACCOUNT_TYPE_LABELS: Record<number, string> = {
  1: 'Banco',
  2: 'Billetera',
  3: 'Efectivo',
  4: 'Tarjeta',
  5: 'Inversión',
};

export default function AccountsBalanceList() {
  const { accounts } = useDashboard();

  const topAccounts = useMemo(
    () =>
      [...accounts]
        .filter(a => !a.deleted)
        .sort((a, b) => Math.abs(Number(b.balance)) - Math.abs(Number(a.balance)))
        .slice(0, 5),
    [accounts]
  );

  return (
    <Card>
      <Box className="flex items-center justify-between">
        <Typography variant="h2">Tus cuentas</Typography>
        <AppLink
          href="/accounts"
          variant="unstyled"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
        >
          Ver todas →
        </AppLink>
      </Box>

      <Box className="space-y-2">
        {topAccounts.map(account => {
          const balance = Number(account.balance ?? 0);
          const currency = account.currency ?? 'ARS';
          const typeLabel = ACCOUNT_TYPE_LABELS[account.typeId] ?? 'Cuenta';
          return (
            <Box
              key={account.accountId}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <Box className="flex items-center gap-3">
                <Box className="flex flex-col">
                  <Typography variant="body" as="span" className="text-sm font-medium text-white">
                    {account.name}
                  </Typography>
                  <Typography variant="caption" as="span" className="text-xs text-muted">
                    {typeLabel}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body"
                as="span"
                className={`text-sm font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {currency === 'ARS' ? `ARS ${formatCurrency(balance, currency)}` : formatCurrency(balance, currency)}
              </Typography>
            </Box>
          );
        })}
      </Box>

    </Card>
  );
}

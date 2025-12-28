'use client';

import { useMemo } from 'react';

import { Card, Box, Typography } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import type { Account } from '@/types';

interface AccountsBalanceListProps {
  accounts: Account[];
}

export default function AccountsBalanceList({ accounts }: AccountsBalanceListProps) {
  const balancesByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, { total: number; count: number }>>((acc, account) => {
      const currency =
        typeof account.currency === 'string'
          ? account.currency
          : ((account.currency as any)?.label ?? 'ARS');
      const current = acc[currency] ?? { total: 0, count: 0 };
      acc[currency] = {
        total: current.total + Number(account.balance ?? 0),
        count: current.count + 1,
      };
      return acc;
    }, {});
  }, [accounts]);

  return (
    <Card>
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="h2">Cuentas destacadas</Typography>
          {/* <Typography variant="body" className="text-[color:var(--text-muted)]">
            Saldo por moneda (sin conversión)
          </Typography> */}
        </Box>
      </Box>
      <Box className="space-y-4">
        {Object.entries(balancesByCurrency).map(([currency, { total, count }]) => (
          <Box
            key={currency}
            className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
          >
            <Box className="flex flex-col">
              <Typography variant="body" as="span" className="text-xs text-muted">
                {currency}
              </Typography>
              <Typography
                variant="body"
                as="span"
                className={`text-lg font-semibold ${total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {formatCurrency(total, currency)}
              </Typography>
            </Box>
            <Typography variant="body" as="span" className="text-xs text-slate-500">
              {count} {count === 1 ? 'cuenta' : 'cuentas'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

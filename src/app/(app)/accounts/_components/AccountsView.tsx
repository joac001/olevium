'use client';

import { Box, Card, Typography } from '@/components/shared/ui';
import { formatAmount } from '@/lib/utils/parser';
import { useAccountsPage } from '../_context/AccountsContext';
import AccountsTable from './AccountsTable';

export default function AccountsView() {
  const { accounts, accountTypes, balancesByCurrency, handleOpenCreateAccount } = useAccountsPage();

  return (
    <Box className="flex w-full max-w-6xl flex-col gap-6">
      <Card tone="neutral" title="Tus cuentas" className="h-full">
        <Box className="space-y-4">
          <Box className="space-y-3 rounded-2xl bg-[color:var(--surface-accent)] p-4 text-left shadow-sm">
            <Typography
              variant="body"
              className="text-sm uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
            >
              Balances
            </Typography>

            {Object.entries(balancesByCurrency).map(([currency, amount]) => (
              <Box key={currency} className="flex items-center justify-between">
                <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
                  {currency}
                </Typography>
                <Typography variant="h2" className="text-lg font-semibold">
                  {formatAmount(amount, currency)}
                </Typography>
              </Box>
            ))}
          </Box>

          <AccountsTable
            accounts={accounts}
            accountTypes={accountTypes}
            loading={false}
            onAddAccount={handleOpenCreateAccount}
            disableAdd={!accountTypes.length}
          />
        </Box>
      </Card>
    </Box>
  );
}

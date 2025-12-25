'use client';

import { useCallback, useMemo } from 'react';

import { Box, Card, Typography } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { formatAmount } from '@/lib/utils/parser';
import type { Account, AccountType } from '@/types';
import AccountsTable from './AccountsTable';
import CreateAccountForm from './CreateAccountForm';

interface AccountsShellProps {
  initialAccounts: Account[];
  initialAccountTypes: AccountType[];
}

export default function AccountsShell({ initialAccounts, initialAccountTypes }: AccountsShellProps) {
  const { showModal, hideModal } = useModal();
  const accounts = initialAccounts;
  const accountTypes = initialAccountTypes;

  const balancesByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, number>>((accumulator, account) => {
      const currency = typeof account.currency === 'string'
        ? account.currency
        : (account.currency as any)?.label ?? 'Sin moneda';
      accumulator[currency] = (accumulator[currency] ?? 0) + account.balance;
      return accumulator;
    }, {});
  }, [accounts]);

  const handleOpenCreateAccount = useCallback(
    (typeId?: number) => {
      showModal(
        <Card tone="accent" title="Registrar nueva cuenta">
          <CreateAccountForm
            accountTypes={accountTypes}
            loadingTypes={false}
            defaultTypeId={typeId}
            onSuccess={() => {
              hideModal();
            }}
          />
        </Card>
      );
    },
    [accountTypes, hideModal, showModal]
  );

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

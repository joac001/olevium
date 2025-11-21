'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { Box, Card, Typography } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { useAccountsStore } from '@/lib/stores/accounts';
import { formatAmount } from '@/lib/utils/parser';
import { createOperationContext } from '@/lib/utils/errorSystem';
import AccountsTable from './AccountsTable';
import CreateAccountForm from './CreateAccountForm';

export default function AccountsShell() {
  const { showNotification, showError } = useNotification();
  const { showModal, hideModal } = useModal();
  const accounts = useAccountsStore(state => state.accounts);
  const accountTypes = useAccountsStore(state => state.accountTypes);
  const loading = useAccountsStore(state => state.loading);
  const loadingTypes = useAccountsStore(state => state.loadingTypes);
  const fetchAccounts = useAccountsStore(state => state.fetchAccounts);
  const fetchAccountTypes = useAccountsStore(state => state.fetchAccountTypes);

  useEffect(() => {
    fetchAccounts().catch(error => {
      const context = createOperationContext('fetch', 'cuentas', 'las cuentas');
      showError(error, context);
    });

    fetchAccountTypes().catch(error => {
      const context = createOperationContext('fetch', 'tipos de cuentas', 'los tipos de cuentas');
      showError(error, context);
    });
  }, [fetchAccounts, fetchAccountTypes, showNotification, showError]);

  const balancesByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, number>>((accumulator, account) => {
      const currency = account.currency ?? 'Sin moneda';
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
            loadingTypes={loadingTypes}
            defaultTypeId={typeId}
            onSuccess={() => {
              hideModal();
            }}
          />
        </Card>
      );
    },
    [accountTypes, hideModal, loadingTypes, showModal]
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
            loading={loading}
            onAddAccount={handleOpenCreateAccount}
            disableAdd={loadingTypes || !accountTypes.length}
          />
        </Box>
      </Card>
    </Box>
  );
}

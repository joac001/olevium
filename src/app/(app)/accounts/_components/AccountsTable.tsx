'use client';

import { useMemo } from 'react';
import { Box, Typography, ButtonBase, AppLink } from '@/components/shared/ui';
import { formatAmount } from '@/lib/utils/parser';
import type { Account, AccountType } from '@/types';

interface AccountsTableProps {
  accounts: Account[];
  accountTypes: AccountType[];
  loading: boolean;
  onAddAccount?: (typeId: number) => void;
  disableAdd?: boolean;
}

export default function AccountsTable({
  accounts,
  accountTypes,
  loading,
  onAddAccount,
  disableAdd,
}: AccountsTableProps) {
  const hasAccounts = accounts.length > 0;

  const accountsByType = useMemo(() => {
    const byType = new Map<number, Account[]>();
    accounts.forEach(account => {
      const current = byType.get(account.typeId) ?? [];
      current.push(account);
      byType.set(account.typeId, current);
    });
    return byType;
  }, [accounts]);

  if (loading && !hasAccounts) {
    return <Typography variant="body">Cargando tus cuentas...</Typography>;
  }

  return (
    <Box className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {accountTypes.map(type => {
        const list = accountsByType.get(type.typeId) ?? [];
        const totalsByCurrency = list.reduce<Record<string, number>>((acc, account) => {
          const currency = account.currency ?? 'Sin moneda';
          acc[currency] = (acc[currency] ?? 0) + account.balance;
          return acc;
        }, {});

        const totalsLabel = Object.entries(totalsByCurrency)
          .map(
            ([currency, amount]) =>
              `${currency}: ${formatAmount(amount, currency === 'Sin moneda' ? null : currency)}`
          )
          .join(' · ');

        return (
          <Box
            key={type.typeId}
            className="rounded-3xl border border-[color:var(--surface-muted)] p-4 md:p-5"
          >
            <Box className="flex flex-col gap-2">
              <Typography variant="h2" className="text-lg md:text-xl">
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </Typography>
              <Typography variant="caption" className="text-sm text-[color:var(--text-muted)]">
                {totalsLabel || 'Sin cuentas registradas'}
              </Typography>
            </Box>

            <Box className="mt-4 space-y-3">
              <ButtonBase
                htmlType="button"
                onClick={() => onAddAccount?.(type.typeId)}
                disabled={disableAdd}
                fullWidth
                className="!h-16 !rounded-2xl !border-2 !border-dashed !border-[color:var(--color-accent)] !bg-[color:var(--surface-glass)] !p-0 !text-2xl !font-semibold !text-[color:var(--color-accent)] disabled:!cursor-not-allowed disabled:!opacity-40"
                ariaLabel={`Agregar cuenta ${type.name}`}
              >
                <Typography variant="body" as="span" className="text-2xl leading-none">
                  +
                </Typography>
              </ButtonBase>

              {list.map(account => (
                <AppLink
                  key={account.accountId}
                  href={`/accounts/${account.accountId}`}
                  variant="unstyled"
                  className="flex flex-col gap-2 rounded-r-2xl bg-[color:var(--surface-glass)] p-4 border-l-4 border-l-[color:var(--color-secondary-soft)] pl-3 transition-all duration-150 ease-in-out hover:border-l-8 hover:bg-[color:var(--surface-glass-hover)] shadow-md hover:shadow-xl md:rounded-2xl md:border-l-0 md:flex-row md:items-center md:justify-between"
                >
                  <Box className="text-left">
                    <Typography variant="h2" className="text-base md:text-lg">
                      {account.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-xs text-[color:var(--text-muted)]"
                    >
                      {account.currency}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body"
                    className={`text-base font-semibold ${account.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {formatAmount(account.balance, account.currency)}
                  </Typography>
                </AppLink>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

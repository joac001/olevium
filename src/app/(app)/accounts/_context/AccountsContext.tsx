'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { Card } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useAccountsQuery } from '@/features/accounts/queries';
import { formatAmount } from '@/lib/utils/parser';
import type { Account, AccountType } from '@/types';
import CreateAccountForm from '../_components/CreateAccountForm';

type AccountsContextValue = {
  accounts: Account[];
  accountTypes: AccountType[];
  balancesByCurrency: Record<string, number>;
  handleOpenCreateAccount: (typeId?: number) => void;
};

const AccountsContext = createContext<AccountsContextValue | null>(null);

export function useAccountsPage() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccountsPage debe usarse dentro de AccountsProvider');
  }
  return context;
}

interface AccountsProviderProps {
  initialAccounts: Account[];
  initialAccountTypes: AccountType[];
  children: ReactNode;
}

export default function AccountsProvider({
  initialAccounts,
  initialAccountTypes,
  children,
}: AccountsProviderProps) {
  const { showModal, hideModal } = useModal();
  const { data: accounts = initialAccounts } = useAccountsQuery({ initialData: initialAccounts });
  const accountTypes = initialAccountTypes;

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
    <AccountsContext.Provider value={{ accounts, accountTypes, balancesByCurrency, handleOpenCreateAccount }}>
      {children}
    </AccountsContext.Provider>
  );
}

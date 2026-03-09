'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { Card } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { useAccountDetailQuery } from '@/features/accounts/queries';
import { useTransactionsQuery } from '@/features/transactions/queries';
import type { Account, AccountType, AccountTransaction } from '@/types';
import type { Transaction } from '@/lib/types';
import EditAccountForm from '../../_components/EditAccountForm';
import DeleteAccountForm from '../../_components/DeleteAccountForm';
import CreateTransactionForm from '../../_components/CreateTransactionForm';

const PAGE_SIZE = 15;

function normalizeTransaction(tx: Transaction): AccountTransaction {
  const categoryRaw = tx.category;
  const category = categoryRaw
    ? {
        categoryId: categoryRaw.category_id ?? '',
        description: categoryRaw.description ?? '',
        color: categoryRaw.color ?? null,
        transactionType: categoryRaw.transaction_type
          ? {
              typeId: categoryRaw.transaction_type.type_id,
              name: categoryRaw.transaction_type.name,
            }
          : null,
      }
    : null;

  return {
    transactionId: tx.transaction_id,
    accountId: tx.account_id,
    amount: tx.amount,
    typeId: tx.type_id,
    date: tx.date,
    createdAt: tx.created_at,
    categoryId: tx.category_id ?? null,
    category,
    transactionType: tx.transaction_type
      ? {
          typeId: tx.transaction_type.type_id,
          name: tx.transaction_type.name,
        }
      : null,
    typeName: tx.type_name ?? null,
    description: tx.description ?? null,
  };
}

type AccountDetailContextValue = {
  account: Account | undefined;
  accountTypes: AccountType[];
  normalizedTransactions: AccountTransaction[];
  loadingTransactions: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  typeLabel: string;
  handleOpenEdit: () => void;
  handleOpenDelete: () => void;
  handleOpenCreateTransaction: () => void;
};

const AccountDetailContext = createContext<AccountDetailContextValue | null>(null);

export function useAccountDetail() {
  const context = useContext(AccountDetailContext);
  if (!context) {
    throw new Error('useAccountDetail debe usarse dentro de AccountDetailProvider');
  }
  return context;
}

interface AccountDetailProviderProps {
  accountId: string;
  initialAccount: Account;
  initialAccountTypes: AccountType[];
  children: ReactNode;
}

export default function AccountDetailProvider({
  accountId,
  initialAccount,
  initialAccountTypes,
  children,
}: AccountDetailProviderProps) {
  const { showModal, hideModal } = useModal();
  const [page, setPage] = useState(1);

  const { data: account = initialAccount } = useAccountDetailQuery(accountId, { initialData: initialAccount });
  const { data: transactionsResult, isFetching: loadingTransactions } = useTransactionsQuery({
    page,
    limit: PAGE_SIZE,
    accountId,
  });
  const accountTypes = initialAccountTypes;

  const transactions = transactionsResult?.items ?? [];
  const total = transactionsResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const typeLabel = useMemo(() => {
    const type = accountTypes.find(item => item.typeId === account?.typeId);
    return type?.name ?? `Tipo #${account?.typeId ?? ''}`;
  }, [accountTypes, account?.typeId]);

  const normalizedTransactions = useMemo(
    () => transactions.map(normalizeTransaction),
    [transactions]
  );

  const handleOpenEdit = useCallback(() => {
    if (!account) return;
    showModal(
      <Card tone="accent" title="Editar cuenta">
        <EditAccountForm
          account={account}
          accountTypes={accountTypes}
          loadingTypes={false}
          onSuccess={() => hideModal()}
        />
      </Card>
    );
  }, [account, accountTypes, hideModal, showModal]);

  const handleOpenDelete = useCallback(() => {
    if (!account) return;
    showModal(
      <Card tone="danger" title="Eliminar cuenta">
        <DeleteAccountForm
          accountId={account.accountId}
          accountName={account.name}
          onSuccess={() => hideModal()}
        />
      </Card>
    );
  }, [account, hideModal, showModal]);

  const handleOpenCreateTransaction = useCallback(() => {
    if (!account) return;
    showModal(
      <Card tone="accent" title="Registrar transacción">
        <CreateTransactionForm
          accountId={account.accountId}
          onSuccess={() => hideModal()}
        />
      </Card>
    );
  }, [account, hideModal, showModal]);

  return (
    <AccountDetailContext.Provider
      value={{
        account,
        accountTypes,
        normalizedTransactions,
        loadingTransactions,
        page,
        totalPages,
        setPage,
        typeLabel,
        handleOpenEdit,
        handleOpenDelete,
        handleOpenCreateTransaction,
      }}
    >
      {children}
    </AccountDetailContext.Provider>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Card, Typography } from '@/components/shared/ui';
import { formatAmount, formatDate } from '@/lib/utils/parser';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { getAccountDetail, getAccountTransactions } from '@/lib/api';
import type { Account, AccountType, AccountTransaction } from '@/types';
import type { Transaction } from '@/lib/types';
import AccountTransactionsTable from '../../_components/AccountTransactionsTable';
import EditAccountForm from '../../_components/EditAccountForm';
import DeleteAccountForm from '../../_components/DeleteAccountForm';
import CreateTransactionForm from '../../_components/CreateTransactionForm';

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

interface AccountDetailShellProps {
  accountId: string;
  initialAccount: Account;
  initialTransactions: Transaction[];
  initialAccountTypes: AccountType[];
}

export default function AccountDetailShell({
  accountId,
  initialAccount,
  initialTransactions,
  initialAccountTypes,
}: AccountDetailShellProps) {
  const router = useRouter();
  const { showNotification, showError } = useNotification();
  const { showModal, hideModal } = useModal();

  const [account, setAccount] = useState<Account>(initialAccount);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [accountTypes] = useState<AccountType[]>(initialAccountTypes);
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const typeLabel = useMemo(() => {
    const type = accountTypes.find(item => item.typeId === account?.typeId);
    return type?.name ?? `Tipo #${account?.typeId ?? ''}`;
  }, [accountTypes, account?.typeId]);

  const normalizedTransactions = useMemo(
    () => transactions.map(normalizeTransaction),
    [transactions]
  );

  const reloadTransactions = useCallback(async () => {
    if (accountDeleted) return;
    setLoadingTransactions(true);
    try {
      const [{ data: txs }, { data: updatedAccount }] = await Promise.all([
        getAccountTransactions(accountId),
        getAccountDetail(accountId),
      ]);
      setTransactions(txs);
      setAccount(updatedAccount);
    } catch {
      // silencioso — la tabla mantiene los datos anteriores
    } finally {
      setLoadingTransactions(false);
    }
  }, [accountDeleted, accountId]);

  const handleOpenEdit = useCallback(() => {
    if (!account) return;
    showModal(
      <Card tone="accent" title="Editar cuenta">
        <EditAccountForm
          account={account}
          accountTypes={accountTypes}
          loadingTypes={false}
          onSuccess={() => {
            hideModal();
          }}
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
          onSuccess={() => {
            setAccountDeleted(true);
            hideModal();
          }}
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
          onSuccess={() => {
            hideModal();
            reloadTransactions();
          }}
        />
      </Card>
    );
  }, [account, hideModal, reloadTransactions, showModal]);

  if (!account) {
    return (
      <Card tone="neutral" title="Cuenta no disponible">
        <Typography variant="body">No pudimos encontrar los datos de esta cuenta.</Typography>
      </Card>
    );
  }

  const currencyLabel = account.currency ?? 'Sin moneda';

  return (
    <Box className="flex w-full max-w-6xl flex-col gap-6">
      <Card
        tone="neutral"
        title={account.name}
        subtitle={`Saldo actual: ${formatAmount(account.balance, currencyLabel)}`}
        actions={[
          {
            icon: 'fas fa-pen',
            text: 'Editar',
            type: 'primary',
            onClick: handleOpenEdit,
          },
          {
            icon: 'fas fa-trash',
            text: 'Eliminar',
            type: 'danger',
            onClick: handleOpenDelete,
          },
        ]}
      >
        <Box className="space-y-3">
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Tipo de cuenta:{' '}
            <Box as="span" className="font-semibold text-[color:var(--text-primary)]">
              {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
            </Box>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Moneda:{' '}
            <Box as="span" className="font-semibold text-[color:var(--text-primary)]">
              {currencyLabel}
            </Box>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Creada el {formatDate(account.createdAt, 'dd/mm/aaaa')}
          </Typography>
        </Box>
      </Card>

      <Card
        tone="neutral"
        title="Transacciones"
        subtitle="Movimientos asociados a esta cuenta"
        actions={[
          {
            icon: 'fas fa-plus',
            tooltip: 'Agregar transacción',
            type: 'primary',
            onClick: handleOpenCreateTransaction,
          },
        ]}
      >
        <AccountTransactionsTable
          transactions={normalizedTransactions}
          loading={loadingTransactions}
          currency={currencyLabel}
          onRefresh={reloadTransactions}
        />
      </Card>
    </Box>
  );
}

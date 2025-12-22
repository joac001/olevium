'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Card, Typography } from '@/components/shared/ui';
import { formatAmount, formatDate } from '@/lib/utils/parser';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { AccountDetail, AccountTransaction } from '@/types';
import AccountTransactionsTable from '../../_components/AccountTransactionsTable';
import EditAccountForm from '../../_components/EditAccountForm';
import DeleteAccountForm from '../../_components/DeleteAccountForm';
import CreateTransactionForm from '../../_components/CreateTransactionForm';
import AccountDetailCardSkeleton from '../_skeletons/AccountDetailCardSkeleton';
import AccountTransactionsTableSkeleton from '../_skeletons/AccountTransactionsTableSkeleton';

interface AccountDetailShellProps {
  accountId: string;
}

export default function AccountDetailShell({ accountId }: AccountDetailShellProps) {
  const router = useRouter();
  const { showNotification, showError } = useNotification();
  const { showModal, hideModal } = useModal();

  const account = useAccountsStore(state => state.accountDetails[accountId]);
  const accounts = useAccountsStore(state => state.accounts);
  const accountTypes = useAccountsStore(state => state.accountTypes);
  const accountTransactionsMap = useTransactionsStore(state => state.accountTransactions);
  const transactions = accountTransactionsMap[accountId] ?? [];

  const fetchAccountDetail = useAccountsStore(state => state.fetchAccountDetail);
  const fetchAccountTypes = useAccountsStore(state => state.fetchAccountTypes);
  const fetchAccountTransactions = useTransactionsStore(state => state.fetchAccountTransactions);

  const [loadingDetail, setLoadingDetail] = useState(!account);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(!accountTypes.length);
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  const fallbackAccount = useMemo(
    () => accounts.find(item => item.accountId === accountId),
    [accountId, accounts]
  );

  const resolvedAccount: AccountDetail | null = account ?? fallbackAccount ?? null;
  useEffect(() => {
    setAccountDeleted(false);
  }, [accountId]);

  useEffect(() => {
    // No intentar recargar si la cuenta fue eliminada del store y no existe en fallback
    // También verificar que tengamos datos iniciales o que estemos en carga inicial
    const shouldFetch =
      !accountDeleted && !account && !fallbackAccount && !accountNotFound && !loadingDetail;

    if (accountDeleted) {
      return;
    }

    if (shouldFetch) {
      setLoadingDetail(true);
      fetchAccountDetail(accountId)
        .catch(error => {
          setAccountNotFound(true);
          // Solo mostrar error y navegar si no estamos en proceso de eliminación
          if (!fallbackAccount) {
            const context = createOperationContext('fetch', 'cuenta', 'la cuenta');
            showError(error, context);
            router.replace('/accounts');
          }
        })
        .finally(() => setLoadingDetail(false));
    } else if (account || fallbackAccount) {
      setLoadingDetail(false);
    }
  }, [
    account,
    accountId,
    accountNotFound,
    fallbackAccount,
    fetchAccountDetail,
    loadingDetail,
    router,
    showNotification,
    showError,
  ]);

  const reloadTransactions = useCallback(() => {
    if (accountDeleted) return;
    setLoadingTransactions(true);
    fetchAccountTransactions(accountId)
      .catch(error => {
        const context = createOperationContext('fetch', 'transacciones', 'las transacciones');
        showError(error, context);
      })
      .finally(() => setLoadingTransactions(false));
  }, [accountDeleted, accountId, fetchAccountTransactions, showNotification, showError]);

  useEffect(() => {
    reloadTransactions();
  }, [reloadTransactions]);

  useEffect(() => {
    if (!accountTypes.length) {
      setLoadingTypes(true);
      fetchAccountTypes()
        .catch(error => {
          const context = createOperationContext(
            'fetch',
            'tipos de cuentas',
            'los tipos de cuentas'
          );
          showError(error, context);
        })
        .finally(() => setLoadingTypes(false));
    } else {
      setLoadingTypes(false);
    }
  }, [accountTypes.length, fetchAccountTypes, showNotification, showError]);

  const typeLabel = useMemo(() => {
    const type = accountTypes.find(item => item.typeId === resolvedAccount?.typeId);
    return type?.name ?? `Tipo #${resolvedAccount?.typeId ?? ''}`;
  }, [accountTypes, resolvedAccount?.typeId]);

  const handleOpenEdit = useCallback(() => {
    if (!resolvedAccount) return;
    showModal(
      <Card tone="accent" title="Editar cuenta">
        <EditAccountForm
          account={resolvedAccount}
          accountTypes={accountTypes}
          loadingTypes={loadingTypes}
          onSuccess={() => {
            hideModal();
          }}
        />
      </Card>
    );
  }, [accountTypes, hideModal, loadingTypes, resolvedAccount, showModal]);

  const handleOpenDelete = useCallback(() => {
    if (!resolvedAccount) return;
    showModal(
      <Card tone="danger" title="Eliminar cuenta">
        <DeleteAccountForm
          accountId={resolvedAccount.accountId}
          accountName={resolvedAccount.name}
          onSuccess={() => {
            setAccountDeleted(true);
            hideModal();
          }}
        />
      </Card>
    );
  }, [hideModal, resolvedAccount, showModal]);

  const handleOpenCreateTransaction = useCallback(() => {
    if (!resolvedAccount) return;
    showModal(
      <Card tone="accent" title="Registrar transacción">
        <CreateTransactionForm
          accountId={resolvedAccount.accountId}
          onSuccess={() => {
            hideModal();
            reloadTransactions();
          }}
        />
      </Card>
    );
  }, [hideModal, reloadTransactions, resolvedAccount, showModal]);

  const showAccountCardSkeleton = loadingDetail && !resolvedAccount;
  const accountUnavailable = !loadingDetail && !resolvedAccount;
  const showTransactionsSkeleton = loadingTransactions && !transactions.length;

  if (accountUnavailable) {
    return (
      <Card tone="neutral" title="Cuenta no disponible">
        <Typography variant="body">No pudimos encontrar los datos de esta cuenta.</Typography>
      </Card>
    );
  }

  return (
    <Box className="flex w-full max-w-6xl flex-col gap-6">
      {showAccountCardSkeleton || !resolvedAccount ? (
        <AccountDetailCardSkeleton />
      ) : (
        <Card
          tone="neutral"
          title={resolvedAccount.name}
          subtitle={`Saldo actual: ${formatAmount(resolvedAccount.balance, resolvedAccount.currency)}`}
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
                {resolvedAccount.currency ?? 'Sin moneda'}
              </Box>
            </Typography>
            <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
              Creada el {formatDate(resolvedAccount.createdAt, 'dd/mm/aaaa')}
            </Typography>
          </Box>
        </Card>
      )}

      {showTransactionsSkeleton ? (
        <AccountTransactionsTableSkeleton />
      ) : resolvedAccount ? (
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
            transactions={transactions as AccountTransaction[]}
            loading={loadingTransactions}
            currency={resolvedAccount.currency}
            onRefresh={reloadTransactions}
          />
        </Card>
      ) : null}
    </Box>
  );
}

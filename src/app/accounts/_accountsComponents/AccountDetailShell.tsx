'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Box, Card, Typography } from "@/components/shared/ui";
import { useNotification } from "@/context/NotificationContext";
import { useModal } from "@/context/ModalContext";
import { useAccountsStore } from "@/lib/stores/accounts";
import { useTransactionsStore } from "@/lib/stores/transactions";
import type { AccountDetail, AccountTransaction } from "@/types";
import AccountTransactionsTable from "./AccountTransactionsTable";
import EditAccountForm from "./EditAccountForm";
import DeleteAccountForm from "./DeleteAccountForm";
import CreateTransactionForm from "./CreateTransactionForm";

interface AccountDetailShellProps {
  accountId: number;
}

export default function AccountDetailShell({ accountId }: AccountDetailShellProps) {
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showModal, hideModal } = useModal();

  const account = useAccountsStore((state) => state.accountDetails[accountId]);
  const accounts = useAccountsStore((state) => state.accounts);
  const accountTypes = useAccountsStore((state) => state.accountTypes);
  const accountTransactionsMap = useTransactionsStore((state) => state.accountTransactions);
  const transactionTypes = useTransactionsStore((state) => state.transactionTypes);
  const categories = useTransactionsStore((state) => state.categories);
  const transactions = accountTransactionsMap[accountId] ?? [];

  const fetchAccountDetail = useAccountsStore((state) => state.fetchAccountDetail);
  const fetchAccountTypes = useAccountsStore((state) => state.fetchAccountTypes);
  const fetchAccountTransactions = useTransactionsStore((state) => state.fetchAccountTransactions);

  const [loadingDetail, setLoadingDetail] = useState(!account);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingTypes, setLoadingTypes] = useState(!accountTypes.length);

  const fallbackAccount = useMemo(() => accounts.find((item) => item.accountId === accountId), [accountId, accounts]);

  const resolvedAccount: AccountDetail | null = account ?? fallbackAccount ?? null;

  useEffect(() => {
    if (!account) {
      setLoadingDetail(true);
      fetchAccountDetail(accountId)
        .catch((error) => {
          const message = error instanceof Error ? error.message : "No pudimos obtener la cuenta.";
          showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al cargar cuenta", message);
          router.replace("/accounts");
        })
        .finally(() => setLoadingDetail(false));
    } else {
      setLoadingDetail(false);
    }
  }, [account, accountId, fetchAccountDetail, router, showNotification]);

  useEffect(() => {
    setLoadingTransactions(true);
    fetchAccountTransactions(accountId)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "No pudimos obtener las transacciones.";
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al cargar transacciones", message);
      })
      .finally(() => setLoadingTransactions(false));
  }, [accountId, fetchAccountTransactions, showNotification]);

  useEffect(() => {
    if (!accountTypes.length) {
      setLoadingTypes(true);
      fetchAccountTypes()
        .catch((error) => {
          const message = error instanceof Error ? error.message : "No pudimos cargar los tipos de cuenta.";
          showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al cargar tipos", message);
        })
        .finally(() => setLoadingTypes(false));
    } else {
      setLoadingTypes(false);
    }
  }, [accountTypes.length, fetchAccountTypes, showNotification]);



  const typeLabel = useMemo(() => {
    const type = accountTypes.find((item) => item.typeId === resolvedAccount?.typeId);
    return type?.name ?? `Tipo #${resolvedAccount?.typeId ?? ""}`;
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
      </Card>,
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
            hideModal();
          }}
        />
      </Card>,
    );
  }, [hideModal, resolvedAccount, showModal]);

  const handleOpenCreateTransaction = useCallback(() => {
    if (!resolvedAccount) return;
    showModal(
      <Card tone="accent" title="Registrar transacción">
        <CreateTransactionForm
          accountId={resolvedAccount.accountId}
          transactionTypes={transactionTypes}
          categories={categories}
          onSuccess={() => {
            hideModal();
            fetchAccountTransactions(resolvedAccount.accountId).catch((error) => {
              const message = error instanceof Error ? error.message : "No pudimos actualizar las transacciones.";
              showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al refrescar", message);
            });
          }}
        />
      </Card>,
    );
  }, [categories, fetchAccountTransactions, hideModal, resolvedAccount, showModal, transactionTypes, showNotification]);

  if (loadingDetail || !resolvedAccount) {
    return (
      <Card tone="neutral" title="Cargando cuenta">
        <Typography variant="body">Obteniendo información de la cuenta...</Typography>
      </Card>
    );
  }

  return (
    <Box className="flex w-full max-w-6xl flex-col gap-6">
      <Card
        tone="neutral"
        title={resolvedAccount.name}
        subtitle={`Saldo actual: ${new Intl.NumberFormat("es-AR", {
          style: resolvedAccount.currency ? "currency" : "decimal",
          currency: resolvedAccount.currency ?? "ARS",
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(resolvedAccount.balance)}`}
        actions={[
          {
            icon: "fas fa-pen",
            text: "Editar",
            type: "primary",
            onClick: handleOpenEdit,
          },
          {
            icon: "fas fa-trash",
            text: "Eliminar",
            type: "danger",
            onClick: handleOpenDelete,
          },
        ]}
      >
        <Box className="space-y-3">
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Tipo de cuenta: <span className="font-semibold text-[color:var(--text-primary)]">{typeLabel}</span>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Moneda: <span className="font-semibold text-[color:var(--text-primary)]">{resolvedAccount.currency ?? "Sin moneda"}</span>
          </Typography>
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            Creada el {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(resolvedAccount.createdAt))}
          </Typography>
        </Box>
      </Card>

      <Card
        tone="neutral"
        title="Transacciones"
        subtitle="Movimientos asociados a esta cuenta"
        actions={[
          {
            icon: "fas fa-plus",
            tooltip: "Agregar transacción",
            type: "primary",
            onClick: handleOpenCreateTransaction,
          },
        ]}
      >
        <AccountTransactionsTable
          transactions={transactions as AccountTransaction[]}
          loading={loadingTransactions}
          currency={resolvedAccount.currency}
        />
      </Card>
    </Box>
  );
}

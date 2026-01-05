'use client';

import { Card, Box, Typography, ActionButton, Skeleton } from '@/components/shared/ui';
import { formatCurrency, formatDate, formatAccountName } from '@/lib/format';
import { toSignedAmount } from '@/lib/utils/transactions';
import type { Category, Transaction } from '@/lib/types';
import type { Account } from '@/types';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: Record<string, Account>;
  categories: Record<string, Category>;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => Promise<void>;
}

export default function TransactionsTable({
  transactions,
  accounts: accountDictionary,
  categories: categoryDictionary,
  onEditTransaction: handleEditTransaction,
  onDeleteTransaction: handleDeleteTransaction,
}: TransactionsTableProps) {
  const isLoading = false; // Ya no hay loading porque los datos vienen del servidor
  const filteredTransactions = transactions;
  const summary = { count: transactions.length };

  return (
    <Card title="Detalle de movimientos" subtitle={`${summary.count} registros filtrados`}>
      <Box className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Cuenta</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[color:var(--text-secondary)]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`sk-row-${idx}`}>
                  <td className="px-4 py-4">
                    <Skeleton width="96px" height="16px" rounded="0.375rem" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton width="160px" height="16px" rounded="0.375rem" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton width="112px" height="16px" rounded="0.375rem" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton width="144px" height="16px" rounded="0.375rem" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton width="80px" height="16px" rounded="0.375rem" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton width="96px" height="16px" rounded="0.375rem" />
                  </td>
                </tr>
              ))
            ) : filteredTransactions.length ? (
              filteredTransactions.map((tx) => {
                const account = accountDictionary[String(tx.account_id)];
                const accountLabel =
                  account?.name ??
                  (tx as any)?.account?.name ??
                  `Cuenta ${tx.account_id}`;
                const signedAmount = toSignedAmount(tx.amount, tx.type_id);
                const isIncome = signedAmount >= 0;
                const categoryValue = tx.category;
                const category =
                  typeof categoryValue === 'string'
                    ? categoryValue
                    : categoryValue && typeof categoryValue === 'object'
                      ? (categoryValue as any).description ?? 'Sin categoría'
                      : categoryDictionary[String(tx.category_id)]?.description ?? 'Sin categoría';
                const currency = account?.currency ?? 'ARS';

                return (
                  <tr key={tx.transaction_id} className="transition hover:bg-white/5">
                    <td className="px-4 py-3 text-[color:var(--text-muted)]">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                      {tx.description ?? 'Sin descripción'}
                    </td>
                    <td className="px-4 py-3">{category}</td>
                    <td className="px-4 py-3">{accountLabel}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        isIncome ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-danger)]'
                      }`}
                    >
                      {formatCurrency(signedAmount, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Box className="flex justify-end gap-2">
                        <ActionButton
                          icon="fas fa-pen-to-square"
                          type="accent"
                          text="Editar"
                          onClick={() => handleEditTransaction(tx)}
                        />
                        <ActionButton
                          icon="fas fa-trash"
                          type="danger"
                          text="Eliminar"
                          onClick={() => handleDeleteTransaction(tx)}
                        />
                      </Box>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">
                  No hay transacciones que coincidan con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Card>
  );
}

'use client';

import { Card, Box, Typography, ActionButton } from '@/components/shared/ui';
import { formatCurrency, formatDate, formatAccountName } from '@/lib/format';
import { useTransactionsPage } from './TransactionsProvider';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

export default function TransactionsTable() {
  const {
    isLoading,
    filteredTransactions,
    accountDictionary,
    categoryDictionary,
    summary,
    handleEditTransaction,
    handleDeleteTransaction
  } = useTransactionsPage();

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
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center">
                  Cargando movimientos...
                </td>
              </tr>
            ) : filteredTransactions.length ? (
              filteredTransactions.map((tx) => {
                const account = accountDictionary[String(tx.account_id)];
                const accountLabel =
                  account?.name ??
                  (tx as any)?.account?.name ??
                  `Cuenta ${tx.account_id}`;
                const isIncome = tx.type_id === INCOME_TYPE_ID || tx.amount > 0;
                const categoryValue = tx.category;
                const category =
                  typeof categoryValue === 'string'
                    ? categoryValue
                    : categoryValue && typeof categoryValue === 'object'
                      ? (categoryValue as any).description ?? 'Sin categoría'
                      : categoryDictionary[String(tx.category_id)]?.description ?? 'Sin categoría';
                const currency =
                  typeof account?.currency === 'string'
                    ? account?.currency
                    : account?.currency?.label ?? 'ARS';

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
                      {formatCurrency(tx.amount, currency)}
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

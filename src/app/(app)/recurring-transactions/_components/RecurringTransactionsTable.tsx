'use client';

import { Card, Box, ActionButton } from '@/components/shared/ui';
import { useRecurringTransactionsPage } from './RecurringTransactionsShell';
import { formatCurrency, formatDate } from '@/lib/format';
import { toSignedAmount } from '@/lib/utils/transactions';

export default function RecurringTransactionsTable() {
  const {
    recurringTransactions,
    handleEditRecurringTransaction,
    handleDeleteRecurringTransaction,
  } = useRecurringTransactionsPage();

  return (
    <Card title="Tus transacciones recurrentes" subtitle={`${recurringTransactions.length} programadas`}>
      <Box className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Frecuencia</th>
              <th className="px-4 py-3 text-left">Próxima ejecución</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[color:var(--text-secondary)]">
            {recurringTransactions.length ? (
              recurringTransactions.map((transaction) => {
                const signedAmount = toSignedAmount(transaction.amount, transaction.type_id);
                const isIncome = signedAmount >= 0;
                return (
                <tr key={transaction.recurring_transaction_id} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                    {transaction.description}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${isIncome ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-danger)]'}`}>
                    {formatCurrency(signedAmount)}
                  </td>
                  <td className="px-4 py-3">{transaction.frequency}</td>
                  <td className="px-4 py-3">{transaction.next_run_date ? formatDate(transaction.next_run_date) : '-'}</td>
                  <td className="px-4 py-3">
                    <Box className="flex justify-end gap-2">
                      <ActionButton
                        icon="fas fa-pen-to-square"
                        type="accent"
                        text="Editar"
                        onClick={() => handleEditRecurringTransaction(transaction)}
                      />
                      <ActionButton
                        icon="fas fa-trash"
                        type="danger"
                        text="Eliminar"
                        onClick={() => handleDeleteRecurringTransaction(transaction)}
                      />
                    </Box>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  Todavía no creaste transacciones recurrentes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Card>
  );
}

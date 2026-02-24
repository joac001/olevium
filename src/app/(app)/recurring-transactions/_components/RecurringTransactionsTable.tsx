'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Card, Box, ActionButton } from '@/components/shared/ui';
import { useRecurringTransactionsPage } from '../_context/RecurringTransactionsContext';
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
                const signedAmount = toSignedAmount(transaction.amount, transaction.typeId);
                const isIncome = signedAmount >= 0;
                return (
                <tr key={transaction.recurringTransactionId} className="transition hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                    {transaction.description}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${isIncome ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-danger)]'}`}>
                    {formatCurrency(Math.abs(signedAmount))}
                  </td>
                  <td className="px-4 py-3">{transaction.frequency}</td>
                  <td className="px-4 py-3">{transaction.nextRunDate ? formatDate(transaction.nextRunDate) : '-'}</td>
                  <td className="px-4 py-3">
                    <Box className="flex justify-end gap-2">
                      <ActionButton
                        icon={<Pencil className="h-4 w-4" />}
                        type="accent"
                        text="Editar"
                        onClick={() => handleEditRecurringTransaction(transaction)}
                      />
                      <ActionButton
                        icon={<Trash2 className="h-4 w-4" />}
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

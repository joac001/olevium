'use client';

import { useMemo } from "react";

import { Box, Typography } from "@/components/shared/ui";
import { formatAmount, formatDate } from "@/lib/utils/parser";
import type { AccountTransaction } from "@/types";

interface AccountTransactionsTableProps {
  transactions: AccountTransaction[];
  loading: boolean;
  currency: string | null;
}

export default function AccountTransactionsTable({ transactions, loading, currency }: AccountTransactionsTableProps) {
  const hasTransactions = transactions.length > 0;
  const ordered = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions],
  );
  const currentYear = new Date().getFullYear();

  if (loading && !hasTransactions) {
    return <Typography variant="body">Cargando movimientos...</Typography>;
  }

  if (!hasTransactions) {
    return (
      <Box className="rounded-2xl border border-dashed border-[color:var(--surface-muted)] p-8 text-center">
        <Typography variant="body" className="text-[color:var(--text-muted)]">
          Esta cuenta todavía no tiene movimientos registrados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-3 p-4 overflow-hidden rounded-3xl border border-[color:var(--surface-muted)]">
      <Box className="hidden md:grid md:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:justify-center md:bg-[color:var(--surface-glass)] md:px-4 md:py-3 md:text-xs md:font-semibold md:uppercase md:tracking-[0.22em] md:text-[color:var(--text-muted)] md:rounded-2xl">
        <span>Concepto</span>
        <span>Categoría</span>
        <span>Fecha</span>
        <span>Monto</span>
      </Box>

      {ordered.map((transaction) => {
        const isCurrentYear = new Date(transaction.date).getFullYear() === currentYear;
        const formattedDate = formatDate(transaction.date, isCurrentYear ? "dd/mm" : "dd/mm/aa");
        const isCredit = transaction.typeId === 2;
        const amountClass = isCredit ? "[color:var(--color-success-light)]" : "[color:var(--color-danger-light)]";
        const description = transaction.description && transaction.description.trim().length ? transaction.description : "-";

        return (
          <Box
            key={transaction.transactionId}
            className="rounded-2xl bg-[color:var(--surface-glass)] p-4 shadow-md"
          >
            <Box className="flex flex-col gap-3 md:hidden">
              <Box className="flex items-start justify-between gap-4">
                <div>
                  <Typography variant="caption" className="text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Concepto
                  </Typography>
                  <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                    {description}
                  </Typography>
                </div>
                <Typography variant="body" className={`text-sm font-semibold ${amountClass}`}>
                  {formatAmount(transaction.amount, currency)}
                </Typography>
              </Box>

              <Box className="flex flex-wrap gap-4">
                <Box>
                  <Typography variant="caption" className="text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Categoría
                  </Typography>
                  <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                    {transaction.category ?? "Sin categoría"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" className="text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Fecha
                  </Typography>
                  <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="hidden md:grid md:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-center md:text-left md:justify-center md:px-4 md:py-3 md:rounded-2xl md:hover:bg-[color:var(--surface-glass-hover)]">
              <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                {description}
              </Typography>
              <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                {transaction.category ?? "Sin categoría"}
              </Typography>
              <Typography variant="caption" className="text-xs text-[color:var(--text-muted)]">
                {formattedDate}
              </Typography>
              <Typography variant="body" className={`text-base font-semibold ${amountClass}`}>
                {formatAmount(transaction.amount, currency)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

'use client';

import { useMemo } from "react";

import { Box, Typography } from "@/components/shared/ui";
import { formatAmount, formatDate } from "@/lib/utils/parser";
import type { AccountTransaction } from "@/types";
import { useTransactionsStore } from "@/lib/stores/transactions";

interface AccountTransactionsTableProps {
  transactions: AccountTransaction[];
  loading: boolean;
  currency: string | null;
}

export default function AccountTransactionsTable({ transactions, loading, currency }: AccountTransactionsTableProps) {
  const hasTransactions = transactions.length > 0;

  const { categories, transactionTypes } = useTransactionsStore();

  const ordered = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions],
  );

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
    <Box className="space-y-2 p-4 overflow-hidden rounded-3xl border border-[color:var(--surface-muted)]">
      {/* HEADER */}
      <Box className="grid grid-cols-5 items-center text-left justify-center bg-[color:var(--surface-glass)] text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
        <span>Concepto</span>
        <span>Categoría</span>
        <span>Fecha</span>
        <span>Monto</span>
      </Box>

      {/* DATA */}
      <Box className="">
        {ordered.map((transaction) => {
          return (
            <Box
              key={transaction.transactionId}
              className="grid grid-cols-5 items-center text-left justify-center transition-colors duration-150 hover:bg-[color:var(--surface-glass-hover)]"
            >
              {transaction.description ? (
                <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                  {transaction.description}
                </Typography>
              ) : (
                <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
                  -
                </Typography>
              )}
              <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                {transaction.category ?? "Sin categoría"}
              </Typography>
              <Typography variant="caption" className="text-xs text-[color:var(--text-muted)]">
                {new Date(transaction.date).getFullYear() === new Date().getFullYear() 
                  ? formatDate(transaction.date, "dd/mm") 
                  : formatDate(transaction.date, "dd/mm/aa")}
              </Typography>
              <Typography
                variant="body"
                className={`text-base font-semibold ${transaction.typeId === 2 ? "[color:var(--color-success-light)]" : "[color:var(--color-danger-light)]"}`}
              >
                {formatAmount(transaction.amount, currency)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

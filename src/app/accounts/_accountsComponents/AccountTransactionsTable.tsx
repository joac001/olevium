'use client';

import { useMemo } from "react";

import { Box, Typography } from "@/components/shared/ui";
import type { AccountTransaction } from "@/types";

interface AccountTransactionsTableProps {
  transactions: AccountTransaction[];
  loading: boolean;
  currency: string | null;
}

const formatAmount = (value: number, currency: string | null) => {
  const normalized = currency && currency.length === 3 ? currency : undefined;
  return new Intl.NumberFormat("es-AR", {
    style: normalized ? "currency" : "decimal",
    currency: normalized ?? "ARS",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(isoDate));
  } catch {
    return "";
  }
};

export default function AccountTransactionsTable({ transactions, loading, currency }: AccountTransactionsTableProps) {
  const hasTransactions = transactions.length > 0;

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

  // TODO: Hacer esta tabla responsive para pantallas chicas
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
          // TODO: Cambiar a que use si es entrada o salida porque seimpre se muestran como numeros positivos
          const isPositive = transaction.amount >= 0;
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
                  Sin descripción
                </Typography>
              )}
              <Typography variant="body" className="text-sm text-[color:var(--text-primary)]">
                {transaction.category ?? "Sin categoría"}
              </Typography>
              <Typography variant="caption" className="text-xs text-[color:var(--text-muted)]">
                {formatDate(transaction.date)}
              </Typography>
              <Typography
                variant="body"
                className={`text-base font-semibold ${isPositive ? "[color:var(--color-success-light)]" : "[color:var(--color-error-light)]"}`}
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

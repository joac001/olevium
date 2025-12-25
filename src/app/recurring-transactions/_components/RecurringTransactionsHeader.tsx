'use client';

import { ActionButton, Box, Typography } from '@/components/shared/ui';
import { useRecurringTransactionsPage } from './RecurringTransactionsShell';

export default function RecurringTransactionsHeader() {
  const { handleCreateRecurringTransaction } = useRecurringTransactionsPage();

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Transacciones Recurrentes</Typography>
        <Typography variant="body">
          Automatizá tus ingresos y salidas fijas para tener un mejor control de tus finanzas.
        </Typography>
      </Box>
      <ActionButton
        icon="fas fa-plus"
        type="primary"
        text="Nueva transacción recurrente"
        onClick={handleCreateRecurringTransaction}
      />
    </Box>
  );
}

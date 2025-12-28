'use client';

import { ActionButton, Box, Typography } from '@/components/shared/ui';

interface TransactionsHeaderProps {
  onCreateTransaction: () => void;
}

export default function TransactionsHeader({ onCreateTransaction }: TransactionsHeaderProps) {
  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Transacciones</Typography>
        <Typography variant="body">
          Filtrá ingresos y salidas, detectá patrones y exportá información clave para entender tus
          hábitos financieros.
        </Typography>
      </Box>
      <ActionButton
        icon="fas fa-plus"
        type="primary"
        text="Nueva transacción"
        onClick={onCreateTransaction}
      />
    </Box>
  );
}

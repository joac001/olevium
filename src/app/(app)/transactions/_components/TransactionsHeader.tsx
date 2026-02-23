'use client';

import { ActionButton, Box, Typography } from '@/components/shared/ui';
import { useTransactionsPage } from '../_context/TransactionsContext';

export default function TransactionsHeader() {
  const { handleCreateTransaction, handleExportCsv, isExporting } = useTransactionsPage();

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Transacciones</Typography>
        <Typography variant="body">
          Filtrá ingresos y salidas, detectá patrones y exportá información clave para entender tus
          hábitos financieros.
        </Typography>
      </Box>
      <Box className="flex flex-wrap items-center gap-2">
        <ActionButton
          icon="fas fa-plus"
          type="primary"
          text="Nueva transacción"
          onClick={handleCreateTransaction}
        />
        <ActionButton
          icon="fas fa-file-arrow-down"
          type="accent"
          text={isExporting ? 'Exportando...' : 'Exportar CSV'}
          onClick={handleExportCsv}
          disabled={isExporting}
        />
      </Box>
    </Box>
  );
}

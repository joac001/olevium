'use client';

import { ActionButton, Banner, Box, Typography } from '@/components/shared/ui';
import { useTransactionsPage } from './TransactionsProvider';

export default function TransactionsHeader() {
  const { usingMockData, handleCreateTransaction, handleExportCsv, isExporting } =
    useTransactionsPage();

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Transacciones</Typography>
        <Typography variant="body">
          Filtrá ingresos y gastos, detectá patrones y exportá información clave para entender tus
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
          text={isExporting ? 'Exportando CSV...' : 'Exportar CSV'}
          onClick={handleExportCsv}
          disabled={isExporting}
        />
      </Box>
      {usingMockData && (
        <Banner
          icon="fas fa-flask"
          color="warning"
          title="Datos de ejemplo"
          description="No pudimos conectar con el backend, mostrando movimientos simulados."
        />
      )}
    </Box>
  );
}

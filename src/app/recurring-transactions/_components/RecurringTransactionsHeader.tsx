'use client';

import { ActionButton, Banner, Box, Typography } from '@/components/shared/ui';
import { useRecurringTransactionsPage } from './RecurringTransactionsProvider';

export default function RecurringTransactionsHeader() {
  const { usingMockData, isRefreshing, handleCreateRecurringTransaction, handleRefresh } = useRecurringTransactionsPage();

  return (
    <Box className="flex flex-col gap-3">
      <Box className="flex flex-col gap-2">
        <Typography variant="h1">Transacciones Recurrentes</Typography>
        <Typography variant="body">
          Automatizá tus ingresos y gastos fijos para tener un mejor control de tus finanzas.
        </Typography>
      </Box>
      <Box className="flex flex-wrap items-center gap-2">
        <ActionButton
          icon="fas fa-plus"
          type="primary"
          text="Nueva transacción recurrente"
          onClick={handleCreateRecurringTransaction}
        />
        <ActionButton
          icon="fas fa-rotate"
          type="accent"
          text={isRefreshing ? 'Actualizando...' : 'Actualizar'}
          onClick={handleRefresh}
        />
      </Box>
      {usingMockData && (
        <Banner
          icon="fas fa-flask"
          color="warning"
          title="Datos de ejemplo"
          description="No pudimos conectar con la API, mostrando datos simulados."
        />
      )}
    </Box>
  );
}

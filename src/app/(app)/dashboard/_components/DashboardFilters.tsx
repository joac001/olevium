'use client';

import { Box, Typography, DropMenu } from '@/components/shared/ui';
import {
  useDashboard,
  PERIOD_OPTIONS,
  GROUPING_OPTIONS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from '../_context/DashboardContext';

export default function DashboardFilters() {
  const {
    period,
    setPeriod,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    grouping,
    setGrouping,
    effectiveGrouping,
    groupingAllowed,
    transactionsCountPeriod,
  } = useDashboard();

  return (
    <header className="flex flex-col gap-4">
      <Typography variant="h1">Resumen financiero</Typography>
      <Typography variant="body" className="text-[color:var(--text-muted)] max-w-2xl">
        Visualiza el pulso de tus finanzas: saldos consolidados, flujo de caja reciente y
        categorías que más impactan tu presupuesto.
      </Typography>
      <Box className="flex flex-wrap items-end gap-3 text-sm text-slate-200">
        <Box className="w-48">
          <DropMenu
            label="Período"
            options={PERIOD_OPTIONS}
            value={period}
            onValueChange={value => setPeriod((value as typeof period) ?? '365d')}
          />
        </Box>
        {period === 'month' && (
          <>
            <Box className="w-36">
              <DropMenu
                label="Mes"
                options={MONTH_OPTIONS}
                value={selectedMonth}
                onValueChange={value => setSelectedMonth(String(value ?? '1'))}
              />
            </Box>
            <Box className="w-28">
              <DropMenu
                label="Año"
                options={YEAR_OPTIONS}
                value={selectedYear}
                onValueChange={value => setSelectedYear(String(value ?? new Date().getFullYear()))}
              />
            </Box>
          </>
        )}
        <Box className="w-44">
          <DropMenu
            label="Agrupar"
            options={GROUPING_OPTIONS}
            value={effectiveGrouping}
            disabled={!groupingAllowed}
            onValueChange={value => setGrouping((value as typeof grouping) ?? 'daily')}
          />
        </Box>
        <Box className="ml-auto">
          <Box as="span" className="rounded-full bg-emerald-500/10 px-3 py-1">
            <Typography variant="body" as="span" className="text-xs font-medium text-emerald-300">
              {transactionsCountPeriod} movimientos en el período
            </Typography>
          </Box>
        </Box>
      </Box>
    </header>
  );
}

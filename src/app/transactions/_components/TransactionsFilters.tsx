'use client';

import { Box, DropMenu, Input, ActionButton } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import { useTransactionsPage } from './TransactionsProvider';
import type { DateFilter, TypeFilter } from './types';

const TYPE_OPTIONS: DropMenuOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' }
];

const DATE_OPTIONS: DropMenuOption[] = [
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'all', label: 'Todo el historial' }
];

export default function TransactionsFilters() {
  const {
    filters: { typeFilter, categoryFilter, dateFilter, searchTerm },
    setTypeFilter,
    setCategoryFilter,
    setDateFilter,
    setSearchTerm,
    categoryOptions,
    clearFilters
  } = useTransactionsPage();

  const categoryOptionsWithAll: DropMenuOption[] = [
    { value: 'all', label: 'Todas' },
    ...categoryOptions.map((category) => ({
      value: category.description,
      label: category.description
    }))
  ];

  return (
    <Box className="grid gap-3 md:grid-cols-4">
      <DropMenu
        label="Tipo"
        options={TYPE_OPTIONS}
        value={typeFilter}
        onValueChange={(value) => setTypeFilter((value as TypeFilter) ?? 'all')}
      />
      <DropMenu
        label="Categoría"
        options={categoryOptionsWithAll}
        value={categoryFilter}
        onValueChange={(value) => setCategoryFilter(value != null ? String(value) : 'all')}
      />
      <DropMenu
        label="Periodo"
        options={DATE_OPTIONS}
        value={dateFilter}
        onValueChange={(value) => setDateFilter((value as DateFilter) ?? '30d')}
      />
      <Input
        label="Buscar"
        value={searchTerm}
        onValueChange={(value) => setSearchTerm(String(value ?? ''))}
        placeholder="Descripción o categoría"
      />
      <Box className="md:col-span-4">
        <ActionButton
          icon="fas fa-rotate"
          type="neutral"
          text="Limpiar filtros"
          onClick={clearFilters}
        />
      </Box>
    </Box>
  );
}

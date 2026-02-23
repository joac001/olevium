'use client';

import { Box, DropMenu, Input, ActionButton } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import type { DateFilter, TypeFilter } from './types';
import { useTransactionsPage } from '../_context/TransactionsContext';

const TYPE_OPTIONS: DropMenuOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Salidas' }
];

const DATE_OPTIONS: DropMenuOption[] = [
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'all', label: 'Todo el historial' }
];

export default function TransactionsFilters() {
  const {
    typeFilter,
    categoryFilter,
    dateFilter,
    searchTerm,
    categoryOptions: categories,
    setTypeFilter: onTypeFilterChange,
    setCategoryFilter: onCategoryFilterChange,
    setDateFilter: onDateFilterChange,
    setSearchTerm: onSearchTermChange,
    clearFilters: onClearFilters,
  } = useTransactionsPage();
  const categoryOptionsWithAll: DropMenuOption[] = [
    { value: 'all', label: 'Todas' },
    ...categories.map((category) => ({
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
        onValueChange={(value) => onTypeFilterChange((value as TypeFilter) ?? 'all')}
      />
      <DropMenu
        label="Categoría"
        options={categoryOptionsWithAll}
        value={categoryFilter}
        onValueChange={(value) => onCategoryFilterChange(value != null ? String(value) : 'all')}
      />
      <DropMenu
        label="Periodo"
        options={DATE_OPTIONS}
        value={dateFilter}
        onValueChange={(value) => onDateFilterChange((value as DateFilter) ?? '90d')}
      />
      <Input
        label="Buscar"
        value={searchTerm}
        onValueChange={(value) => onSearchTermChange(String(value ?? ''))}
        placeholder="Descripción o categoría"
      />
      <Box className="md:col-span-4">
        <ActionButton
          icon="fas fa-rotate"
          type="neutral"
          text="Limpiar filtros"
          onClick={onClearFilters}
        />
      </Box>
    </Box>
  );
}

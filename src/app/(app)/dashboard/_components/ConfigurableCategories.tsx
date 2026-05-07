'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

import { Card, Box, Typography, Button } from '@/components/shared/ui';
import { formatCurrency } from '@/lib/format';
import { useCategoriesQuery } from '@/features/categories/queries';
import { useUserSettingsQuery, usePatchUserSettingsMutation } from '@/features/user/queries';
import { useCategoryStatsQuery } from '@/features/transactions/queries';
import { useModal } from '@/context/ModalContext';
import { useDashboard } from '../_context/DashboardContext';
import type { ApiCategory } from '@/types';

function CategoryPickerContent({
  allCategories,
  trackedIds,
  onSelect,
}: {
  allCategories: ApiCategory[];
  trackedIds: string[];
  onSelect: (cat: ApiCategory) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return allCategories.filter(
      c => c.is_active && c.description.toLowerCase().includes(lower) && !trackedIds.includes(c.category_id)
    );
  }, [allCategories, search, trackedIds]);

  return (
    <Box className="space-y-4">
      <input
        type="text"
        placeholder="Buscar categoría..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white/30"
        autoFocus
      />
      <Box className="max-h-72 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <Typography variant="body" className="text-sm text-muted py-2">
            No hay categorías disponibles.
          </Typography>
        ) : (
          filtered.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => onSelect(cat)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10 transition-colors"
            >
              {cat.color && (
                <Box className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              )}
              <span className="text-slate-200">{cat.description}</span>
            </button>
          ))
        )}
      </Box>
    </Box>
  );
}

export default function ConfigurableCategories() {
  const { startDate, endDate, prevStartDate, prevEndDate } = useDashboard();
  const { data: settings } = useUserSettingsQuery();
  const { data: allCategories = [] } = useCategoriesQuery();
  const patchMutation = usePatchUserSettingsMutation();
  const { showModal, hideModal } = useModal();

  const trackedIds: string[] = settings?.tracked_categories ?? [];

  const statsParams = useMemo(
    () =>
      trackedIds.length > 0
        ? { categoryIds: trackedIds, startDate, endDate, prevStartDate, prevEndDate }
        : null,
    [trackedIds, startDate, endDate, prevStartDate, prevEndDate]
  );

  const { data: stats = [] } = useCategoryStatsQuery(statsParams);

  const statsMap = useMemo(
    () => new Map(stats.map(s => [s.categoryId, s])),
    [stats]
  );

  const trackedCategories = useMemo(
    () =>
      trackedIds.map(id => {
        const cat = allCategories.find(c => c.category_id === id);
        const stat = statsMap.get(id);
        return { id, cat, stat };
      }),
    [trackedIds, allCategories, statsMap]
  );

  function openAdd() {
    showModal(
      <Card tone="accent" title="Seleccionar categoría">
        <CategoryPickerContent
          allCategories={allCategories}
          trackedIds={trackedIds}
          onSelect={cat => {
            if (trackedIds.length >= 3) { hideModal(); return; }
            patchMutation.mutate({ tracked_categories: [...trackedIds, cat.category_id] });
            hideModal();
          }}
        />
      </Card>
    );
  }

  function openSwap(index: number) {
    showModal(
      <Card tone="accent" title="Cambiar categoría">
        <CategoryPickerContent
          allCategories={allCategories}
          trackedIds={trackedIds}
          onSelect={cat => {
            const newIds = [...trackedIds];
            newIds[index] = cat.category_id;
            patchMutation.mutate({ tracked_categories: newIds });
            hideModal();
          }}
        />
      </Card>
    );
  }

  const deltaColor = (current: number, prev: number) => {
    if (prev === 0) return 'text-muted';
    return current <= prev ? 'text-emerald-400' : 'text-rose-400';
  };

  const deltaLabel = (current: number, prev: number) => {
    if (prev === 0) return null;
    const pct = (((current - prev) / prev) * 100).toFixed(1);
    return `${Number(pct) >= 0 ? '↑' : '↓'} ${Math.abs(Number(pct))}%`;
  };

  return (
    <Card>
      <Box className="flex items-center justify-between mb-4">
        <Box className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted" />
          <Typography variant="h2">Seguimiento de categorías</Typography>
        </Box>
        {trackedIds.length === 0 && (
          <Button
            type="secondary"
            text="Configurar"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={openAdd}
          />
        )}
      </Box>

      {trackedIds.length === 0 ? (
        <Typography variant="body" className="text-sm text-muted">
          Elegí hasta 3 categorías para seguirlas de cerca en el período seleccionado.
        </Typography>
      ) : (
        <Box className="space-y-2">
          {trackedCategories.map(({ id, cat, stat }, index) => (
            <Box
              key={id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <Box className="flex items-center gap-3 min-w-0">
                {cat?.color && (
                  <Box
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                <Box className="min-w-0">
                  <Typography variant="body" as="p" className="text-sm font-medium text-white truncate">
                    {cat?.description ?? id}
                  </Typography>
                  {stat && (
                    <Typography
                      variant="caption"
                      as="p"
                      className={clsx('text-xs', deltaColor(stat.currentTotal, stat.prevTotal))}
                    >
                      {deltaLabel(stat.currentTotal, stat.prevTotal) ?? 'Sin período anterior'}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box className="flex items-center gap-3 flex-shrink-0">
                {stat && (
                  <Typography variant="body" as="span" className="text-sm font-semibold text-white">
                    {formatCurrency(stat.currentTotal)}
                  </Typography>
                )}
                <button
                  onClick={() => openSwap(index)}
                  className="text-muted hover:text-white transition-colors"
                  aria-label="Cambiar categoría"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </Box>
            </Box>
          ))}

          {trackedIds.length < 3 && (
            <button
              onClick={openAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-muted hover:border-white/40 hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar categoría
            </button>
          )}
        </Box>
      )}
    </Card>
  );
}

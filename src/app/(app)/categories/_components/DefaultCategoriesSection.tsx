import type { Category, TransactionType } from '@/lib/types';
import { Box, Card, Typography } from '@/components/shared/ui';

interface DefaultCategoriesSectionProps {
  categories: Category[];
  transactionTypes: TransactionType[];
}

export default function DefaultCategoriesSection({
  categories,
  transactionTypes,
}: DefaultCategoriesSectionProps) {
  const typeLabelById = new Map<number, string>();
  transactionTypes.forEach(type => typeLabelById.set(type.type_id, type.name));

  return (
    <Card
      tone="neutral"
      title="Categorías por defecto"
      subtitle="Estas categorías vienen incluidas en Olevium y no pueden editarse."
    >
      {categories.length ? (
        <Box className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {categories.map(category => {
            const typeLabel = typeLabelById.get(category.type_id) ?? `Tipo #${category.type_id}`;
            return (
              <Box
                key={category.category_id}
                className="rounded-2xl border border-[color:var(--surface-muted)] bg-[color:var(--surface-glass)] p-4"
              >
                <Typography
                  variant="body"
                  className="text-sm font-semibold text-[color:var(--text-primary)]"
                >
                  {category.description}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
                >
                  Tipo:{' '}
                  <span className="font-semibold text-[color:var(--text-primary)]">
                    {typeLabel}
                  </span>
                </Typography>
                {category.color && (
                  <Box className="flex items-center gap-2 w-fit">
                    <span
                      className="h-4 w-4 rounded-xl"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <Typography
                      variant="caption"
                      className="text-xs text-[color:var(--text-muted)]"
                    >
                      {category.color}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box className="rounded-2xl border border-dashed border-[color:var(--surface-muted)] p-8 text-center">
          <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
            No hay categorías por defecto para mostrar.
          </Typography>
        </Box>
      )}
    </Card>
  );
}

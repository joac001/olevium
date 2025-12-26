'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, Card, Typography, ActionButton } from '@/components/shared/ui';
import { useModal } from '@/context/ModalContext';
import { getCategories, deactivateCategory, reactivateCategory } from '@/lib/api/categories';
import type { Category, TransactionType } from '@/lib/types';
import type { User } from '@/lib/api';
import EditCategoryForm from './EditCategoryForm';
import DeleteCategoryForm from './DeleteCategoryForm';
import CreateCategoryForm from './CreateCategoryForm';
import ConfirmActionForm from './ConfirmActionForm';

interface CategoriesShellProps {
  initialCategories: Category[];
  initialTransactionTypes: TransactionType[];
  initialUser: User;
}

export default function CategoriesShell({
  initialCategories,
  initialTransactionTypes,
  initialUser,
}: CategoriesShellProps) {
  const { showModal, hideModal } = useModal();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [transactionTypes] = useState<TransactionType[]>(initialTransactionTypes);
  const [user] = useState<User>(initialUser);

  const userId = user ? String(user.user_id) : null;

  const categoriesList = categories;

  const refreshCategories = useCallback(async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (error) {
      // Silently fail - the user will see stale data
    }
  }, []);

  const typeLabelById = useMemo(() => {
    const record = new Map<number, string>();
    transactionTypes.forEach(type => {
      record.set(type.type_id, type.name);
    });
    return record;
  }, [transactionTypes]);

  const userCategories = useMemo(
    () =>
      categoriesList.filter(category => category.user_id && (!userId || category.user_id === userId)),
    [categoriesList, userId]
  );

  const defaultCategories = useMemo(
    () => categoriesList.filter(category => !category.user_id),
    [categoriesList]
  );

  const openEditModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.category_id === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="accent" title="Editar categoría">
          <EditCategoryForm
            category={target}
            transactionTypes={transactionTypes}
            loadingTypes={false}
            onSuccess={async () => {
              hideModal();
              await refreshCategories();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, refreshCategories, showModal, transactionTypes]
  );

  const openDeleteModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.category_id === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="danger" title="Eliminar categoría">
          <DeleteCategoryForm
            category={target}
            onSuccess={async () => {
              hideModal();
              await refreshCategories();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, refreshCategories, showModal]
  );

  const openDeactivateModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.category_id === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="accent" title="Desactivar categoría">
          <ConfirmActionForm
            title={`¿Desactivar "${target.description}"?`}
            description="La categoría no aparecerá en los selects de nuevas transacciones, pero se mantendrá en las transacciones existentes."
            confirmLabel="Desactivar categoría"
            confirmVariant="accent"
            onConfirm={() => deactivateCategory(categoryId)}
            successMessage="Categoría desactivada. Ya no aparecerá en nuevas transacciones."
            onSuccess={async () => {
              hideModal();
              await refreshCategories();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, refreshCategories, showModal]
  );

  const openActivateModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.category_id === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="accent" title="Activar categoría">
          <ConfirmActionForm
            title={`¿Activar "${target.description}"?`}
            description="La categoría volverá a aparecer en los selects de nuevas transacciones."
            confirmLabel="Activar categoría"
            confirmVariant="accent"
            onConfirm={() => reactivateCategory(categoryId)}
            successMessage="Categoría activada. Ya está disponible para nuevas transacciones."
            onSuccess={async () => {
              hideModal();
              await refreshCategories();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, refreshCategories, showModal]
  );

  const openCreateModal = useCallback(() => {
    showModal(
      <Card tone="accent" title="Crear categoría">
        <CreateCategoryForm
          onSuccess={async () => {
            hideModal();
            await refreshCategories();
          }}
        />
      </Card>
    );
  }, [hideModal, refreshCategories, showModal]);

  return (
    <Box className="flex flex-col gap-6">
      <Card
        tone="neutral"
        title="Tus categorías"
        actions={[
          {
            icon: 'fas fa-plus',
            type: 'primary',
            tooltip: 'Crear categoría',
            onClick: openCreateModal,
          },
        ]}
      >
        {userCategories.length ? (
          <Box className="flex flex-col gap-4">
            {userCategories.map(category => {
              const typeLabel = typeLabelById.get(category.type_id) ?? `Tipo #${category.type_id}`;
              const isActive = category.is_active !== false;
              return (
                <Box
                  key={category.category_id}
                  className={`flex flex-row gap-3 rounded-2xl border p-4 md:items-center md:justify-between ${
                    isActive
                      ? 'border-[color:var(--surface-muted)] bg-[color:var(--surface-glass)]'
                      : 'border-[color:var(--surface-muted)] bg-[color:var(--surface-muted)]/30 opacity-70'
                  }`}
                >
                  <Box className="flex flex-1 flex-col gap-1">
                    <Box className="flex items-center gap-2">
                      <Typography
                        variant="body"
                        className="text-sm font-semibold text-[color:var(--text-primary)]"
                      >
                        {category.description}
                      </Typography>
                      {!isActive && (
                        <span className="rounded-full bg-[color:var(--color-warning)]/20 px-2 py-0.5 text-[10px] font-medium uppercase text-[color:var(--color-warning)]">
                          Inactiva
                        </span>
                      )}
                    </Box>
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
                  <Box className="flex items-center gap-2">
                    <ActionButton
                      icon="fas fa-pen"
                      type="accent"
                      tooltip="Editar categoría"
                      onClick={() => openEditModal(category.category_id)}
                    />
                    {isActive ? (
                      <ActionButton
                        icon="fas fa-eye-slash"
                        type="neutral"
                        tooltip="Desactivar categoría"
                        onClick={() => openDeactivateModal(category.category_id)}
                      />
                    ) : (
                      <ActionButton
                        icon="fas fa-eye"
                        type="accent"
                        tooltip="Activar categoría"
                        onClick={() => openActivateModal(category.category_id)}
                      />
                    )}
                    <ActionButton
                      icon="fas fa-trash"
                      type="danger"
                      tooltip="Eliminar categoría"
                      onClick={() => openDeleteModal(category.category_id)}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="rounded-2xl border border-dashed border-[color:var(--surface-muted)] p-8 text-center">
            <Typography variant="body" className="text-sm text-[color:var(--text-muted)]">
              Aún no tienes categorías personalizadas.
            </Typography>
          </Box>
        )}
      </Card>

      <Card
        tone="neutral"
        title="Categorías por defecto"
        subtitle="Estas categorías vienen incluidas en Olevium y no pueden editarse."
      >
        {defaultCategories.length ? (
          <Box className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {defaultCategories.map(category => {
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
    </Box>
  );
}

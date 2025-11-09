'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { Box, Card, Typography, ActionButton } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useUserStore } from '@/lib/stores/user';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { useTransactionData } from '@/context/TransactionContext';
import CategoriesListSkeleton from '../_categoriesSkeletons/CategoriesListSkeleton';
import EditCategoryForm from './EditCategoryForm';
import DeleteCategoryForm from './DeleteCategoryForm';
import CreateCategoryForm from './CreateCategoryForm';

export default function CategoriesShell() {
  const { showNotification } = useNotification();
  const { showModal, hideModal } = useModal();

  const categories = useTransactionsStore(state => state.categories);
  const fetchCategories = useTransactionsStore(state => state.fetchCategories);

  const user = useUserStore(state => state.user);
  const hasFetchedUser = useUserStore(state => state.hasFetched);
  const fetchCurrentUser = useUserStore(state => state.fetchCurrentUser);

  const {
    categories: contextCategories,
    categoriesLoading,
    transactionTypes,
    transactionTypesLoading,
  } = useTransactionData();

  useEffect(() => {
    if (!categories.length) {
      fetchCategories().catch(error => {
        const message =
          error instanceof Error ? error.message : 'No pudimos obtener las categorías.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al cargar categorías',
          message
        );
      });
    }
  }, [categories.length, fetchCategories, showNotification]);

  useEffect(() => {
    if (!hasFetchedUser) {
      fetchCurrentUser().catch(error => {
        const message =
          error instanceof Error ? error.message : 'No pudimos obtener la información de usuario.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al cargar usuario',
          message
        );
      });
    }
  }, [fetchCurrentUser, hasFetchedUser, showNotification]);

  const userId = user ? String(user.user_id) : null;

  const categoriesList = contextCategories.length ? contextCategories : categories;

  const typeLabelById = useMemo(() => {
    const record = new Map<number, string>();
    transactionTypes.forEach(type => {
      record.set(type.typeId, type.name);
    });
    return record;
  }, [transactionTypes]);

  const userCategories = useMemo(
    () =>
      categoriesList.filter(category => category.userId && (!userId || category.userId === userId)),
    [categoriesList, userId]
  );

  const defaultCategories = useMemo(
    () => categoriesList.filter(category => !category.userId),
    [categoriesList]
  );

  const openEditModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.categoryId === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="accent" title="Editar categoría">
          <EditCategoryForm
            category={target}
            transactionTypes={transactionTypes}
            loadingTypes={transactionTypesLoading}
            onSuccess={() => {
              hideModal();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, showModal, transactionTypes, transactionTypesLoading]
  );

  const openDeleteModal = useCallback(
    (categoryId: string) => {
      const target = categoriesList.find(category => category.categoryId === categoryId);
      if (!target) {
        return;
      }

      showModal(
        <Card tone="danger" title="Eliminar categoría">
          <DeleteCategoryForm
            category={target}
            onSuccess={() => {
              hideModal();
            }}
          />
        </Card>
      );
    },
    [categoriesList, hideModal, showModal]
  );

  const openCreateModal = useCallback(() => {
    showModal(
      <Card tone="accent" title="Crear categoría">
        <CreateCategoryForm
          onSuccess={() => {
            hideModal();
          }}
        />
      </Card>
    );
  }, [hideModal, showModal]);

  const isLoadingCategories = categoriesLoading && categoriesList.length === 0;
  const isLoadingUser = !hasFetchedUser && !user;
  const isLoading = isLoadingCategories || isLoadingUser;

  if (isLoading) {
    return <CategoriesListSkeleton />;
  }

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
              const typeLabel = typeLabelById.get(category.typeId) ?? `Tipo #${category.typeId}`;
              return (
                <Box
                  key={category.categoryId}
                  className="flex flex-row gap-3 rounded-2xl border border-[color:var(--surface-muted)] bg-[color:var(--surface-glass)] p-4 md:items-center md:justify-between"
                >
                  <Box className="flex flex-1 flex-col gap-1">
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
                  <Box className="flex items-center gap-2">
                    <ActionButton
                      icon="fas fa-pen"
                      type="accent"
                      tooltip="Editar categoría"
                      onClick={() => openEditModal(category.categoryId)}
                    />
                    <ActionButton
                      icon="fas fa-trash"
                      type="danger"
                      tooltip="Eliminar categoría"
                      onClick={() => openDeleteModal(category.categoryId)}
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
              const typeLabel = typeLabelById.get(category.typeId) ?? `Tipo #${category.typeId}`;
              return (
                <Box
                  key={category.categoryId}
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

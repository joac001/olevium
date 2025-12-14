'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Card, Typography, ActionButton, DropMenu } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useUserStore } from '@/lib/stores/user';
import { useNotification } from '@/context/NotificationContext';
import { useModal } from '@/context/ModalContext';
import { useTransactionData } from '@/context/TransactionContext';
import type { CategoryBudgetSummary } from '@/lib/api';
import { getCategoryBudgets } from '@/lib/api';
import { createOperationContext } from '@/lib/utils/errorSystem';
import CategoriesListSkeleton from '../_categoriesSkeletons/CategoriesListSkeleton';
import EditCategoryForm from './EditCategoryForm';
import DeleteCategoryForm from './DeleteCategoryForm';
import CreateCategoryForm from './CreateCategoryForm';
import CategoryBudgetForm from './CategoryBudgetForm';

export default function CategoriesShell() {
  const { showNotification, showError } = useNotification();
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

  const today = new Date();
  const [budgetYear, setBudgetYear] = useState<number>(today.getFullYear());
  const [budgetMonth, setBudgetMonth] = useState<number>(today.getMonth() + 1);
  const [budgets, setBudgets] = useState<CategoryBudgetSummary[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);

  useEffect(() => {
    if (!categories.length) {
      fetchCategories().catch(error => {
        const context = createOperationContext('fetch', 'categorías', 'las categorías');
        showError(error, context);
      });
    }
  }, [categories.length, fetchCategories, showNotification, showError]);

  useEffect(() => {
    if (!hasFetchedUser) {
      fetchCurrentUser().catch(error => {
        const context = createOperationContext('fetch', 'usuario', 'la información del usuario');
        showError(error, context);
      });
    }
  }, [fetchCurrentUser, hasFetchedUser, showNotification, showError]);

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

  const budgetsByCategoryId = useMemo(() => {
    const map = new Map<string, CategoryBudgetSummary>();
    budgets.forEach(b => {
      map.set(b.category_id, b);
    });
    return map;
  }, [budgets]);

  const budgetsSummary = useMemo(() => {
    if (!budgets.length) {
      return null;
    }

    const totals = budgets.reduce(
      (acc, b) => {
        acc.totalAmount += b.amount;
        acc.totalSpent += b.spent;
        acc.overCount += b.is_over_budget ? 1 : 0;
        return acc;
      },
      { totalAmount: 0, totalSpent: 0, overCount: 0 }
    );

    const remaining = totals.totalAmount - totals.totalSpent;
    const usedPercent =
      totals.totalAmount > 0 ? (totals.totalSpent / totals.totalAmount) * 100 : 0;

    return {
      totalAmount: totals.totalAmount,
      totalSpent: totals.totalSpent,
      remaining,
      usedPercent,
      overCount: totals.overCount,
      categoriesWithBudget: budgets.length,
    };
  }, [budgets]);

  const reloadBudgets = useCallback(
    async (year: number, month: number) => {
      if (!userId) return;
      setBudgetsLoading(true);
      setBudgetsError(null);
      try {
        const { data, isMock } = await getCategoryBudgets(year, month);
        if (isMock) {
          setBudgets([]);
          return;
        }
        setBudgets(data);
      } catch (error) {
        const context = createOperationContext('fetch', 'presupuestos', 'los presupuestos');
        showError(error, context);
        setBudgetsError('No pudimos cargar los presupuestos de este mes.');
      } finally {
        setBudgetsLoading(false);
      }
    },
    [showError, userId]
  );

  useEffect(() => {
    void reloadBudgets(budgetYear, budgetMonth);
  }, [budgetMonth, budgetYear, reloadBudgets]);

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

  const openBudgetModal = useCallback(
    (categoryId: string) => {
      const target = userCategories.find(category => category.categoryId === categoryId);
      if (!target) {
        return;
      }

      const currentBudget = budgetsByCategoryId.get(categoryId) ?? null;

      showModal(
        <Card tone="accent" title="Configurar presupuesto">
          <CategoryBudgetForm
            categoryId={target.categoryId}
            categoryName={target.description}
            year={budgetYear}
            month={budgetMonth}
            currentBudget={currentBudget}
            onSuccess={async () => {
              hideModal();
              await reloadBudgets(budgetYear, budgetMonth);
            }}
          />
        </Card>
      );
    },
    [budgetMonth, budgetYear, budgetsByCategoryId, hideModal, reloadBudgets, showModal, userCategories]
  );

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
        subtitle="Configura categorías personalizadas y, opcionalmente, un presupuesto mensual por categoría."
        actions={[
          {
            icon: 'fas fa-plus',
            type: 'primary',
            tooltip: 'Crear categoría',
            onClick: openCreateModal,
          },
        ]}
      >
        {budgetsSummary && (
          <Box className="mb-4 grid gap-3 rounded-2xl border border-[color:var(--surface-muted)] bg-[color:var(--surface-glass)] p-3 md:grid-cols-4">
            <Box className="flex flex-col">
              <Typography
                variant="caption"
                className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
              >
                Presupuesto total
              </Typography>
              <Typography variant="body" className="text-sm font-semibold text-[color:var(--text-primary)]">
                ${budgetsSummary.totalAmount.toFixed(2)}
              </Typography>
            </Box>
            <Box className="flex flex-col">
              <Typography
                variant="caption"
                className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
              >
                Gastado
              </Typography>
              <Typography
                variant="body"
                className="text-sm font-semibold"
                style={{
                  color:
                    budgetsSummary.usedPercent >= 100
                      ? 'var(--color-danger)'
                      : budgetsSummary.usedPercent >= 80
                        ? 'var(--color-warning)'
                        : 'var(--text-primary)',
                }}
              >
                ${budgetsSummary.totalSpent.toFixed(2)} (
                {Math.round(budgetsSummary.usedPercent)}%)
              </Typography>
            </Box>
            <Box className="flex flex-col">
              <Typography
                variant="caption"
                className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
              >
                Restante
              </Typography>
              <Typography variant="body" className="text-sm font-semibold text-[color:var(--text-primary)]">
                ${Math.max(budgetsSummary.remaining, 0).toFixed(2)}
              </Typography>
            </Box>
            <Box className="flex flex-col">
              <Typography
                variant="caption"
                className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
              >
                Categorías al límite
              </Typography>
              <Typography variant="body" className="text-sm font-semibold text-[color:var(--text-primary)]">
                {budgetsSummary.overCount} / {budgetsSummary.categoriesWithBudget}
              </Typography>
            </Box>
          </Box>
        )}
        <Box className="mb-4 flex flex-wrap items-center gap-3">
          <Typography
            variant="caption"
            className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]"
          >
            Presupuestos del mes
          </Typography>
          <DropMenu
            label="Mes"
            hideLabel
            value={budgetMonth}
            onValueChange={value => {
              const numeric = typeof value === 'string' ? Number(value) : (value as number);
              if (Number.isFinite(numeric)) setBudgetMonth(numeric);
            }}
            options={[
              { value: 1, label: 'Enero' },
              { value: 2, label: 'Febrero' },
              { value: 3, label: 'Marzo' },
              { value: 4, label: 'Abril' },
              { value: 5, label: 'Mayo' },
              { value: 6, label: 'Junio' },
              { value: 7, label: 'Julio' },
              { value: 8, label: 'Agosto' },
              { value: 9, label: 'Septiembre' },
              { value: 10, label: 'Octubre' },
              { value: 11, label: 'Noviembre' },
              { value: 12, label: 'Diciembre' },
            ]}
          />
          <DropMenu
            label="Año"
            hideLabel
            value={budgetYear}
            onValueChange={value => {
              const numeric = typeof value === 'string' ? Number(value) : (value as number);
              if (Number.isFinite(numeric)) setBudgetYear(numeric);
            }}
            options={[
              { value: today.getFullYear() - 1, label: String(today.getFullYear() - 1) },
              { value: today.getFullYear(), label: String(today.getFullYear()) },
              { value: today.getFullYear() + 1, label: String(today.getFullYear() + 1) },
            ]}
          />
          {budgetsLoading && (
            <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
              Cargando presupuestos...
            </Typography>
          )}
          {!budgetsLoading && budgetsError && (
            <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
              {budgetsError}
            </Typography>
          )}
        </Box>
        {userCategories.length ? (
          <Box className="flex flex-col gap-4">
            {userCategories.map(category => {
              const typeLabel = typeLabelById.get(category.typeId) ?? `Tipo #${category.typeId}`;
              const budget = budgetsByCategoryId.get(category.categoryId);
              const isOver = budget?.is_over_budget;
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
                    {budget && (
                      <Box className="mt-2 flex flex-wrap items-center gap-2">
                        <Typography
                          variant="caption"
                          className="text-xs text-[color:var(--text-muted)]"
                        >
                          Presupuesto {budgetMonth.toString().padStart(2, '0')}/{budgetYear}:{' '}
                          <span className="font-semibold text-[color:var(--text-primary)]">
                            ${budget.amount}
                          </span>{' '}
                          · Gastado:{' '}
                          <span className="font-semibold">
                            <span
                              style={{
                                color:
                                  budget.used_percent >= 100
                                    ? 'var(--color-danger)'
                                    : budget.used_percent >= 80
                                      ? 'var(--color-warning)'
                                      : 'var(--text-primary)',
                              }}
                            >
                              ${budget.spent} ({Math.round(budget.used_percent)}%)
                            </span>
                          </span>{' '}
                          · Restante:{' '}
                          <span className="font-semibold">
                            ${budget.remaining >= 0 ? budget.remaining : 0}
                          </span>
                        </Typography>
                      </Box>
                    )}
                    {!budget && (
                      <Typography
                        variant="caption"
                        className="mt-2 text-xs text-[color:var(--text-muted)]"
                      >
                        Aún no definiste un presupuesto para esta categoría en este mes.
                      </Typography>
                    )}
                  </Box>
                  <Box className="flex items-center gap-2">
                    <ActionButton
                      icon="fas fa-wallet"
                      type={budget ? 'accent' : 'neutral'}
                      tooltip="Configurar presupuesto"
                      onClick={() => openBudgetModal(category.categoryId)}
                    />
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

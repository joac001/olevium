'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  FormWrapper,
  Input,
  DropMenu,
  Typography,
  ActionButton,
  ButtonBase,
} from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import {
  useCreateRecurringTransactionMutation,
  useUpdateRecurringTransactionMutation,
} from '@/features/recurring-transactions/mutations';
import type { CreateRecurringTransactionPayload, RecurringTransaction, Category } from '@/lib/types';
import type { Account } from '@/types';
import { formatAccountName } from '@/lib/format';
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-presets';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

type RecurringTransactionFormModalProps = {
  mode: 'create' | 'edit';
  transaction?: RecurringTransaction;
  accounts: Account[];
  categories: Category[];
  onCompleted: (status: 'created' | 'updated') => void;
  onCancel: () => void;
};

type CategoryMode = 'existing' | 'new';

type RecurringTransactionFormState = {
  description: string;
  amount: string;
  accountId: string;
  categoryMode: CategoryMode;
  categoryId: string;
  newCategoryDescription: string;
  newCategoryType: string;
  newCategoryColor: string;
  typeId: string;
  frequency: string;
  startDate: string;
};

const DEFAULT_FORM: RecurringTransactionFormState = {
  description: '',
  amount: '',
  accountId: '',
  categoryMode: 'existing',
  categoryId: '',
  newCategoryDescription: '',
  newCategoryType: String(EXPENSE_TYPE_ID),
  newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
  typeId: String(EXPENSE_TYPE_ID),
  frequency: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
};

function buildInitialState(transaction?: RecurringTransaction): RecurringTransactionFormState {
  if (!transaction) {
    return DEFAULT_FORM;
  }
  return {
    description: transaction.description ?? '',
    amount: String(transaction.amount),
    accountId: String(transaction.account_id),
    categoryMode: 'existing',
    categoryId: String(transaction.category_id),
    newCategoryDescription: '',
    newCategoryType: String(transaction.type_id),
    newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
    typeId: String(transaction.type_id),
    frequency: transaction.frequency,
    startDate: transaction.start_date,
  };
}

export default function RecurringTransactionFormModal({
  mode,
  transaction,
  accounts,
  categories,
  onCompleted,
  onCancel,
}: RecurringTransactionFormModalProps) {
  const [formValues, setFormValues] = useState<RecurringTransactionFormState>(() =>
    buildInitialState(transaction)
  );
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateRecurringTransactionMutation();
  const updateMutation = useUpdateRecurringTransactionMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const accountOptions: DropMenuOption[] = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.accountId),
        label: formatAccountName(
          account.name,
          account.currency ?? undefined
        ),
      })),
    [accounts]
  );

  const categoryOptions: DropMenuOption[] = useMemo(
    () =>
      categories
        .filter((category) => {
          const matchesType = category.type_id === Number(formValues.typeId);
          // Include active categories OR the currently selected category (for edit mode)
          return matchesType && (category.is_active !== false || String(category.category_id) === formValues.categoryId);
        })
        .slice()
        .sort((a, b) => a.description.localeCompare(b.description))
        .map((category) => ({
          value: String(category.category_id),
          label: category.is_active === false ? `${category.description} (inactiva)` : category.description,
        })),
    [categories, formValues.typeId, formValues.categoryId]
  );

  const typeOptions: DropMenuOption[] = [
    { value: String(EXPENSE_TYPE_ID), label: 'Salida' },
    { value: String(INCOME_TYPE_ID), label: 'Ingreso' },
  ];

  const frequencyOptions: DropMenuOption[] = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
  ];

  const buttons: ButtonProps[] = [
    {
      type: 'neutral',
      text: 'Cancelar',
      onClick: onCancel,
      disabled: isSubmitting,
    },
    {
      type: 'primary',
      text: isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar cambios',
      htmlType: 'submit',
      disabled: isSubmitting,
    },
  ];

  const handleFieldChange = (updater: (state: RecurringTransactionFormState) => RecurringTransactionFormState) => {
    setFormError(null);
    setFormValues((prev) => updater(prev));
  };

  const categoryModeButtons: Array<{ label: string; value: CategoryMode }> = [
    { label: 'Existente', value: 'existing' },
    { label: 'Nueva', value: 'new' },
  ];

  const handleSubmit = async () => {
    setFormError(null);

    if (!formValues.accountId) {
      setFormError('Seleccioná una cuenta');
      return;
    }
    if (!formValues.amount) {
      setFormError('Ingresá un monto');
      return;
    }

    const payload: CreateRecurringTransactionPayload = {
      description: formValues.description,
      amount: Math.abs(Number(formValues.amount) || 0),
      account_id: String(formValues.accountId),
      type_id: Number(formValues.typeId),
      frequency: formValues.frequency as 'daily' | 'weekly' | 'monthly',
      start_date: formValues.startDate,
      interval: 1,
    };

    if (formValues.categoryMode === 'existing') {
      if (!formValues.categoryId) {
        setFormError('Elegí una categoría existente o creá una nueva.');
        return;
      }
      payload.category_id = String(formValues.categoryId);
    } else {
      if (!formValues.newCategoryDescription.trim()) {
        setFormError('Ingresá la descripción de la nueva categoría');
        return;
      }
      payload.category = {
        description: formValues.newCategoryDescription.trim(),
        type_id: Number(formValues.newCategoryType || formValues.typeId),
        color: formValues.newCategoryColor?.trim() || undefined,
      };
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        onCompleted('created');
      } else if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.recurring_transaction_id,
          payload,
        });
        onCompleted('updated');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la transacción recurrente';
      setFormError(message);
    }
  };

  return (
    <Card tone="accent" title={mode === 'create' ? 'Crear transacción recurrente' : 'Editar transacción recurrente'}>
      <FormWrapper
        onSubmit={handleSubmit}
        buttons={buttons}
        onError={(error) => setFormError(error.message)}
        className="space-y-4"
      >
        <Input
          label="Descripción"
          required
          value={formValues.description}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, description: String(value ?? '') }))}
        />
        <Input
          label="Monto"
          type="number"
          required
          value={formValues.amount}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, amount: String(value ?? '') }))}
        />
        <DropMenu
          label="Cuenta"
          required
          options={accountOptions}
          value={formValues.accountId}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, accountId: String(value ?? '') }))}
        />
        <Box className="space-y-3">
          <Typography
            variant="caption"
            className="uppercase tracking-wide text-[color:var(--text-muted)]"
          >
            Categoría
          </Typography>
          <Box className="flex gap-2">
            {categoryModeButtons.map(({ label, value }) => {
              const isActive = formValues.categoryMode === value;
              return (
                <ActionButton
                  key={value}
                  icon={isActive ? 'fas fa-check-circle' : 'fas fa-circle'}
                  type={isActive ? 'accent' : 'neutral'}
                  text={label}
                  onClick={() =>
                    handleFieldChange(prev => ({
                      ...prev,
                      categoryMode: value,
                      newCategoryType: value === 'new' ? prev.typeId : prev.newCategoryType,
                    }))
                  }
                />
              );
            })}
          </Box>

          {formValues.categoryMode === 'existing' ? (
            <DropMenu
              label="Seleccioná una categoría"
              required
              options={categoryOptions}
              value={formValues.categoryId}
              onValueChange={(value) =>
                handleFieldChange((prev) => ({
                  ...prev,
                  categoryId: value != null ? String(value) : '',
                }))
              }
              placeholder="Elegí una categoría"
            />
          ) : (
            <Box className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <DropMenu
                label="Tipo de la nueva categoría"
                required
                options={typeOptions}
                value={formValues.newCategoryType}
                onValueChange={(value) =>
                  handleFieldChange((prev) => ({
                    ...prev,
                    newCategoryType: value != null ? String(value) : prev.newCategoryType,
                  }))
                }
              />
              <Input
                label="Descripción"
                required
                value={formValues.newCategoryDescription}
                onValueChange={(value) =>
                  handleFieldChange((prev) => ({
                    ...prev,
                    newCategoryDescription: String(value ?? ''),
                  }))
                }
                placeholder="Nombre de la nueva categoría"
              />
              <Box className="space-y-2">
                <Box className="flex flex-wrap gap-2">
                  {CATEGORY_COLOR_OPTIONS.map(option => (
                    <ButtonBase
                      key={option.value}
                      htmlType="button"
                      onClick={() =>
                        handleFieldChange((prev) => ({ ...prev, newCategoryColor: option.value }))
                      }
                      className={`!h-8 !w-8 !rounded-full !border-2 !p-0 transition ${
                        formValues.newCategoryColor === option.value
                          ? '!border-white ring-2 ring-white/60'
                          : '!border-white/10 hover:!border-white/40'
                      }`}
                      style={{ backgroundColor: option.value }}
                      ariaLabel={`Color ${option.label}`}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        <DropMenu
          label="Tipo"
          required
          options={typeOptions}
          value={formValues.typeId}
          onValueChange={(value) =>
            handleFieldChange((prev) => {
              const nextType = String(value ?? '');
              const typeChanged = nextType !== prev.typeId;
              return {
                ...prev,
                typeId: nextType,
                // Clear category selection when type changes
                categoryId: typeChanged ? '' : prev.categoryId
              };
            })
          }
        />
        <DropMenu
          label="Frecuencia"
          required
          options={frequencyOptions}
          value={formValues.frequency}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, frequency: String(value ?? '') }))}
        />
        <Input
          label="Fecha de inicio"
          type="date"
          required
          value={formValues.startDate}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, startDate: String(value ?? '') }))}
        />
        {formError && (
          <Box className="rounded-xl bg-red-500/10 p-3">
            <Typography variant="caption" className="text-red-400">
              {formError}
            </Typography>
          </Box>
        )}
      </FormWrapper>
    </Card>
  );
}

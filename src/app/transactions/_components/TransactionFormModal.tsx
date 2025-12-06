'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  FormWrapper,
  Input,
  DropMenu,
  Typography,
  ActionButton
} from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation
} from '@/features/transactions/mutations';
import type { CreateTransactionPayload } from '@/lib/types';
import type { TransactionFormModalProps } from './types';
import { CATEGORY_COLOR_OPTIONS, CATEGORY_EMOJI_SUGGESTIONS } from '@/lib/category-presets';
import { formatAccountName } from '@/lib/format';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

type TransactionCategoryMode = 'existing' | 'new';

type TransactionFormState = {
  accountId: string;
  amount: string;
  typeId: string;
  date: string;
  description: string;
  categoryMode: TransactionCategoryMode;
  categoryId: string;
  newCategoryDescription: string;
  newCategoryType: string;
  newCategoryColor: string;
  newCategoryIcon: string;
};

const DEFAULT_FORM: TransactionFormState = {
  accountId: '',
  amount: '',
  typeId: String(EXPENSE_TYPE_ID),
  date: new Date().toISOString().slice(0, 10),
  description: '',
  categoryMode: 'existing',
  categoryId: '',
  newCategoryDescription: '',
  newCategoryType: String(EXPENSE_TYPE_ID),
  newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
  newCategoryIcon: ''
};

function toDateLocal(value: string): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function buildInitialState(props: TransactionFormModalProps): TransactionFormState {
  const { mode, transaction, accounts } = props;
  if (mode === 'create' || !transaction) {
    return {
      ...DEFAULT_FORM,
      accountId: accounts.length ? String(accounts[0].account_id) : DEFAULT_FORM.accountId,
      newCategoryType: DEFAULT_FORM.newCategoryType
    };
  }

  const isIncome = transaction.type_id === INCOME_TYPE_ID || transaction.amount > 0;
  return {
    accountId: String(transaction.account_id),
    amount: String(Math.abs(transaction.amount)),
    typeId: String(isIncome ? INCOME_TYPE_ID : EXPENSE_TYPE_ID),
    date: toDateLocal(transaction.date),
    description: transaction.description ?? '',
    categoryMode: 'existing',
    categoryId: transaction.category_id ? String(transaction.category_id) : '',
    newCategoryDescription: '',
    newCategoryType: String(transaction.type_id ?? (isIncome ? INCOME_TYPE_ID : EXPENSE_TYPE_ID)),
    newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
    newCategoryIcon: ''
  };
}

export default function TransactionFormModal({
  mode,
  transaction,
  accounts,
  categories,
  onCompleted,
  onCancel
}: TransactionFormModalProps) {
  const [formValues, setFormValues] = useState<TransactionFormState>(() =>
    buildInitialState({ mode, transaction, accounts, categories, onCompleted, onCancel })
  );
  const [formError, setFormError] = useState<string | null>(null);

  const createTransactionMutation = useCreateTransactionMutation();
  const updateTransactionMutation = useUpdateTransactionMutation(transaction?.transaction_id ?? null);
  const isSubmitting = createTransactionMutation.isPending || updateTransactionMutation.isPending;

  const accountOptions: DropMenuOption[] = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.account_id),
        label: formatAccountName(
          account.name,
          typeof account.currency === 'string' ? account.currency : account.currency?.label
        )
      })),
    [accounts]
  );

  const categoryOptions: DropMenuOption[] = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => a.description.localeCompare(b.description))
        .map((category) => ({ value: String(category.category_id), label: category.description })),
    [categories]
  );

  const typeOptions: DropMenuOption[] = useMemo(
    () => [
      { value: String(EXPENSE_TYPE_ID), label: 'Gasto' },
      { value: String(INCOME_TYPE_ID), label: 'Ingreso' }
    ],
    []
  );

  const categoryModeButtons: Array<{ label: string; value: TransactionCategoryMode }> = [
    { label: 'Existente', value: 'existing' },
    { label: 'Nueva', value: 'new' }
  ];

  const buttons: ButtonProps[] = [
    {
      type: 'neutral',
      text: 'Cancelar',
      onClick: onCancel,
      disabled: isSubmitting
    },
    {
      type: 'primary',
      text:
        isSubmitting ? 'Guardando...' : mode === 'create' ? 'Registrar transacción' : 'Guardar cambios',
      htmlType: 'submit',
      disabled: isSubmitting
    }
  ];

  const handleFieldChange = (updater: (state: TransactionFormState) => TransactionFormState) => {
    setFormError(null);
    setFormValues((prev) => updater(prev));
  };

  const validateAndBuildPayload = (): CreateTransactionPayload | null => {
    if (!formValues.accountId) {
      setFormError('Seleccioná una cuenta');
      return null;
    }
    if (!formValues.amount) {
      setFormError('Ingresá un monto');
      return null;
    }

    const rawAmount = Math.abs(Number(formValues.amount) || 0);
    const typeId = Number(formValues.typeId);
    const signedAmount = typeId === EXPENSE_TYPE_ID ? -rawAmount : rawAmount;

    const payload: CreateTransactionPayload = {
      account_id: String(formValues.accountId),
      amount: signedAmount,
      type_id: typeId,
      date: new Date(formValues.date || new Date()).toISOString(),
      description: formValues.description.trim() || undefined
    };

    if (formValues.categoryMode === 'existing') {
      if (!formValues.categoryId) {
        setFormError('Elegí una categoría existente o creá una nueva.');
        return null;
      }
      payload.category_id = String(formValues.categoryId);
    } else {
      if (!formValues.newCategoryDescription.trim()) {
        setFormError('Ingresá la descripción de la nueva categoría');
        return null;
      }
      payload.category = {
        description: formValues.newCategoryDescription.trim(),
        type_id: Number(formValues.newCategoryType || formValues.typeId),
        color: formValues.newCategoryColor?.trim() || undefined,
        icon: formValues.newCategoryIcon?.trim() || undefined
      };
    }

    return payload;
  };

  const handleSubmit = async () => {
    setFormError(null);
    const payload = validateAndBuildPayload();
    if (!payload) return;

    try {
      if (mode === 'create') {
        await createTransactionMutation.mutateAsync(payload);
        onCompleted('created');
      } else if (transaction?.transaction_id) {
        await updateTransactionMutation.mutateAsync(payload);
        onCompleted('updated');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la transacción';
      setFormError(message);
    }
  };

  return (
    <Box className="w-full max-w-3xl space-y-4 p-2 md:p-4">
      <Typography variant="h2">
        {mode === 'create' ? 'Registrar transacción' : 'Editar transacción'}
      </Typography>
      <Typography variant="caption">
        {mode === 'create'
          ? 'Registrá un nuevo movimiento en una de tus cuentas.'
          : 'Actualizá los datos del movimiento seleccionado.'}
      </Typography>

      <FormWrapper
        onSubmit={async () => {
          await handleSubmit();
        }}
        buttons={buttons}
        onError={(error) => setFormError(error.message)}
        className="space-y-4"
      >
        <Box className="grid gap-3 sm:grid-cols-2">
          <DropMenu
            label="Cuenta"
            required
            options={accountOptions}
            value={formValues.accountId}
            onValueChange={(value) =>
              handleFieldChange((prev) => ({ ...prev, accountId: value != null ? String(value) : '' }))
            }
            placeholder="Elegí una cuenta"
          />

          <DropMenu
            label="Tipo"
            required
            options={typeOptions}
            value={formValues.typeId}
            onValueChange={(value) =>
              handleFieldChange((prev) => {
                const nextType = value != null ? String(value) : prev.typeId;
                return {
                  ...prev,
                  typeId: nextType,
                  newCategoryType: prev.categoryMode === 'new' ? nextType : prev.newCategoryType
                };
              })
            }
          />
        </Box>

        <Box className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Monto"
            type="number"
            required
            value={formValues.amount}
            onValueChange={(value) =>
              handleFieldChange((prev) => ({ ...prev, amount: String(value ?? '') }))
            }
            placeholder="0"
          />

          <Box className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-muted" htmlFor="transaction-date">
              Fecha
            </label>
            <input
              id="transaction-date"
              type="date"
              value={formValues.date}
              onChange={(event) =>
                handleFieldChange((prev) => ({ ...prev, date: event.target.value }))
              }
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
            />
          </Box>
        </Box>

        <Input
          label="Descripción"
          value={formValues.description}
          onValueChange={(value) =>
            handleFieldChange((prev) => ({ ...prev, description: String(value ?? '') }))
          }
          placeholder="Detalle del movimiento"
          rows={3}
        />

        <Box className="space-y-3">
          <Typography variant="caption" className="uppercase tracking-wide text-[color:var(--text-muted)]">
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
                    handleFieldChange((prev) => ({
                      ...prev,
                      categoryMode: value,
                      newCategoryType: value === 'new' ? prev.typeId : prev.newCategoryType
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
              searchable
              searchPlaceholder="Buscar categoría"
              onValueChange={(value) =>
                handleFieldChange((prev) => ({ ...prev, categoryId: value != null ? String(value) : '' }))
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
                    newCategoryType: value != null ? String(value) : prev.newCategoryType
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
                    newCategoryDescription: String(value ?? '')
                  }))
                }
                placeholder="Nombre de la nueva categoría"
              />
              <Box className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted" htmlFor="new-category-color">
                  Color (hex)
                </label>
                <Box className="flex items-center gap-2">
                  <input
                    id="new-category-color"
                    type="text"
                    value={formValues.newCategoryColor}
                    onChange={(event) =>
                      handleFieldChange((prev) => ({
                        ...prev,
                        newCategoryColor: event.target.value.trim().toUpperCase()
                      }))
                    }
                    placeholder="#AABBCC"
                    className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange((prev) => ({ ...prev, newCategoryColor: '' }))
                    }
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/20"
                  >
                    Limpiar
                  </button>
                </Box>
                <Box className="flex flex-wrap gap-2">
                  {CATEGORY_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleFieldChange((prev) => ({ ...prev, newCategoryColor: option.value }))
                      }
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        formValues.newCategoryColor === option.value
                          ? 'border-white ring-2 ring-white/60'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                      style={{ backgroundColor: option.value }}
                      aria-label={`Color ${option.label}`}
                    />
                  ))}
                </Box>
              </Box>

              <Box className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-muted" htmlFor="new-category-icon">
                  Emoji (opcional)
                </label>
                <input
                  id="new-category-icon"
                  type="text"
                  value={formValues.newCategoryIcon}
                  onChange={(event) =>
                    handleFieldChange((prev) => ({
                      ...prev,
                      newCategoryIcon: Array.from(event.target.value).slice(0, 4).join('')
                    }))
                  }
                  placeholder="Ej: 💡"
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                />
                <Box className="flex flex-wrap gap-2">
                  {CATEGORY_EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        handleFieldChange((prev) => ({ ...prev, newCategoryIcon: emoji }))
                      }
                      className={`rounded-xl px-3 py-2 text-base transition ${
                        formValues.newCategoryIcon === emoji
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange((prev) => ({ ...prev, newCategoryIcon: '' }))
                    }
                    className={`rounded-xl px-3 py-2 text-xs transition ${
                      formValues.newCategoryIcon === ''
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    Sin emoji
                  </button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {formError && (
          <Box className="rounded-xl bg-[color:var(--color-warning)]/10 p-3">
            <Typography variant="caption">
              <span className="font-semibold text-[color:var(--color-warning)]">{formError}</span>
            </Typography>
          </Box>
        )}
      </FormWrapper>
    </Box>
  );
}

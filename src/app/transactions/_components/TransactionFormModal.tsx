'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  FormWrapper,
  Input,
  DropMenu,
  Typography,
  ActionButton,
  DateInput,
  ButtonBase
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

  const resolvedTypeId =
    transaction.type_id ?? (transaction.amount > 0 ? INCOME_TYPE_ID : EXPENSE_TYPE_ID);
  const isIncome = resolvedTypeId === INCOME_TYPE_ID;
  return {
    accountId: String(transaction.account_id),
    amount: String(Math.abs(transaction.amount)),
    typeId: String(resolvedTypeId ?? EXPENSE_TYPE_ID),
    date: toDateLocal(transaction.date),
    description: transaction.description ?? '',
    categoryMode: 'existing',
    categoryId: transaction.category_id ? String(transaction.category_id) : '',
    newCategoryDescription: '',
    newCategoryType: String(resolvedTypeId ?? EXPENSE_TYPE_ID),
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

    const normalizedAmount = Math.abs(Number(formValues.amount) || 0);
    const typeId = Number(formValues.typeId);

    const payload: CreateTransactionPayload = {
      account_id: String(formValues.accountId),
      amount: normalizedAmount,
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

          <DateInput
            label="Fecha"
            required
            value={formValues.date}
            onValueChange={(value) =>
              handleFieldChange((prev) => ({ ...prev, date: value }))
            }
          />
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
                <Box className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Box className="flex-1">
                    <Input
                      label="Color (hex)"
                      value={formValues.newCategoryColor}
                      onValueChange={(value) =>
                        handleFieldChange((prev) => ({
                          ...prev,
                          newCategoryColor: String(value ?? '').trim().toUpperCase()
                        }))
                      }
                      placeholder="#AABBCC"
                    />
                  </Box>
                  <ButtonBase
                    htmlType="button"
                    onClick={() => handleFieldChange((prev) => ({ ...prev, newCategoryColor: '' }))}
                    className="!rounded-xl !border-0 !bg-white/10 !px-4 !py-2 text-sm text-slate-200 transition hover:!bg-white/20"
                    ariaLabel="Limpiar color"
                  >
                    Limpiar
                  </ButtonBase>
                </Box>
                <Box className="flex flex-wrap gap-2">
                  {CATEGORY_COLOR_OPTIONS.map((option) => (
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

              <Box className="space-y-2">
                <Input
                  label="Emoji (opcional)"
                  value={formValues.newCategoryIcon}
                  onValueChange={(value) =>
                    handleFieldChange((prev) => ({
                      ...prev,
                      newCategoryIcon: Array.from(String(value ?? '')).slice(0, 4).join('')
                    }))
                  }
                  placeholder="Ej: 💡"
                />
                <Box className="flex flex-wrap gap-2">
                  {CATEGORY_EMOJI_SUGGESTIONS.map((emoji) => (
                    <ButtonBase
                      key={emoji}
                      htmlType="button"
                      onClick={() =>
                        handleFieldChange((prev) => ({ ...prev, newCategoryIcon: emoji }))
                      }
                      className={`!rounded-xl !border-0 !px-3 !py-2 text-base transition ${
                        formValues.newCategoryIcon === emoji
                          ? '!bg-white/20 !text-white'
                          : '!bg-white/5 !text-slate-200 hover:!bg-white/10'
                      }`}
                      ariaLabel={`Emoji ${emoji}`}
                    >
                      {emoji}
                    </ButtonBase>
                  ))}
                  <ButtonBase
                    htmlType="button"
                    onClick={() =>
                      handleFieldChange((prev) => ({ ...prev, newCategoryIcon: '' }))
                    }
                    className={`!rounded-xl !border-0 !px-3 !py-2 text-xs transition ${
                      formValues.newCategoryIcon === ''
                        ? '!bg-white/20 !text-white'
                        : '!bg-white/5 !text-slate-200 hover:!bg-white/10'
                    }`}
                    ariaLabel="Sin emoji"
                  >
                    Sin emoji
                  </ButtonBase>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {formError && (
          <Box className="rounded-xl bg-[color:var(--color-warning)]/10 p-3">
            <Typography variant="caption" className="font-semibold text-[color:var(--color-warning)]">
              {formError}
            </Typography>
          </Box>
        )}
      </FormWrapper>
    </Box>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  FormWrapper,
  Input,
  DropMenu,
  Typography,
  ActionButton,
  DateInput,
  ButtonBase,
} from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import { useTransactionsStore } from '@/lib/stores/transactions';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '@/features/transactions/mutations';
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-presets';
import { formatAccountName } from '@/lib/format';
import type { Category } from '@/lib/types';
import type { Account, AccountTransaction } from '@/types';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

type CategoryMode = 'existing' | 'new';

type TransactionFormState = {
  accountId: string;
  amount: string;
  typeId: string;
  date: string;
  description: string;
  categoryMode: CategoryMode;
  categoryId: string;
  newCategoryDescription: string;
  newCategoryColor: string;
};

export interface TransactionFormProps {
  mode: 'create' | 'edit';
  /** Para edit mode: transaccion a editar */
  transaction?: AccountTransaction | {
    transaction_id: string;
    account_id: string;
    amount: number;
    type_id?: number;
    date: string;
    description?: string | null;
    category_id?: string | null;
  };
  /** ID de cuenta fijo (cuando se usa desde vista de cuenta) */
  fixedAccountId?: string;
  /** Lista de cuentas (cuando se permite seleccionar cuenta) */
  accounts?: Account[];
  /** Lista de categorias (si no se provee, se cargan del store) */
  categories?: Category[];
  /** Incluir Card wrapper con titulo */
  withCard?: boolean;
  /** Callback al completar */
  onSuccess?: (status: 'created' | 'updated') => void;
  /** Callback al cancelar */
  onCancel?: () => void;
}

function toDateLocal(value: string): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function buildInitialState(
  props: TransactionFormProps
): TransactionFormState {
  const { mode, transaction, fixedAccountId, accounts } = props;

  if (mode === 'edit' && transaction) {
    // Normalizar la transaccion (puede venir en formato snake_case o camelCase)
    const txAccountId = 'accountId' in transaction
      ? String(transaction.accountId)
      : String((transaction as any).account_id ?? '');
    const txTypeId = 'typeId' in transaction
      ? transaction.typeId
      : (transaction as any).type_id ?? EXPENSE_TYPE_ID;
    const txCategoryId = 'categoryId' in transaction
      ? transaction.categoryId
      : (transaction as any).category_id;
    const txDate = 'date' in transaction ? transaction.date : '';
    const txDescription = 'description' in transaction ? transaction.description : '';

    return {
      accountId: txAccountId,
      amount: String(Math.abs(transaction.amount)),
      typeId: String(txTypeId),
      date: toDateLocal(txDate),
      description: txDescription ?? '',
      categoryMode: 'existing',
      categoryId: txCategoryId ? String(txCategoryId) : '',
      newCategoryDescription: '',
      newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
    };
  }

  // Create mode
  const defaultAccountId = fixedAccountId
    ?? (accounts?.length ? String(accounts[0].accountId) : '');

  return {
    accountId: defaultAccountId,
    amount: '',
    typeId: String(EXPENSE_TYPE_ID),
    date: new Date().toISOString().slice(0, 10),
    description: '',
    categoryMode: 'existing',
    categoryId: '',
    newCategoryDescription: '',
    newCategoryColor: CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff',
  };
}

export default function TransactionForm({
  mode,
  transaction,
  fixedAccountId,
  accounts,
  categories: externalCategories,
  withCard = true,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [formValues, setFormValues] = useState<TransactionFormState>(() =>
    buildInitialState({ mode, transaction, fixedAccountId, accounts })
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Store para categorias (si no se proveen externamente)
  const storeCategories = useTransactionsStore(state => state.categories);
  const categoriesLoading = useTransactionsStore(state => state.categoriesLoading);
  const fetchCategories = useTransactionsStore(state => state.fetchCategories);

  const categories = externalCategories ?? storeCategories;

  // Cargar categorias si no estan en cache
  useEffect(() => {
    if (!externalCategories && !storeCategories.length && !categoriesLoading) {
      fetchCategories();
    }
  }, [externalCategories, storeCategories.length, categoriesLoading, fetchCategories]);

  // Mutations
  const transactionId = transaction
    ? ('transactionId' in transaction ? transaction.transactionId : (transaction as any).transaction_id)
    : null;
  const createMutation = useCreateTransactionMutation();
  const updateMutation = useUpdateTransactionMutation(transactionId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Opciones de cuenta (solo si se permite seleccionar)
  const accountOptions: DropMenuOption[] = useMemo(() => {
    if (!accounts) return [];
    return accounts.map(account => ({
      value: String(account.accountId),
      label: formatAccountName(account.name, account.currency ?? undefined),
    }));
  }, [accounts]);

  // Filtrar categorias por tipo de transaccion
  const categoryOptions: DropMenuOption[] = useMemo(() => {
    const typeId = Number(formValues.typeId);
    return categories
      .filter(category => {
        const catTypeId = 'typeId' in category ? category.typeId : (category as any).type_id;
        return catTypeId === typeId;
      })
      .slice()
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(category => {
        const catId = 'categoryId' in category ? category.categoryId : (category as any).category_id;
        return {
          value: String(catId),
          label: category.description,
        };
      });
  }, [categories, formValues.typeId]);

  const typeOptions: DropMenuOption[] = [
    { value: String(EXPENSE_TYPE_ID), label: 'Salida' },
    { value: String(INCOME_TYPE_ID), label: 'Ingreso' },
  ];

  const categoryModeButtons: Array<{ label: string; value: CategoryMode }> = [
    { label: 'Existente', value: 'existing' },
    { label: 'Nueva', value: 'new' },
  ];

  const buttons: ButtonProps[] = [
    ...(onCancel
      ? [
          {
            type: 'neutral' as const,
            text: 'Cancelar',
            onClick: onCancel,
            disabled: isSubmitting,
          },
        ]
      : []),
    {
      type: 'primary' as const,
      text: isSubmitting
        ? 'Guardando...'
        : mode === 'create'
          ? 'Registrar transaccion'
          : 'Guardar cambios',
      htmlType: 'submit' as const,
      disabled: isSubmitting,
    },
  ];

  const handleFieldChange = (
    updater: (state: TransactionFormState) => TransactionFormState
  ) => {
    setFormError(null);
    setFormValues(prev => updater(prev));
  };

  const handleSubmit = async () => {
    setFormError(null);

    // Validaciones
    if (!formValues.accountId && !fixedAccountId) {
      setFormError('Selecciona una cuenta');
      return;
    }
    if (!formValues.amount) {
      setFormError('Ingresa un monto');
      return;
    }

    const normalizedAmount = Math.abs(Number(formValues.amount) || 0);
    const typeId = Number(formValues.typeId);

    const payload: Record<string, unknown> = {
      account_id: fixedAccountId ?? formValues.accountId,
      amount: normalizedAmount,
      type_id: typeId,
      date: new Date(formValues.date || new Date()).toISOString(),
      description: formValues.description.trim() || undefined,
    };

    if (formValues.categoryMode === 'existing') {
      if (!formValues.categoryId) {
        setFormError('Elegi una categoria existente o crea una nueva.');
        return;
      }
      payload.category_id = String(formValues.categoryId);
    } else {
      if (!formValues.newCategoryDescription.trim()) {
        setFormError('Ingresa la descripcion de la nueva categoria');
        return;
      }
      // IMPORTANTE: El tipo de la nueva categoria DEBE coincidir con el tipo de transaccion
      payload.category = {
        description: formValues.newCategoryDescription.trim(),
        type_id: typeId, // Siempre usa el tipo de la transaccion
        color: formValues.newCategoryColor?.trim() || undefined,
      };
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(payload as any);
        onSuccess?.('created');
      } else if (transactionId) {
        await updateMutation.mutateAsync(payload as any);
        onSuccess?.('updated');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo guardar la transaccion';
      setFormError(message);
    }
  };

  const formContent = (
    <FormWrapper
      onSubmit={handleSubmit}
      buttons={buttons}
      onError={error => setFormError(error.message)}
      className="space-y-4"
    >
      {/* Selector de cuenta (solo si se permite seleccionar) */}
      {accounts && accounts.length > 0 && (
        <DropMenu
          label="Cuenta"
          required
          options={accountOptions}
          value={formValues.accountId}
          onValueChange={value =>
            handleFieldChange(prev => ({
              ...prev,
              accountId: value != null ? String(value) : '',
            }))
          }
          placeholder="Elegi una cuenta"
        />
      )}

      <Box className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Monto"
          type="number"
          required
          value={formValues.amount}
          onValueChange={value =>
            handleFieldChange(prev => ({ ...prev, amount: String(value ?? '') }))
          }
          placeholder="0"
        />

        <DateInput
          label="Fecha"
          required
          value={formValues.date}
          onValueChange={value => handleFieldChange(prev => ({ ...prev, date: value }))}
        />
      </Box>

      <DropMenu
        label="Tipo"
        required
        options={typeOptions}
        value={formValues.typeId}
        onValueChange={value =>
          handleFieldChange(prev => {
            const nextType = value != null ? String(value) : prev.typeId;
            const typeChanged = nextType !== prev.typeId;
            return {
              ...prev,
              typeId: nextType,
              // Limpiar categoria cuando cambia el tipo
              categoryId: typeChanged ? '' : prev.categoryId,
            };
          })
        }
      />

      <Input
        label="Descripcion"
        value={formValues.description}
        onValueChange={value =>
          handleFieldChange(prev => ({ ...prev, description: String(value ?? '') }))
        }
        placeholder="Detalle del movimiento"
      />

      <Box className="space-y-3">
        <Typography
          variant="caption"
          className="uppercase tracking-wide text-[color:var(--text-muted)]"
        >
          Categoria
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
                  }))
                }
              />
            );
          })}
        </Box>

        {formValues.categoryMode === 'existing' ? (
          <DropMenu
            label="Selecciona una categoria"
            required
            options={categoryOptions}
            value={formValues.categoryId}
            onValueChange={value =>
              handleFieldChange(prev => ({
                ...prev,
                categoryId: value != null ? String(value) : '',
              }))
            }
            placeholder={
              categoriesLoading ? 'Cargando categorias...' : 'Elegi una categoria'
            }
            disabled={categoriesLoading}
          />
        ) : (
          <Box className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Typography variant="caption" className="text-xs text-[color:var(--text-muted)]">
              La nueva categoria sera del tipo "{formValues.typeId === String(INCOME_TYPE_ID) ? 'Ingreso' : 'Salida'}"
            </Typography>
            <Input
              label="Descripcion"
              required
              value={formValues.newCategoryDescription}
              onValueChange={value =>
                handleFieldChange(prev => ({
                  ...prev,
                  newCategoryDescription: String(value ?? ''),
                }))
              }
              placeholder="Nombre de la nueva categoria"
            />
            <Box className="space-y-2">
              <Box className="flex flex-wrap gap-2">
                {CATEGORY_COLOR_OPTIONS.map(option => (
                  <ButtonBase
                    key={option.value}
                    htmlType="button"
                    onClick={() =>
                      handleFieldChange(prev => ({
                        ...prev,
                        newCategoryColor: option.value,
                      }))
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

      {formError && (
        <Box className="rounded-xl bg-[color:var(--color-warning)]/10 p-3">
          <Typography
            variant="caption"
            className="font-semibold text-[color:var(--color-warning)]"
          >
            {formError}
          </Typography>
        </Box>
      )}
    </FormWrapper>
  );

  if (!withCard) {
    return formContent;
  }

  return (
    <Card
      tone="accent"
      title={mode === 'create' ? 'Registrar transaccion' : 'Editar transaccion'}
    >
      {formContent}
    </Card>
  );
}

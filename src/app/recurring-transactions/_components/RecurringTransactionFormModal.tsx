'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  FormWrapper,
  Input,
  DropMenu,
  Typography,
} from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui/inputs/DropMenu';
import type { ButtonProps } from '@/components/shared/ui/buttons';
import {
  useCreateRecurringTransactionMutation,
  useUpdateRecurringTransactionMutation,
} from '@/features/recurring-transactions/mutations';
import { useAccountsQuery } from '@/features/accounts/queries';
import { useCategoriesQuery } from '@/features/categories/queries';
import type { CreateRecurringTransactionPayload, RecurringTransaction } from '@/lib/types';
import { formatAccountName } from '@/lib/format';

const EXPENSE_TYPE_ID = 1;
const INCOME_TYPE_ID = 2;

type RecurringTransactionFormModalProps = {
  mode: 'create' | 'edit';
  transaction?: RecurringTransaction;
  onCompleted: (status: 'created' | 'updated') => void;
  onCancel: () => void;
};

type RecurringTransactionFormState = {
  description: string;
  amount: string;
  accountId: string;
  categoryId: string;
  typeId: string;
  frequency: string;
  startDate: string;
};

const DEFAULT_FORM: RecurringTransactionFormState = {
  description: '',
  amount: '',
  accountId: '',
  categoryId: '',
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
    categoryId: String(transaction.category_id),
    typeId: String(transaction.type_id),
    frequency: transaction.frequency,
    startDate: transaction.start_date,
  };
}

export default function RecurringTransactionFormModal({
  mode,
  transaction,
  onCompleted,
  onCancel,
}: RecurringTransactionFormModalProps) {
  const [formValues, setFormValues] = useState<RecurringTransactionFormState>(() =>
    buildInitialState(transaction)
  );
  const [formError, setFormError] = useState<string | null>(null);

  const accountsQuery = useAccountsQuery();
  const categoriesQuery = useCategoriesQuery();

  const createMutation = useCreateRecurringTransactionMutation();
  const updateMutation = useUpdateRecurringTransactionMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const accounts = accountsQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];

  const accountOptions: DropMenuOption[] = useMemo(
    () =>
      accounts.map((account) => ({
        value: String(account.account_id),
        label: formatAccountName(
          account.name,
          typeof account.currency === 'string' ? account.currency : account.currency?.label
        ),
      })),
    [accounts]
  );

  const categoryOptions: DropMenuOption[] = useMemo(
    () =>
      categories
        .map((category) => ({
          value: String(category.category_id),
          label: category.description,
        })),
    [categories]
  );

  const typeOptions: DropMenuOption[] = [
    { value: String(EXPENSE_TYPE_ID), label: 'Gasto' },
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

  const handleSubmit = async () => {
    setFormError(null);

    const payload: CreateRecurringTransactionPayload = {
      description: formValues.description,
      amount: (Number(formValues.typeId) === EXPENSE_TYPE_ID ? -1 : 1) * Math.abs(Number(formValues.amount) || 0),
      account_id: String(formValues.accountId),
      category_id: String(formValues.categoryId),
      type_id: Number(formValues.typeId),
      frequency: formValues.frequency as any,
      start_date: formValues.startDate,
      interval: 1,
    };

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
        <DropMenu
          label="Categoría"
          required
          options={categoryOptions}
          value={formValues.categoryId}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, categoryId: String(value ?? '') }))}
        />
        <DropMenu
          label="Tipo"
          required
          options={typeOptions}
          value={formValues.typeId}
          onValueChange={(value) => handleFieldChange((prev) => ({ ...prev, typeId: String(value ?? '') }))}
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

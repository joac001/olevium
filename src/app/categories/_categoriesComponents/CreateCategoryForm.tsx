'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu, Typography, Button } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { useTransactionData } from '@/context/TransactionContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { TransactionCategoryCreateInput } from '@/types';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
}

export default function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const createCategory = useTransactionsStore(state => state.createCategory);
  const fetchTransactionTypes = useTransactionsStore(state => state.fetchTransactionTypes);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [isRequestingTypes, setIsRequestingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { transactionTypes, transactionTypesLoading } = useTransactionData();

  const ensureTransactionTypes = useCallback(async () => {
    if (transactionTypesLoading || isRequestingTypes) return;
    if (transactionTypes.length) {
      setTypesError(null);
      return;
    }

    setIsRequestingTypes(true);
    try {
      await fetchTransactionTypes();
      setTypesError(null);
    } catch (error) {
      const context = createOperationContext(
        'fetch',
        'tipos de transaccion',
        'los tipos de transaccion'
      );
      showError(error, context);
      setTypesError('No pudimos cargar los tipos de transaccion. Reintenta nuevamente.');
    } finally {
      setIsRequestingTypes(false);
    }
  }, [
    fetchTransactionTypes,
    isRequestingTypes,
    showError,
    transactionTypes.length,
    transactionTypesLoading,
  ]);

  useEffect(() => {
    void ensureTransactionTypes();
  }, [ensureTransactionTypes]);

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map(type => ({
        value: type.typeId,
        label: type.name,
      })),
    [transactionTypes]
  );

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Creando...' : 'Crear categoria',
        htmlType: 'submit' as const,
        type: 'primary' as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const descriptionValue = formData.get('description');
      const typeValue = formData.get('typeId');
      const colorValue = formData.get('color');

      if (typeof descriptionValue !== 'string' || typeof typeValue !== 'string') {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Formulario incompleto',
          'Descripcion y tipo son obligatorios.'
        );
        return;
      }

      const trimmedDescription = descriptionValue.trim();
      if (!trimmedDescription) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Datos invalidos',
          'La descripcion no puede estar vacia.'
        );
        return;
      }

      const typeId = Number(typeValue);
      if (!Number.isFinite(typeId)) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Tipo invalido',
          'Selecciona un tipo valido.'
        );
        return;
      }

      const colorRaw =
        typeof colorValue === 'string' && colorValue.trim().length ? colorValue.trim() : null;

      const payload: TransactionCategoryCreateInput = {
        description: trimmedDescription,
        typeId,
        color: colorRaw,
      };

      setIsSubmitting(true);

      try {
        await createCategory(payload);

        const context = createOperationContext('create', 'categoria', 'la categoria');
        showSuccess('Categoria creada exitosamente. Esta lista para usarse.', context);

        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('create', 'categoria', 'la categoria');
        showError(error, context);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createCategory, onSuccess, showNotification, showError, showSuccess]
  );

  const isLoadingTypes = transactionTypesLoading || isRequestingTypes;
  const hasOptions = typeOptions.length > 0;

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="description"
          label="Descripcion"
          placeholder="Nombre de la categoria"
          required
          icon="fas fa-tag"
        />

        <DropMenu
          name="typeId"
          label="Tipo"
          options={typeOptions}
          required
          disabled={isLoadingTypes}
          placeholder={
            isLoadingTypes
              ? 'Cargando tipos...'
              : hasOptions
                ? 'Selecciona una opcion'
                : 'Presiona "Reintentar" para cargar tipos'
          }
        />

        {isLoadingTypes && (
          <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
            Cargando tipos de transaccion...
          </Typography>
        )}

        {!isLoadingTypes && !hasOptions && (
          <Box className="flex flex-col gap-2">
            <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
              {typesError ??
                'No hay tipos de transaccion disponibles. Reintenta cargar antes de registrar una categoria.'}
            </Typography>
            <Button
              type="secondary"
              text="Reintentar"
              onClick={ensureTransactionTypes}
              disabled={isLoadingTypes}
              className="w-fit px-3 py-1 text-xs"
            />
          </Box>
        )}

        <Input name="color" label="Color (opcional)" placeholder="#AABBCC" icon="fas fa-palette" />
      </Box>
    </FormWrapper>
  );
}

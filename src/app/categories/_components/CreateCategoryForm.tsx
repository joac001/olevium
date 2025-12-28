'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu, Typography, Button, ButtonBase } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { TransactionCategoryCreateInput } from '@/types';
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-presets';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
}

export default function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const createCategory = useTransactionsStore(state => state.createCategory);
  const fetchTransactionTypes = useTransactionsStore(state => state.fetchTransactionTypes);
  const transactionTypes = useTransactionsStore(state => state.transactionTypes);
  const transactionTypesLoading = useTransactionsStore(state => state.transactionTypesLoading);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [isRequestingTypes, setIsRequestingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');

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
        value: String(type.typeId),
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

      if (typeof descriptionValue !== 'string' || !selectedTypeId) {
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

      const typeId = Number(selectedTypeId);
      if (!Number.isFinite(typeId)) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Tipo invalido',
          'Selecciona un tipo valido.'
        );
        return;
      }

      const payload: TransactionCategoryCreateInput = {
        description: trimmedDescription,
        typeId,
        color: selectedColor,
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
    [createCategory, onSuccess, selectedColor, selectedTypeId, showNotification, showError, showSuccess]
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
          value={selectedTypeId}
          onValueChange={value => setSelectedTypeId(String(value ?? ''))}
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

        <Box className="space-y-2">
          <Typography variant="caption" className="uppercase tracking-wide text-[color:var(--text-muted)]">
            Color
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {CATEGORY_COLOR_OPTIONS.map(option => (
              <ButtonBase
                key={option.value}
                htmlType="button"
                onClick={() => setSelectedColor(option.value)}
                className={`!h-8 !w-8 !rounded-full !border-2 !p-0 transition ${
                  selectedColor === option.value
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
    </FormWrapper>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Tag } from 'lucide-react';

import { Box, FormWrapper, Input, DropMenu, Typography, Button, ButtonBase } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useCreateCategoryMutation } from '@/features/categories/queries';
import { useTransactionTypesQuery } from '@/features/transactions/queries';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-presets';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
}

export default function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const {
    data: transactionTypes = [],
    isLoading: transactionTypesLoading,
    refetch: refetchTypes,
  } = useTransactionTypesQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map(type => ({
        value: String(type.type_id),
        label: type.name,
      })),
    [transactionTypes]
  );

  const isSubmitting = createCategoryMutation.isPending;

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
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Formulario incompleto',
          'Descripcion y tipo son obligatorios.'
        );
        return;
      }

      const trimmedDescription = descriptionValue.trim();
      if (!trimmedDescription) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Datos invalidos',
          'La descripcion no puede estar vacia.'
        );
        return;
      }

      const typeId = Number(selectedTypeId);
      if (!Number.isFinite(typeId)) {
        showNotification(
          <AlertTriangle className="h-5 w-5" />,
          'danger',
          'Tipo invalido',
          'Selecciona un tipo valido.'
        );
        return;
      }

      try {
        await createCategoryMutation.mutateAsync({
          description: trimmedDescription,
          type_id: typeId,
          color: selectedColor,
        });

        const context = createOperationContext('create', 'categoria', 'la categoria');
        showSuccess('Categoria creada exitosamente. Esta lista para usarse.', context);

        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('create', 'categoria', 'la categoria');
        showError(error, context);
      }
    },
    [createCategoryMutation, onSuccess, selectedColor, selectedTypeId, showNotification, showError, showSuccess]
  );

  const isLoadingTypes = transactionTypesLoading;
  const hasOptions = typeOptions.length > 0;

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="description"
          label="Descripcion"
          placeholder="Nombre de la categoria"
          required
          icon={<Tag className="h-4 w-4" />}
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
              No hay tipos de transaccion disponibles. Reintenta cargar antes de registrar una categoria.
            </Typography>
            <Button
              type="secondary"
              text="Reintentar"
              onClick={() => void refetchTypes()}
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

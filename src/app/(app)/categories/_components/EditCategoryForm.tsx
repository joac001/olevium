'use client';

import { useMemo, useState, useCallback } from 'react';

import { Box, FormWrapper, Input, DropMenu, Typography, ButtonBase } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useUpdateCategoryMutation } from '@/features/categories/queries';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { Category, TransactionType } from '@/lib/types';
import { CATEGORY_COLOR_OPTIONS } from '@/lib/category-presets';

interface EditCategoryFormProps {
  category: Category;
  transactionTypes: TransactionType[];
  loadingTypes: boolean;
  onSuccess?: () => void;
}

export default function EditCategoryForm({
  category,
  transactionTypes,
  loadingTypes,
  onSuccess,
}: EditCategoryFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const updateCategoryMutation = useUpdateCategoryMutation(category.category_id);
  const [description, setDescription] = useState(category.description);
  const [typeId, setTypeId] = useState<string>(String(category.type_id));
  const [selectedColor, setSelectedColor] = useState<string>(
    category.color ?? CATEGORY_COLOR_OPTIONS[0]?.value ?? '#3f8aff'
  );

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map(type => ({
        value: String(type.type_id),
        label: type.name,
      })),
    [transactionTypes]
  );

  const isSubmitting = updateCategoryMutation.isPending;

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Guardando...' : 'Guardar cambios',
        htmlType: 'submit' as const,
        type: 'primary' as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async () => {
      if (!category.user_id) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Acción no permitida',
          'Esta categoría no se puede editar.'
        );
        return;
      }

      const trimmedDescription = description.trim();
      if (!trimmedDescription) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Datos inválidos',
          'La descripción no puede estar vacía.'
        );
        return;
      }

      const numTypeId = Number(typeId);
      if (!Number.isFinite(numTypeId)) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Tipo inválido',
          'Selecciona un tipo válido.'
        );
        return;
      }

      try {
        await updateCategoryMutation.mutateAsync({
          description: trimmedDescription,
          type_id: numTypeId,
          color: selectedColor,
        });

        const context = createOperationContext('update', 'categoría', 'la categoría');
        showSuccess('Categoría actualizada exitosamente. Cambios guardados.', context);

        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('update', 'categoría', 'la categoría');
        showError(error, context);
      }
    },
    [
      category.user_id,
      description,
      typeId,
      selectedColor,
      showNotification,
      updateCategoryMutation,
      onSuccess,
      showError,
      showSuccess,
    ]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          label="Descripción"
          value={description}
          onValueChange={(value) => setDescription(String(value ?? ''))}
          required
          icon="fas fa-tag"
        />

        <DropMenu
          label="Tipo"
          options={typeOptions}
          value={typeId}
          onValueChange={(value) => setTypeId(String(value ?? ''))}
          required
          disabled={loadingTypes || !typeOptions.length}
        />

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

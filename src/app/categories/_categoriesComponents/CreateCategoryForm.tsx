'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, DropMenu, Typography } from '@/components/shared/ui';
import type { DropMenuOption } from '@/components/shared/ui';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useNotification } from '@/context/NotificationContext';
import { useTransactionData } from '@/context/TransactionContext';
import type { TransactionCategoryCreateInput } from '@/types';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
}

export default function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { showNotification } = useNotification();
  const createCategory = useTransactionsStore(state => state.createCategory);
  const fetchTransactionTypes = useTransactionsStore(state => state.fetchTransactionTypes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { transactionTypes, transactionTypesLoading } = useTransactionData();

  useEffect(() => {
    if (!transactionTypes.length && !transactionTypesLoading) {
      fetchTransactionTypes().catch(error => {
        const message =
          error instanceof Error ? error.message : 'No pudimos cargar los tipos de transacción.';
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Error al cargar tipos',
          message
        );
      });
    }
  }, [fetchTransactionTypes, showNotification, transactionTypes.length, transactionTypesLoading]);

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
        text: isSubmitting ? 'Creando...' : 'Crear categoría',
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
          'Descripción y tipo son obligatorios.'
        );
        return;
      }

      const trimmedDescription = descriptionValue.trim();
      if (!trimmedDescription) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Datos inválidos',
          'La descripción no puede estar vacía.'
        );
        return;
      }

      const typeId = Number(typeValue);
      if (!Number.isFinite(typeId)) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Tipo inválido',
          'Selecciona un tipo válido.'
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
        showNotification(
          'fa-solid fa-circle-check',
          'success',
          'Categoría creada',
          'La nueva categoría está lista para usarse.'
        );
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo crear la categoría.';
        showNotification('fa-solid fa-triangle-exclamation', 'danger', 'Error al crear', message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [createCategory, onSuccess, showNotification]
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="description"
          label="Descripción"
          placeholder="Nombre de la categoría"
          required
          icon="fas fa-tag"
        />

        <DropMenu
          name="typeId"
          label="Tipo"
          options={typeOptions}
          required
          disabled={transactionTypesLoading || !typeOptions.length}
        />

        {!transactionTypesLoading && !typeOptions.length && (
          <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
            No hay tipos de transacción disponibles. Crea uno antes de registrar una categoría.
          </Typography>
        )}

        <Input name="color" label="Color (opcional)" placeholder="#AABBCC" icon="fas fa-palette" />
      </Box>
    </FormWrapper>
  );
}

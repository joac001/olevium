'use client';

import { useCallback, useMemo, useState } from 'react';

import { Box, FormWrapper, Input, Typography } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';
import type { CategoryBudgetSummary, CategoryBudgetUpsertPayload } from '@/lib/api';
import { upsertCategoryBudget } from '@/lib/api';

interface CategoryBudgetFormProps {
  categoryId: string;
  categoryName: string;
  year: number;
  month: number;
  currentBudget: CategoryBudgetSummary | null;
  onSuccess?: () => void;
}

export default function CategoryBudgetForm({
  categoryId,
  categoryName,
  year,
  month,
  currentBudget,
  onSuccess,
}: CategoryBudgetFormProps) {
  const { showNotification, showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? 'Guardando...' : 'Guardar presupuesto',
        htmlType: 'submit' as const,
        type: 'primary' as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting]
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const amountValue = formData.get('amount');

      if (typeof amountValue !== 'string') {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Formulario incompleto',
          'El monto mensual es obligatorio.'
        );
        return;
      }

      const parsed = Number(amountValue.replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        showNotification(
          'fa-solid fa-triangle-exclamation',
          'danger',
          'Monto inválido',
          'El presupuesto debe ser un número mayor a cero.'
        );
        return;
      }

      const payload: CategoryBudgetUpsertPayload = {
        category_id: categoryId,
        year,
        month,
        amount: parsed,
        // Por ahora usamos ARS (id=1) como moneda base para presupuestos.
        currency_id: 1,
      };

      setIsSubmitting(true);
      try {
        await upsertCategoryBudget(payload);
        const context = createOperationContext('save', 'presupuesto', 'el presupuesto');
        showSuccess('Presupuesto guardado correctamente para este mes.', context);
        onSuccess?.();
      } catch (error) {
        const context = createOperationContext('save', 'presupuesto', 'el presupuesto');
        showError(error, context);
      } finally {
        setIsSubmitting(false);
      }
    },
    [categoryId, month, onSuccess, showError, showNotification, showSuccess, year]
  );

  const monthLabel = month.toString().padStart(2, '0');

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-4">
      <Box className="space-y-2">
        <Typography
          variant="body"
          className="text-sm text-[color:var(--text-muted)] leading-relaxed"
        >
          Definí un presupuesto mensual para{' '}
          <span className="font-semibold text-[color:var(--text-primary)]">{categoryName}</span> en{' '}
          <span className="font-semibold">
            {monthLabel}/{year}
          </span>
          . Por ahora el presupuesto se guarda en moneda ARS.
        </Typography>
        {currentBudget && (
          <Typography
            variant="body"
            className="text-xs text-[color:var(--text-muted)] leading-relaxed"
          >
            Presupuesto actual: <span className="font-semibold">${currentBudget.amount}</span> ·
            Gastado: <span className="font-semibold">${currentBudget.spent}</span> (
            {Math.round(currentBudget.used_percent)}%).
          </Typography>
        )}
      </Box>

      <Input
        name="amount"
        label="Monto mensual"
        type="number"
        min="0"
        step="0.01"
        icon="fas fa-wallet"
        required
        defaultValue={currentBudget ? String(currentBudget.amount) : ''}
        placeholder="Ej: 50000"
      />
    </FormWrapper>
  );
}


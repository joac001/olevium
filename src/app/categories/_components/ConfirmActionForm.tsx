'use client';

import { useState, useCallback } from 'react';

import { Box, Typography, ButtonBase } from '@/components/shared/ui';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext } from '@/lib/utils/errorSystem';

interface ConfirmActionFormProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: 'accent' | 'danger' | 'primary';
  onConfirm: () => Promise<unknown>;
  onSuccess?: () => void;
  successMessage: string;
}

export default function ConfirmActionForm({
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onSuccess,
  successMessage,
}: ConfirmActionFormProps) {
  const { showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      const context = createOperationContext('update', 'categoria', 'la categoria');
      showSuccess(successMessage, context);
      onSuccess?.();
    } catch (error) {
      const context = createOperationContext('update', 'categoria', 'la categoria');
      showError(error, context);
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm, onSuccess, showError, showSuccess, successMessage]);

  return (
    <Box className="flex flex-col gap-5">
      <Box className="space-y-3">
        <Typography variant="body" className="text-sm font-medium text-[color:var(--text-primary)]">
          {title}
        </Typography>
        <Typography variant="body" className="text-xs text-[color:var(--text-muted)]">
          {description}
        </Typography>
      </Box>

      <ButtonBase
        variant={confirmVariant}
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Procesando...' : confirmLabel}
      </ButtonBase>
    </Box>
  );
}

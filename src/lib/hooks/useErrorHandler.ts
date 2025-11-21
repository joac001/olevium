'use client';

import { useCallback } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { createOperationContext, OperationContext } from '@/lib/utils/errorSystem';

interface UseErrorHandlerOptions {
  defaultContext?: OperationContext;
  onError?: (error: unknown) => void;
  showSuccessOnCompletion?: boolean;
  successMessage?: string;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showError, showSuccess } = useNotification();

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: OperationContext,
      customSuccessMessage?: string
    ): Promise<T | null> => {
      try {
        const result = await operation();

        if (options.showSuccessOnCompletion) {
          const message =
            customSuccessMessage || options.successMessage || 'Operación completada exitosamente';
          showSuccess(message, context || options.defaultContext);
        }

        return result;
      } catch (error) {
        showError(error, context || options.defaultContext);

        if (options.onError) {
          options.onError(error);
        }

        return null;
      }
    },
    [showError, showSuccess, options]
  );

  const handleAsyncOperationWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: OperationContext,
      customSuccessMessage?: string
    ): Promise<T | null> => {
      return handleAsyncOperation(operation, context, customSuccessMessage);
    },
    [handleAsyncOperation]
  );

  // Helpers para operaciones comunes
  const handleCreate = useCallback(
    (operation: () => Promise<unknown>, resourceName: string) => {
      const context = createOperationContext('create', resourceName, resourceName);
      return handleAsyncOperation(operation, context);
    },
    [handleAsyncOperation]
  );

  const handleUpdate = useCallback(
    (operation: () => Promise<unknown>, resourceName: string) => {
      const context = createOperationContext('update', resourceName, resourceName);
      return handleAsyncOperation(operation, context);
    },
    [handleAsyncOperation]
  );

  const handleDelete = useCallback(
    (operation: () => Promise<unknown>, resourceName: string) => {
      const context = createOperationContext('delete', resourceName, resourceName);
      return handleAsyncOperation(operation, context);
    },
    [handleAsyncOperation]
  );

  const handleFetch = useCallback(
    (operation: () => Promise<unknown>, resourceName: string) => {
      const context = createOperationContext('fetch', resourceName, resourceName);
      return handleAsyncOperation(operation, context);
    },
    [handleAsyncOperation]
  );

  return {
    handleAsyncOperation,
    handleAsyncOperationWithRetry,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleFetch,
  };
};

// Hook específico para formularios
export const useFormErrorHandler = () => {
  const { showError, showSuccess } = useNotification();

  const handleFormSubmission = useCallback(
    async <T>(
      submitFunction: () => Promise<T>,
      options: {
        successMessage?: string;
        errorContext?: OperationContext;
        onSuccess?: (result: T) => void;
        onError?: (error: unknown) => void;
      } = {}
    ): Promise<boolean> => {
      try {
        const result = await submitFunction();

        showSuccess(
          options.successMessage || 'Formulario enviado exitosamente',
          options.errorContext
        );

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return true;
      } catch (error) {
        showError(error, options.errorContext);

        if (options.onError) {
          options.onError(error);
        }

        return false;
      }
    },
    [showError, showSuccess]
  );

  return { handleFormSubmission };
};

// Hook para operaciones de autenticación
export const useAuthErrorHandler = () => {
  const { showError, showSuccess } = useNotification();

  const handleLogin = useCallback(
    async (loginFunction: () => Promise<unknown>) => {
      const context = createOperationContext('login', 'sesión', 'la sesión');
      try {
        await loginFunction();
        showSuccess('¡Bienvenido! Tu sesión se ha iniciado correctamente.', context);
        return true;
      } catch (error) {
        showError(error, context);
        return false;
      }
    },
    [showError, showSuccess]
  );

  const handleLogout = useCallback(
    async (logoutFunction: () => Promise<void>) => {
      const context = createOperationContext('logout', 'sesión', 'la sesión');
      try {
        await logoutFunction();
        showSuccess('Tu sesión se ha cerrado correctamente.', context);
        return true;
      } catch (error) {
        showError(error, context);
        return false;
      }
    },
    [showError, showSuccess]
  );

  return { handleLogin, handleLogout };
};

'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { StructuredError, ErrorProcessor, OperationContext } from '@/lib/utils/errorSystem';
import NotificationWrapper from '@/components/shared/ui/wrappers/NotificationWrapper';

interface NotificationContextType {
  // Metodos existentes para compatibilidad
  showNotification: (icon: string, color: string, title: string, description: string) => void;
  hideNotification: () => void;

  // Metodos mejorados
  showError: (
    error: unknown,
    context?: OperationContext,
    retryAction?: () => Promise<void>
  ) => string;
  showSuccess: (message: string, context?: OperationContext) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  dismissError: (errorId: string) => void;

  // Estado de errores activos
  activeErrors: StructuredError[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProps {
  icon: string;
  color: string;
  title: string;
  description: string;
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }

  return {
    showNotification: context.showNotification,
    hideNotification: context.hideNotification,
    showError: context.showError,
    showSuccess: context.showSuccess,
    showWarning: context.showWarning,
    showInfo: context.showInfo,
    dismissError: context.dismissError,
    activeErrors: context.activeErrors,
  };
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const DEFAULT_DURATION = 3000;
  const ERROR_DURATION = 4200;

  // Estado para notificaciones simples (compatibilidad)
  const [isOpen, setIsOpen] = useState(false);
  const [notificationProps, setNotificationProps] = useState<NotificationProps>(
    {} as NotificationProps
  );
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION);

  // Estado para errores estructurados
  const [activeErrors, setActiveErrors] = useState<StructuredError[]>([]);
  const [retryActions, setRetryActions] = useState<Record<string, () => Promise<void>>>({});
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Metodo original para compatibilidad
  const showNotification = useCallback(
    (icon: string, color: string, title: string, description: string) => {
      setNotificationProps({ icon, color, title, description });
      setDuration(DEFAULT_DURATION);
      setIsOpen(true);
    },
    [DEFAULT_DURATION]
  );

  const hideNotification = useCallback(() => {
    setIsOpen(false);
  }, []);

  const scheduleErrorDismiss = useCallback(
    (errorId: string) => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      errorTimeoutRef.current = setTimeout(() => {
        setActiveErrors(prev => prev.filter(error => error.id !== errorId));
        setRetryActions(prev => {
          const { [errorId]: _ignored, ...rest } = prev;
          return rest;
        });
        setIsOpen(false);
      }, ERROR_DURATION);
    },
    [ERROR_DURATION]
  );

  // Metodos mejorados
  const showError = useCallback(
    (error: unknown, context?: OperationContext, retryAction?: () => Promise<void>): string => {
      const structuredError = ErrorProcessor.process(error, context);

      if (retryAction) {
        structuredError.actions = [
          {
            label: 'Reintentar',
            action: retryAction,
            primary: true,
          },
          ...(structuredError.actions || []),
        ];
      }

      setActiveErrors([structuredError]);
      setRetryActions(retryAction ? { [structuredError.id]: retryAction } : {});

      setDuration(ERROR_DURATION);
      setIsOpen(true);
      scheduleErrorDismiss(structuredError.id);

      return structuredError.id;
    },
    [ERROR_DURATION, scheduleErrorDismiss]
  );

  const showSuccess = useCallback(
    (message: string, context?: OperationContext) => {
      const title = 'Exito';
      let enhancedMessage = message;

      if (context?.operation && context?.resource) {
        const operations: Record<string, (resource: string) => string> = {
          create: (resource: string) => `${resource} creado exitosamente`,
          update: (resource: string) => `${resource} actualizado exitosamente`,
          delete: (resource: string) => `${resource} eliminado exitosamente`,
          login: () => 'Sesion iniciada exitosamente',
          logout: () => 'Sesion cerrada exitosamente',
        };

        const operationMessage = operations[context.operation];
        if (operationMessage) {
          enhancedMessage = operationMessage(
            context.userFriendlyOperation ?? context.resource ?? ''
          );
        }
      }

      showNotification('fa-solid fa-circle-check', 'success', title, enhancedMessage);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Advertencia') => {
      showNotification('fa-solid fa-triangle-exclamation', 'warning', title, message);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Informacion') => {
      showNotification('fa-solid fa-info-circle', 'info', title, message);
    },
    [showNotification]
  );

  const dismissError = useCallback((errorId: string) => {
    setActiveErrors(prev => prev.filter(error => error.id !== errorId));
    setRetryActions(prev => {
      const { [errorId]: _ignored, ...rest } = prev;
      return rest;
    });
  }, []);

  const value: NotificationContextType = {
    showNotification,
    hideNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismissError,
    activeErrors,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationWrapper
        isOpen={isOpen}
        duration={duration}
        onClose={hideNotification}
        props={notificationProps}
        structuredErrors={activeErrors}
        onDismissError={dismissError}
        retryActions={retryActions}
      />
    </NotificationContext.Provider>
  );
};

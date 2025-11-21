import { AxiosError } from 'axios';

// Tipos de errores categorizados
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown',
}

// Severidad del error
export enum ErrorSeverity {
  LOW = 'low', // Errores recuperables, el usuario puede continuar
  MEDIUM = 'medium', // Errores que afectan funcionalidad pero no críticos
  HIGH = 'high', // Errores que bloquean funcionalidad importante
  CRITICAL = 'critical', // Errores que requieren atención inmediata
}

// Interfaz para errores estructurados
export interface StructuredError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  technicalMessage?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
  actions?: ErrorAction[];
  timestamp: Date;
}

// Acciones que puede tomar el usuario
export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

// Mapeo de códigos HTTP a tipos de error
const HTTP_STATUS_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.AUTHORIZATION,
  404: ErrorType.NOT_FOUND,
  422: ErrorType.VALIDATION,
  429: ErrorType.RATE_LIMIT,
  500: ErrorType.SERVER_ERROR,
  502: ErrorType.NETWORK,
  503: ErrorType.NETWORK,
  504: ErrorType.NETWORK,
};

// Contextos de operaciones para mensajes más específicos
export interface OperationContext extends Record<string, unknown> {
  operation: string;
  resource?: string;
  userFriendlyOperation?: string;
}

// Mensajes contextuales
const OPERATION_MESSAGES = {
  create: {
    success: (resource: string) => `${resource} creado exitosamente`,
    error: (resource: string) => `No se pudo crear ${resource}`,
  },
  update: {
    success: (resource: string) => `${resource} actualizado exitosamente`,
    error: (resource: string) => `No se pudo actualizar ${resource}`,
  },
  delete: {
    success: (resource: string) => `${resource} eliminado exitosamente`,
    error: (resource: string) => `No se pudo eliminar ${resource}`,
  },
  fetch: {
    error: (resource: string) => `No se pudo cargar ${resource}`,
  },
  login: {
    success: () => 'Sesión iniciada exitosamente',
    error: () => 'No se pudo iniciar sesión',
  },
  logout: {
    success: () => 'Sesión cerrada exitosamente',
    error: () => 'No se pudo cerrar la sesión',
  },
} as const;

export class ErrorProcessor {
  static process(
    error: unknown,
    context?: OperationContext,
    fallbackMessage?: string
  ): StructuredError {
    const timestamp = new Date();
    const id = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Procesar AxiosError
    if (error instanceof AxiosError) {
      return this.processAxiosError(error, context, id, timestamp);
    }

    // Procesar Error nativo
    if (error instanceof Error) {
      return this.processNativeError(error, context, id, timestamp, fallbackMessage);
    }

    // Error desconocido
    return this.createUnknownError(error, context, id, timestamp, fallbackMessage);
  }

  private static processAxiosError(
    error: AxiosError,
    context?: OperationContext,
    id: string = '',
    timestamp: Date = new Date()
  ): StructuredError {
    const status = error.response?.status;
    const responseData = error.response?.data as Record<string, unknown> | undefined;

    // Determinar tipo de error basado en status code
    const type = status
      ? HTTP_STATUS_TO_ERROR_TYPE[status] || ErrorType.SERVER_ERROR
      : ErrorType.NETWORK;

    // Extraer mensaje del backend
    const backendMessage =
      (typeof responseData?.detail === 'string' ? responseData.detail : undefined) ||
      (typeof responseData?.message === 'string' ? responseData.message : undefined) ||
      (typeof responseData?.error === 'string' ? responseData.error : undefined);

    // Generar mensaje contextual
    const { title, message, severity, recoverable, retryable } = this.generateContextualMessage(
      type,
      status,
      backendMessage,
      context
    );

    return {
      id,
      type,
      severity,
      title,
      message,
      technicalMessage: error.message,
      context: {
        status,
        url: error.config?.url,
        method: error.config?.method,
        ...context,
      },
      recoverable,
      retryable,
      actions: this.generateActions(type, retryable, context),
      timestamp,
    };
  }

  private static processNativeError(
    error: Error,
    context?: OperationContext,
    id: string = '',
    timestamp: Date = new Date(),
    fallbackMessage?: string
  ): StructuredError {
    const type = ErrorType.BUSINESS_LOGIC;
    const severity = ErrorSeverity.MEDIUM;

    let message = error.message;
    if (context?.operation && context?.resource) {
      const operationMsg = OPERATION_MESSAGES[context.operation as keyof typeof OPERATION_MESSAGES];
      if (operationMsg && 'error' in operationMsg) {
        message = operationMsg.error(context.userFriendlyOperation || context.resource);
      }
    }

    return {
      id,
      type,
      severity,
      title: 'Error en la operación',
      message: message || fallbackMessage || 'Ha ocurrido un error inesperado',
      technicalMessage: error.message,
      context,
      recoverable: true,
      retryable: false,
      actions: [],
      timestamp,
    };
  }

  private static createUnknownError(
    error: unknown,
    context?: OperationContext,
    id: string = '',
    timestamp: Date = new Date(),
    fallbackMessage?: string
  ): StructuredError {
    return {
      id,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      title: 'Error inesperado',
      message:
        fallbackMessage || 'Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente.',
      technicalMessage: String(error),
      context,
      recoverable: true,
      retryable: true,
      actions: [],
      timestamp,
    };
  }

  private static generateContextualMessage(
    type: ErrorType,
    status?: number,
    backendMessage?: string,
    context?: OperationContext
  ) {
    let severity = ErrorSeverity.MEDIUM;
    let recoverable = true;
    let retryable = false;
    let title = 'Error';
    let message = 'Ha ocurrido un error';

    switch (type) {
      case ErrorType.NETWORK:
        severity = ErrorSeverity.HIGH;
        retryable = true;
        title = 'Problema de conexión';
        message =
          'No se pudo conectar al servidor. Verifica tu conexión a internet e inténtalo nuevamente.';
        break;

      case ErrorType.AUTHENTICATION:
        severity = ErrorSeverity.HIGH;
        recoverable = false;
        title = 'Sesión expirada';
        message = backendMessage || 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        break;

      case ErrorType.AUTHORIZATION:
        severity = ErrorSeverity.HIGH;
        title = 'Sin permisos';
        message = backendMessage || 'No tienes permisos para realizar esta acción.';
        break;

      case ErrorType.VALIDATION:
        severity = ErrorSeverity.LOW;
        title = 'Datos inválidos';
        message =
          backendMessage ||
          'Los datos ingresados no son válidos. Revisa el formulario e inténtalo nuevamente.';
        break;

      case ErrorType.NOT_FOUND:
        severity = ErrorSeverity.MEDIUM;
        title = 'Recurso no encontrado';
        message = backendMessage || 'El recurso solicitado no existe o ha sido eliminado.';
        break;

      case ErrorType.RATE_LIMIT:
        severity = ErrorSeverity.MEDIUM;
        retryable = true;
        title = 'Demasiadas solicitudes';
        message =
          'Has enviado demasiadas solicitudes. Espera unos momentos e inténtalo nuevamente.';
        break;

      case ErrorType.SERVER_ERROR:
        severity = ErrorSeverity.HIGH;
        retryable = true;
        title = 'Error del servidor';
        message = 'Ha ocurrido un error en el servidor. Nuestro equipo técnico ha sido notificado.';
        break;

      default:
        break;
    }

    // Personalizar mensaje según contexto
    if (context?.operation && context?.resource) {
      const operationMsg = OPERATION_MESSAGES[context.operation as keyof typeof OPERATION_MESSAGES];
      if (operationMsg && 'error' in operationMsg) {
        message = operationMsg.error(context.userFriendlyOperation || context.resource);
        if (backendMessage) {
          message += `: ${backendMessage}`;
        }
      }
    }

    return { title, message, severity, recoverable, retryable };
  }

  private static generateActions(
    type: ErrorType,
    retryable: boolean,
    context?: OperationContext
  ): ErrorAction[] {
    const actions: ErrorAction[] = [];

    // Acción de reintentar
    if (retryable && context?.operation) {
      actions.push({
        label: 'Reintentar',
        action: () => {
          // Esta función se debería configurar desde el componente que maneja el error
        },
        primary: true,
      });
    }

    // Acción de contactar soporte para errores críticos
    if (type === ErrorType.SERVER_ERROR) {
      actions.push({
        label: 'Contactar Soporte',
        action: () => {
          // Abrir modal de contacto o redirect a soporte
          window.open('mailto:soporte@olevium.com?subject=Error del sistema', '_blank');
        },
      });
    }

    return actions;
  }
}

// Hook helper para generar contextos de operación
export const createOperationContext = (
  operation: string,
  resource?: string,
  userFriendlyOperation?: string
): OperationContext => ({
  operation,
  resource,
  userFriendlyOperation,
});

import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import {
  ErrorProcessor,
  ErrorSeverity,
  ErrorType,
  createOperationContext,
} from "@/lib/utils/errorSystem";

const makeAxiosError = (status: number, data: Record<string, unknown> = {}) =>
  new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data,
    config: { url: "/test", method: "GET" },
  } as any);

describe("ErrorProcessor.process - AxiosError", () => {
  it("clasifica error 400 como VALIDATION y usa backend detail", () => {
    const axiosError = makeAxiosError(400, { detail: "Campo inválido" });

    const structured = ErrorProcessor.process(axiosError);

    expect(structured.type).toBe(ErrorType.VALIDATION);
    expect(structured.severity).toBe(ErrorSeverity.LOW);
    expect(structured.message).toContain("Campo inválido");
  });

  it("clasifica error 401 como AUTHENTICATION con mensaje de sesión expirada", () => {
    const axiosError = makeAxiosError(401, {});

    const structured = ErrorProcessor.process(axiosError);

    expect(structured.type).toBe(ErrorType.AUTHENTICATION);
    expect(structured.severity).toBe(ErrorSeverity.HIGH);
    expect(structured.message).toContain("sesión ha expirado");
  });

  it("combina contexto de operación con mensaje del backend", () => {
    const axiosError = makeAxiosError(400, { detail: "Nombre duplicado" });
    const context = createOperationContext("create", "categoría", "la categoría");

    const structured = ErrorProcessor.process(axiosError, context);

    expect(structured.message).toContain("No se pudo crear la categoría");
    expect(structured.message).toContain("Nombre duplicado");
  });
});

describe("ErrorProcessor.process - Error nativo y desconocido", () => {
  it("usa mensaje contextual para Error nativo con operación", () => {
    const error = new Error("backend raw");
    const context = createOperationContext("delete", "categoría", "la categoría");

    const structured = ErrorProcessor.process(error, context);

    expect(structured.type).toBe(ErrorType.BUSINESS_LOGIC);
    expect(structured.message).toContain("No se pudo eliminar la categoría");
  });

  it("crea error UNKNOWN con fallback cuando el valor no es Error ni AxiosError", () => {
    const structured = ErrorProcessor.process("raw error", undefined, "Fallback msg");

    expect(structured.type).toBe(ErrorType.UNKNOWN);
    expect(structured.message).toContain("Fallback msg");
  });
});


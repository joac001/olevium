import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  deleteRecurringTransaction,
  postRecurringTransaction,
  putRecurringTransaction,
} from "@/features/recurring-transactions/mutations";
import { apiRequest, parseErrorMessage } from "@/lib/http";

vi.mock("@/lib/http", () => ({
  apiRequest: vi.fn(),
  parseErrorMessage: vi.fn().mockResolvedValue(null),
}));

const apiRequestMock = apiRequest as unknown as vi.Mock;
const parseErrorMessageMock = parseErrorMessage as unknown as vi.Mock;

describe("recurring-transactions mutations", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    parseErrorMessageMock.mockReset().mockResolvedValue(null);
  });

  it("postRecurringTransaction hace POST al endpoint correcto y devuelve el recurso", async () => {
    const payload = {
      account_id: "acc-1",
      category_id: "cat-1",
      type_id: 2,
      amount: 100,
      description: "Test",
      frequency: "monthly",
      interval: 1,
      start_date: "2024-01-01",
    };

    const responseBody = { recurring_transaction_id: "rt-1", ...payload };

    apiRequestMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => responseBody,
    });

    const result = await postRecurringTransaction(payload as any);

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/recurring-transactions/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(result.recurring_transaction_id).toBe("rt-1");
  });

  it("postRecurringTransaction lanza error cuando la respuesta no es OK", async () => {
    apiRequestMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    });
    parseErrorMessageMock.mockResolvedValue("Detalle de error");

    await expect(
      postRecurringTransaction({} as any),
    ).rejects.toThrow("Detalle de error");
  });

  it("putRecurringTransaction hace PATCH al endpoint correcto", async () => {
    const payload = { description: "Actualizado" };
    apiRequestMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ recurring_transaction_id: "rt-1", ...payload }),
    });

    const result = await putRecurringTransaction("rt-1", payload as any);

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/recurring-transactions/rt-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    );
    expect(result.description).toBe("Actualizado");
  });

  it("deleteRecurringTransaction hace DELETE al endpoint correcto y no lanza cuando es OK/204", async () => {
    apiRequestMock.mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => ({}),
    });

    await expect(
      deleteRecurringTransaction("rt-1"),
    ).resolves.toBeUndefined();

    expect(apiRequestMock).toHaveBeenCalledWith(
      "/recurring-transactions/rt-1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("deleteRecurringTransaction lanza error cuando la respuesta no es OK ni 204", async () => {
    apiRequestMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    parseErrorMessageMock.mockResolvedValue("Error al eliminar");

    await expect(
      deleteRecurringTransaction("rt-1"),
    ).rejects.toThrow("Error al eliminar");
  });
});


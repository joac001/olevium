import { describe, expect, it, vi } from "vitest";
import {
  buildAccountTypeOptions,
  buildCurrencyOptions,
  normalizeAccountFormData,
} from "@/app/accounts/_accountsComponents/accountFormUtils";
import type { AccountType, Currency } from "@/types";

const makeFormData = (values: Record<string, string>): FormData => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
};

describe("accountFormUtils - build options helpers", () => {
  it("buildAccountTypeOptions mapea correctamente AccountType a DropMenuOption", () => {
    const types: AccountType[] = [
      { typeId: 1, name: "Cuenta corriente", createdAt: "2024-01-01T00:00:00.000Z" },
    ];

    const options = buildAccountTypeOptions(types);

    expect(options).toEqual([{ value: 1, label: "Cuenta corriente" }]);
  });

  it("buildCurrencyOptions mapea correctamente Currency a DropMenuOption", () => {
    const currencies: Currency[] = [
      { currencyId: 1, label: "ARS", name: "Peso argentino" },
    ];

    const options = buildCurrencyOptions(currencies);

    expect(options).toEqual([
      { value: 1, label: "ARS - Peso argentino" },
    ]);
  });
});

describe("normalizeAccountFormData", () => {
  it("devuelve payload normalizado para datos válidos", () => {
    const formData = makeFormData({
      name: "  Cuenta prueba ",
      typeId: "1",
      currencyId: "2",
      balance: "100.5",
    });
    const showNotification = vi.fn();

    const result = normalizeAccountFormData({ formData, showNotification });

    expect(result).not.toBeNull();
    expect(result).toEqual({
      name: "Cuenta prueba",
      typeId: 1,
      currencyId: 2,
      balance: 100.5,
    });
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("notifica y devuelve null si falta algún campo requerido", () => {
    const formData = new FormData();
    formData.set("name", "");
    const showNotification = vi.fn();

    const result = normalizeAccountFormData({ formData, showNotification });

    expect(result).toBeNull();
    expect(showNotification).toHaveBeenCalledTimes(1);
    const [, tone, title] = showNotification.mock.calls[0];
    expect(tone).toBe("danger");
    expect(title).toBe("Formulario incompleto");
  });

  it("notifica y devuelve null si el nombre de la cuenta está vacío", () => {
    const formData = makeFormData({
      name: "   ",
      typeId: "1",
      currencyId: "1",
      balance: "0",
    });
    const showNotification = vi.fn();

    const result = normalizeAccountFormData({ formData, showNotification });

    expect(result).toBeNull();
    expect(showNotification).toHaveBeenCalledTimes(1);
    const [, tone, title, message] = showNotification.mock.calls[0];
    expect(tone).toBe("danger");
    expect(title).toBe("Datos inválidos");
    expect(message).toContain("nombre de la cuenta");
  });

  it("notifica y devuelve null si el balance no es numérico", () => {
    const formData = makeFormData({
      name: "Cuenta prueba",
      typeId: "1",
      currencyId: "1",
      balance: "no-numérico",
    });
    const showNotification = vi.fn();

    const result = normalizeAccountFormData({ formData, showNotification });

    expect(result).toBeNull();
    const [, , , message] = showNotification.mock.calls[0];
    expect(message).toContain("El balance debe ser un número válido");
  });

  it("notifica y devuelve null si la moneda es inválida", () => {
    const formData = makeFormData({
      name: "Cuenta prueba",
      typeId: "1",
      currencyId: "0",
      balance: "10",
    });
    const showNotification = vi.fn();

    const result = normalizeAccountFormData({ formData, showNotification });

    expect(result).toBeNull();
    const [, , , message] = showNotification.mock.calls[0];
    expect(message).toContain("moneda válida");
  });
});

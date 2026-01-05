import { describe, expect, it, vi } from "vitest";
import {
  CUSTOM_CATEGORY_VALUE,
  normalizeTransactionFormData,
} from "@/app/accounts/_accountsComponents/transactionFormUtils";

const makeFormData = (values: Record<string, string>): FormData => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
};

describe("normalizeTransactionFormData", () => {
  it("normaliza una transacción con categoría existente", () => {
    const formData = makeFormData({
      amount: "150",
      date: "2024-01-10",
      typeId: "2",
      categoryId: "cat-1",
      description: "  descripción de prueba ",
    });
    const showNotification = vi.fn();

    const result = normalizeTransactionFormData({
      formData,
      selectedType: 2,
      selectedCategory: "cat-1",
      customCategoryName: "",
      customCategoryDescription: "",
      showNotification,
    });

    expect(result).not.toBeNull();
    expect(result?.amount).toBe(150);
    expect(result?.typeId).toBe(2);
    expect(result?.categoryId).toBe("cat-1");
    expect(result?.category).toBeNull();
    expect(result?.description).toBe("descripción de prueba");
    expect(result?.date.startsWith("2024-01-10")).toBe(true);
    expect(showNotification).not.toHaveBeenCalled();
  });

  it("usa selectedType cuando está presente aunque typeId del formulario sea distinto", () => {
    const formData = makeFormData({
      amount: "10",
      date: "2024-01-01",
      typeId: "999",
      categoryId: "",
      description: "",
    });
    const showNotification = vi.fn();

    const result = normalizeTransactionFormData({
      formData,
      selectedType: 1,
      selectedCategory: CUSTOM_CATEGORY_VALUE,
      customCategoryName: "Custom",
      customCategoryDescription: "Desc",
      showNotification,
    });

    expect(result).not.toBeNull();
    expect(result?.typeId).toBe(1);
  });

  it("notifica y devuelve null si el monto no es numérico", () => {
    const formData = makeFormData({
      amount: "no-numérico",
      date: "2024-01-10",
      typeId: "1",
      categoryId: "",
      description: "",
    });
    const showNotification = vi.fn();

    const result = normalizeTransactionFormData({
      formData,
      selectedType: 1,
      selectedCategory: CUSTOM_CATEGORY_VALUE,
      customCategoryName: "",
      customCategoryDescription: "",
      showNotification,
    });

    expect(result).toBeNull();
    expect(showNotification).toHaveBeenCalledTimes(1);
    const [, , , message] = showNotification.mock.calls[0];
    expect(message).toContain("El monto debe ser numérico");
  });

  it("requiere nombre y descripción para categoría personalizada", () => {
    const formData = makeFormData({
      amount: "50",
      date: "2024-01-10",
      typeId: "1",
      categoryId: CUSTOM_CATEGORY_VALUE,
      description: "",
    });
    const showNotification = vi.fn();

    const result = normalizeTransactionFormData({
      formData,
      selectedType: 1,
      selectedCategory: CUSTOM_CATEGORY_VALUE,
      customCategoryName: "",
      customCategoryDescription: "",
      showNotification,
    });

    expect(result).toBeNull();
    const [, , , message] = showNotification.mock.calls[0];
    expect(message).toContain("Debes ingresar el nombre y la descripción");
  });

  it("construye correctamente la categoría personalizada cuando los datos son válidos", () => {
    const formData = makeFormData({
      amount: "75",
      date: "2024-01-10",
      typeId: "1",
      categoryId: CUSTOM_CATEGORY_VALUE,
      description: "",
    });
    const showNotification = vi.fn();

    const result = normalizeTransactionFormData({
      formData,
      selectedType: 1,
      selectedCategory: CUSTOM_CATEGORY_VALUE,
      customCategoryName: "Nueva categoría",
      customCategoryDescription: "Descripción nueva",
      showNotification,
    });

    expect(result).not.toBeNull();
    expect(result?.categoryId).toBeUndefined();
    expect(result?.category).not.toBeNull();
    expect(result?.category?.description).toBe("Nueva categoría");
    expect(result?.category?.type_id).toBe(1);
  });
});

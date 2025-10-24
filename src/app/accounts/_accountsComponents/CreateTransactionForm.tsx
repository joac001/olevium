'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, FormWrapper, Input, DropMenu } from "@/components/shared/ui";
import type { DropMenuOption } from "@/components/shared/ui";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { useNotification } from "@/context/NotificationContext";
import { useTransactionData } from "@/context/TransactionContext";
import { formatDateToISO } from "@/lib/utils/parser";

interface CreateTransactionFormProps {
  accountId: string;
  onSuccess?: () => void;
}

const CUSTOM_CATEGORY_VALUE = "__custom__";

export default function CreateTransactionForm({ accountId, onSuccess }: CreateTransactionFormProps) {
  const { showNotification } = useNotification();
  const { transactionTypes, categories, transactionTypesLoading, categoriesLoading } = useTransactionData();
  const createTransaction = useTransactionsStore((state) => state.createTransaction);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(CUSTOM_CATEGORY_VALUE);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryDescription, setCustomCategoryDescription] = useState("");

  useEffect(() => {
    if (!selectedType && transactionTypes.length) {
      setSelectedType(transactionTypes[0].typeId);
      // Seleccionar la primera categoría compatible para evitar estados inválidos
      const firstCategory = categories.find((category) => !category.typeId || category.typeId === transactionTypes[0].typeId);
      setSelectedCategory(firstCategory?.categoryId ?? CUSTOM_CATEGORY_VALUE);
    }
  }, [categories, selectedType, transactionTypes]);

  useEffect(() => {
    if (!selectedType) {
      setSelectedCategory(CUSTOM_CATEGORY_VALUE);
      return;
    }

    const firstForType = categories.find((category) => !category.typeId || category.typeId === selectedType);
    setSelectedCategory(firstForType?.categoryId ?? CUSTOM_CATEGORY_VALUE);
  }, [categories, selectedType]);

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map((type) => ({
        value: type.typeId,
        label: type.name,
      })),
    [transactionTypes],
  );

  const typeDisabled = transactionTypesLoading && transactionTypes.length === 0;

  const categoryOptions: DropMenuOption[] = useMemo(() => {
    const base: DropMenuOption[] = [
      { value: CUSTOM_CATEGORY_VALUE, label: "Personalizada" },
    ];

    const filtered = categories
      .filter((category) => !selectedType || !category.typeId || category.typeId === selectedType)
      .map((category) => ({
        value: category.categoryId,
        label: category.description,
      }));

    return [...base, ...filtered];
  }, [categories, selectedType]);

  const categoryDisabled = categoriesLoading && categories.length === 0;

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? "Guardando..." : "Agregar transacción",
        htmlType: "submit" as const,
        type: "primary" as const,
        disabled: isSubmitting,
      },
    ],
    [isSubmitting],
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const amountValue = formData.get("amount");
      const dateValue = formData.get("date");
      const typeValue = formData.get("typeId");
      const categoryValue = formData.get("categoryId");
      const descriptionValue = formData.get("description");

      if (typeof amountValue !== "string" || typeof dateValue !== "string" || typeof typeValue !== "string") {
        showNotification(
          "fa-solid fa-triangle-exclamation",
          "danger",
          "Formulario incompleto",
          "Monto, fecha y tipo son obligatorios.",
        );
        return;
      }

      const amount = Number(amountValue);
      if (!Number.isFinite(amount)) {
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Datos inválidos", "El monto debe ser numérico.");
        return;
      }

      const typeId = selectedType ?? Number(typeValue);
      if (!typeId) {
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Tipo inválido", "Selecciona un tipo de transacción válido.");
        return;
      }

      const isCustom = categoryValue === CUSTOM_CATEGORY_VALUE || selectedCategory === CUSTOM_CATEGORY_VALUE;
      let categoryId: string | null | undefined;
      if (!isCustom) {
        const raw = typeof categoryValue === "string" && categoryValue.length
          ? categoryValue
          : selectedCategory;
        if (raw && raw !== CUSTOM_CATEGORY_VALUE) {
          categoryId = raw;
        }
      }

      if (isCustom) {
        if (!customCategoryName.trim() || !customCategoryDescription.trim()) {
          showNotification(
            "fa-solid fa-triangle-exclamation",
            "danger",
            "Datos de categoría incompletos",
            "Debes ingresar el nombre y la descripción de la nueva categoría.",
          );
          return;
        }
      }

      const description = typeof descriptionValue === "string" ? descriptionValue.trim() : undefined;
      const finalDescription = description ?? (isCustom ? customCategoryDescription.trim() : undefined);

      const categoryPayload = isCustom
        ? {
            description: customCategoryName.trim(),
            type_id: typeId,
            color: null,
            icon: null,
          }
        : null;

      const isoDate = formatDateToISO(dateValue);

      setIsSubmitting(true);
      try {
        await createTransaction({
          accountId,
          amount,
          date: isoDate,
          typeId,
          categoryId: isCustom ? undefined : categoryId,
          category: categoryPayload,
          description: finalDescription ?? null,
        });

        showNotification(
          "fa-solid fa-circle-check",
          "success",
          "Transacción creada",
          "Registramos el movimiento en la cuenta.",
        );

        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo crear la transacción.";
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al crear transacción", message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [accountId, createTransaction, customCategoryDescription, customCategoryName, selectedType, showNotification, onSuccess, selectedCategory],
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="amount"
          type="number"
          step="0.01"
          label="Monto"
          placeholder="0"
          required
          icon="fas fa-money-bill-wave"
        />

        <Input
          name="date"
          type="date"
          label="Fecha"
          required
          icon="fas fa-calendar-days"
        />

        <DropMenu
          name="typeId"
          label="Tipo de transacción"
          options={typeOptions}
          required
          disabled={typeDisabled}
          onValueChange={(value) => {
            const normalized = typeof value === "number" ? value : Number(value);
            const nextType = Number.isFinite(normalized) ? normalized : null;
            setSelectedType(nextType);
            if (nextType !== null) {
              const firstForType = categories.find((category) => !category.typeId || category.typeId === nextType);
              setSelectedCategory(firstForType?.categoryId ?? CUSTOM_CATEGORY_VALUE);
            } else {
              setSelectedCategory(CUSTOM_CATEGORY_VALUE);
            }
          }}
          value={selectedType ?? undefined}
        />

        <DropMenu
          name="categoryId"
          label="Categoría"
          placeholder={categoriesLoading ? "Cargando categorías..." : "Selecciona una categoría"}
          options={categoryOptions}
          disabled={categoryDisabled}
          value={selectedCategory}
          onValueChange={(value) => {
            if (typeof value === "string") {
              setSelectedCategory(value);
            }
          }}
        />

        {selectedCategory === CUSTOM_CATEGORY_VALUE && (
          <Box className="space-y-4">
            <Input
              name="customCategoryName"
              label="Nombre de la nueva categoría"
              placeholder="Ej. Suscripciones"
              required
              icon="fas fa-tag"
              onValueChange={(value) => setCustomCategoryName(String(value))}
            />
            <Input
              name="customCategoryDescription"
              label="Descripción de la nueva categoría"
              placeholder="Detalle para recordar el uso"
              required
              icon="fas fa-align-left"
              onValueChange={(value) => setCustomCategoryDescription(String(value))}
            />
          </Box>
        )}

        <Input
          name="description"
          label="Descripción del movimiento"
          placeholder="Detalle del movimiento"
          icon="fas fa-pen"
        />
      </Box>
    </FormWrapper>
  );
}

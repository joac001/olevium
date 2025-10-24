'use client';

import { useCallback, useEffect, useMemo, useState } from "react";

import { Box, FormWrapper, Input, DropMenu } from "@/components/shared/ui";
import type { DropMenuOption } from "@/components/shared/ui";
import type { AccountTransaction } from "@/types";
import { useTransactionsStore } from "@/lib/stores/transactions";
import { useNotification } from "@/context/NotificationContext";
import { useTransactionData } from "@/context/TransactionContext";
import { formatDateToISO } from "@/lib/utils/parser";

interface EditTransactionFormProps {
  accountId: string;
  transaction: AccountTransaction;
  onSuccess?: () => void;
}

const CUSTOM_CATEGORY_VALUE = "__custom__";

export default function EditTransactionForm({ accountId, transaction, onSuccess }: EditTransactionFormProps) {
  const { showNotification } = useNotification();
  const { transactionTypes, categories, transactionTypesLoading, categoriesLoading } = useTransactionData();
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(transaction.typeId ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>(transaction.categoryId ?? CUSTOM_CATEGORY_VALUE);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryDescription, setCustomCategoryDescription] = useState("");

  useEffect(() => {
    if (!selectedType && transactionTypes.length) {
      setSelectedType(transactionTypes[0].typeId);
      const firstCategory = categories.find((category) => !category.typeId || category.typeId === transactionTypes[0].typeId);
      setSelectedCategory(firstCategory?.categoryId ?? CUSTOM_CATEGORY_VALUE);
    }
  }, [categories, selectedType, transactionTypes]);

  useEffect(() => {
    if (!selectedType) {
      setSelectedCategory(CUSTOM_CATEGORY_VALUE);
      return;
    }

    if (selectedCategory !== CUSTOM_CATEGORY_VALUE) {
      const exists = categories.some((category) => category.categoryId === selectedCategory && (!category.typeId || category.typeId === selectedType));
      if (!exists) {
        const fallback = categories.find((category) => !category.typeId || category.typeId === selectedType);
        setSelectedCategory(fallback?.categoryId ?? CUSTOM_CATEGORY_VALUE);
      }
    }
  }, [categories, selectedCategory, selectedType]);

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map((type) => ({
        value: type.typeId,
        label: type.name,
      })),
    [transactionTypes],
  );

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

  const buttons = useMemo(
    () => [
      {
        text: isSubmitting ? "Guardando..." : "Guardar cambios",
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
        const raw = typeof categoryValue === "string" && categoryValue.length ? categoryValue : selectedCategory;
        if (raw && raw !== CUSTOM_CATEGORY_VALUE) {
          categoryId = raw;
        }
      }

      if (isCustom && (!customCategoryName.trim() || !customCategoryDescription.trim())) {
        showNotification(
          "fa-solid fa-triangle-exclamation",
          "danger",
          "Datos de categoría incompletos",
          "Debes ingresar el nombre y la descripción de la nueva categoría.",
        );
        return;
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
        await updateTransaction(transaction.transactionId, {
          transactionId: transaction.transactionId,
          accountId,
          amount,
          date: isoDate,
          typeId,
          categoryId: isCustom ? undefined : categoryId,
          category: categoryPayload,
          description: finalDescription ?? null,
        });

        showNotification("fa-solid fa-circle-check", "success", "Transacción actualizada", "Guardamos los cambios del movimiento.");
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo actualizar la transacción.";
        showNotification("fa-solid fa-triangle-exclamation", "danger", "Error al actualizar", message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      accountId,
      customCategoryDescription,
      customCategoryName,
      selectedCategory,
      selectedType,
      showNotification,
      transaction.transactionId,
      updateTransaction,
      onSuccess,
    ],
  );

  return (
    <FormWrapper onSubmit={handleSubmit} buttons={buttons} className="flex flex-col gap-5">
      <Box className="space-y-4">
        <Input
          name="amount"
          type="number"
          step="0.01"
          label="Monto"
          defaultValue={transaction.amount}
          required
          icon="fas fa-money-bill-wave"
        />

        <Input
          name="date"
          type="date"
          label="Fecha"
          defaultValue={transaction.date.slice(0, 10)}
          required
          icon="fas fa-calendar-days"
        />

        <DropMenu
          name="typeId"
          label="Tipo de transacción"
          options={typeOptions}
          required
          disabled={transactionTypesLoading || !typeOptions.length}
          onValueChange={(value) => {
            const normalized = typeof value === "number" ? value : Number(value);
            const nextType = Number.isFinite(normalized) ? normalized : null;
            setSelectedType(nextType);
            if (nextType !== null) {
              const fallback = categories.find((category) => !category.typeId || category.typeId === nextType);
              setSelectedCategory(fallback?.categoryId ?? CUSTOM_CATEGORY_VALUE);
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
          disabled={categoriesLoading || !categoryOptions.length}
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
          defaultValue={transaction.description ?? ""}
          icon="fas fa-pen"
        />
      </Box>
    </FormWrapper>
  );
}

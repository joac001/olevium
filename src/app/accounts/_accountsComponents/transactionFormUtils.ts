'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DropMenuOption } from '@/components/shared/ui';
import type { TransactionCategory, TransactionType } from '@/types';
import { formatDateToISO } from '@/lib/utils/parser';

export const CUSTOM_CATEGORY_VALUE = '__custom__';

interface UseTransactionFormStateParams {
  transactionTypes: TransactionType[];
  categories: TransactionCategory[];
  transactionTypesLoading: boolean;
  categoriesLoading: boolean;
  initialTypeId?: number | null;
  initialCategoryId?: string | null;
  shouldAutofillCategory?: boolean;
}

interface UseTransactionFormStateResult {
  selectedType: number | null;
  selectedCategory: string;
  isCustomCategory: boolean;
  typeOptions: DropMenuOption[];
  categoryOptions: DropMenuOption[];
  typeDisabled: boolean;
  categoryDisabled: boolean;
  customCategoryName: string;
  customCategoryDescription: string;
  setCustomCategoryName: (value: string) => void;
  setCustomCategoryDescription: (value: string) => void;
  handleTypeChange: (value: number | string | null) => void;
  handleCategoryChange: (value: string) => void;
}

const normalizeTypeValue = (raw: number | string | null): number | null => {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === 'string' && raw.length) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isCategoryValidForType = (category: TransactionCategory, typeId: number | null) =>
  !typeId || !category.typeId || category.typeId === typeId;

export function useTransactionFormState({
  transactionTypes,
  categories,
  transactionTypesLoading,
  categoriesLoading,
  initialTypeId,
  initialCategoryId,
  shouldAutofillCategory = false,
}: UseTransactionFormStateParams): UseTransactionFormStateResult {
  const [selectedType, setSelectedType] = useState<number | null>(initialTypeId ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategoryId ?? CUSTOM_CATEGORY_VALUE
  );
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryDescription, setCustomCategoryDescription] = useState('');
  const hasAutofilledCategory = useRef(false);

  const fallbackTypeId = useMemo(() => {
    if (initialTypeId !== null && initialTypeId !== undefined) {
      return initialTypeId;
    }
    return transactionTypes.length ? transactionTypes[0].typeId : null;
  }, [initialTypeId, transactionTypes]);

  useEffect(() => {
    if (selectedType === null && fallbackTypeId !== null) {
      setSelectedType(fallbackTypeId);
    }
  }, [fallbackTypeId, selectedType]);

  const resolveFirstCategoryForType = useCallback(
    (typeId: number | null) => {
      const match = categories.find(category => isCategoryValidForType(category, typeId));
      return match?.categoryId ?? null;
    },
    [categories]
  );

  useEffect(() => {
    if (selectedCategory === CUSTOM_CATEGORY_VALUE) {
      return;
    }

    const exists = categories.some(
      category =>
        category.categoryId === selectedCategory && isCategoryValidForType(category, selectedType)
    );

    if (!exists) {
      const fallback = resolveFirstCategoryForType(selectedType);
      setSelectedCategory(fallback ?? CUSTOM_CATEGORY_VALUE);
    }
  }, [categories, resolveFirstCategoryForType, selectedCategory, selectedType]);

  useEffect(() => {
    if (!shouldAutofillCategory) {
      return;
    }

    if (hasAutofilledCategory.current) {
      return;
    }

    if (!categories.length || selectedType === null) {
      return;
    }

    const fallback = resolveFirstCategoryForType(selectedType);
    if (fallback) {
      setSelectedCategory(fallback);
    }

    hasAutofilledCategory.current = true;
  }, [categories, resolveFirstCategoryForType, selectedType, shouldAutofillCategory]);

  const handleTypeChange = useCallback(
    (value: number | string | null) => {
      const nextType = normalizeTypeValue(value);
      setSelectedType(nextType);
      const fallback = resolveFirstCategoryForType(nextType);
      setSelectedCategory(fallback ?? CUSTOM_CATEGORY_VALUE);
    },
    [resolveFirstCategoryForType]
  );

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const typeOptions: DropMenuOption[] = useMemo(
    () =>
      transactionTypes.map(type => ({
        value: type.typeId,
        label: type.name,
      })),
    [transactionTypes]
  );

  const categoryOptions: DropMenuOption[] = useMemo(() => {
    const base: DropMenuOption[] = [{ value: CUSTOM_CATEGORY_VALUE, label: 'Personalizada' }];
    const filtered = categories
      .filter(category => isCategoryValidForType(category, selectedType))
      .map(category => ({
        value: category.categoryId,
        label: category.description,
      }));

    return [...base, ...filtered];
  }, [categories, selectedType]);

  const typeDisabled = transactionTypesLoading && transactionTypes.length === 0;
  const categoryDisabled = categoriesLoading && categories.length === 0;

  return {
    selectedType,
    selectedCategory,
    isCustomCategory: selectedCategory === CUSTOM_CATEGORY_VALUE,
    typeOptions,
    categoryOptions,
    typeDisabled,
    categoryDisabled,
    customCategoryName,
    customCategoryDescription,
    setCustomCategoryName,
    setCustomCategoryDescription,
    handleTypeChange,
    handleCategoryChange,
  };
}

interface NormalizeTransactionFormArgs {
  formData: FormData;
  selectedType: number | null;
  selectedCategory: string;
  customCategoryName: string;
  customCategoryDescription: string;
  showNotification: (icon: string, tone: string, title: string, message: string) => void;
}

export interface NormalizedTransactionFormData {
  amount: number;
  date: string;
  typeId: number;
  categoryId?: string;
  category: {
    description: string;
    type_id: number;
    color: null;
    icon: null;
  } | null;
  description: string | null;
}

export const normalizeTransactionFormData = ({
  formData,
  selectedType,
  selectedCategory,
  customCategoryName,
  customCategoryDescription,
  showNotification,
}: NormalizeTransactionFormArgs): NormalizedTransactionFormData | null => {
  const amountValue = formData.get('amount');
  const dateValue = formData.get('date');
  const typeValue = formData.get('typeId');
  const categoryValue = formData.get('categoryId');
  const descriptionValue = formData.get('description');

  if (
    typeof amountValue !== 'string' ||
    typeof dateValue !== 'string' ||
    typeof typeValue !== 'string'
  ) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Formulario incompleto',
      'Monto, fecha y tipo son obligatorios.'
    );
    return null;
  }

  const amount = Number(amountValue);
  if (!Number.isFinite(amount)) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Datos inválidos',
      'El monto debe ser numérico.'
    );
    return null;
  }

  const typeId = selectedType ?? normalizeTypeValue(typeValue);

  if (!typeId) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Tipo inválido',
      'Selecciona un tipo de transacción válido.'
    );
    return null;
  }

  const isCustomCategory =
    categoryValue === CUSTOM_CATEGORY_VALUE || selectedCategory === CUSTOM_CATEGORY_VALUE;

  let categoryId: string | undefined;
  if (!isCustomCategory) {
    const raw =
      (typeof categoryValue === 'string' && categoryValue.length
        ? categoryValue
        : selectedCategory) ?? CUSTOM_CATEGORY_VALUE;
    if (raw !== CUSTOM_CATEGORY_VALUE) {
      categoryId = raw;
    }
  }

  if (isCustomCategory) {
    const trimmedName = customCategoryName.trim();
    const trimmedDescription = customCategoryDescription.trim();
    if (!trimmedName || !trimmedDescription) {
      showNotification(
        'fa-solid fa-triangle-exclamation',
        'danger',
        'Datos de categoría incompletos',
        'Debes ingresar el nombre y la descripción de la nueva categoría.'
      );
      return null;
    }
  }

  const rawDescription = typeof descriptionValue === 'string' ? descriptionValue.trim() : '';
  const normalizedDescription =
    rawDescription.length > 0
      ? rawDescription
      : isCustomCategory
        ? customCategoryDescription.trim()
        : '';

  const isoDate = formatDateToISO(dateValue);

  return {
    amount,
    date: isoDate,
    typeId,
    categoryId,
    category: isCustomCategory
      ? {
          description: customCategoryName.trim(),
          type_id: typeId,
          color: null,
          icon: null,
        }
      : null,
    description: normalizedDescription.length ? normalizedDescription : null,
  };
};

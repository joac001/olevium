import type { DropMenuOption } from '@/components/shared/ui';
import type { AccountType } from '@/types';

interface NormalizeAccountFormArgs {
  formData: FormData;
  showNotification: (icon: string, tone: string, title: string, message: string) => void;
}

export interface NormalizedAccountFormData {
  name: string;
  typeId: number;
  currency: string;
  balance: number;
}

export const buildAccountTypeOptions = (accountTypes: AccountType[]): DropMenuOption[] =>
  accountTypes.map(type => ({
    value: type.typeId,
    label: type.name,
  }));

export const normalizeAccountFormData = ({
  formData,
  showNotification,
}: NormalizeAccountFormArgs): NormalizedAccountFormData | null => {
  const nameValue = formData.get('name');
  const typeValue = formData.get('typeId');
  const currencyValue = formData.get('currency');
  const balanceValue = formData.get('balance');

  if (
    typeof nameValue !== 'string' ||
    typeof typeValue !== 'string' ||
    typeof currencyValue !== 'string' ||
    typeof balanceValue !== 'string'
  ) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Formulario incompleto',
      'Completa todos los campos para continuar.'
    );
    return null;
  }

  const trimmedName = nameValue.trim();
  const trimmedCurrency = currencyValue.trim();

  if (!trimmedName || !trimmedCurrency) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Datos inválidos',
      'El nombre y la moneda son obligatorios.'
    );
    return null;
  }

  const typeId = Number(typeValue);
  const balance = Number(balanceValue);

  if (!Number.isFinite(balance)) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Datos inválidos',
      'El balance debe ser un número válido.'
    );
    return null;
  }

  return {
    name: trimmedName,
    typeId,
    currency: trimmedCurrency,
    balance,
  };
};

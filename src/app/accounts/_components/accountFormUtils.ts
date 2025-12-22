import type { DropMenuOption } from '@/components/shared/ui';
import type { AccountType, Currency } from '@/types';

interface NormalizeAccountFormArgs {
  formData: FormData;
  showNotification: (icon: string, tone: string, title: string, message: string) => void;
}

export interface NormalizedAccountFormData {
  name: string;
  typeId: number;
  currencyId: number;
  balance: number;
}

export const buildAccountTypeOptions = (accountTypes: AccountType[]): DropMenuOption[] =>
  accountTypes.map(type => ({
    value: type.typeId,
    label: type.name,
  }));

export const buildCurrencyOptions = (currencies: Currency[]): DropMenuOption[] =>
  currencies.map(currency => ({
    value: currency.currencyId,
    label: `${currency.label} - ${currency.name}`,
  }));

export const normalizeAccountFormData = ({
  formData,
  showNotification,
}: NormalizeAccountFormArgs): NormalizedAccountFormData | null => {
  const nameValue = formData.get('name');
  const typeValue = formData.get('typeId');
  const currencyValue = formData.get('currencyId');
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

  if (!trimmedName) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Datos inválidos',
      'El nombre de la cuenta es obligatorio.'
    );
    return null;
  }

  const typeId = Number(typeValue);
  const currencyId = Number(currencyValue);
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

  if (!Number.isFinite(currencyId) || currencyId <= 0) {
    showNotification(
      'fa-solid fa-triangle-exclamation',
      'danger',
      'Datos inválidos',
      'Debes seleccionar una moneda válida.'
    );
    return null;
  }

  return {
    name: trimmedName,
    typeId,
    currencyId,
    balance,
  };
};

export function formatCurrency(value: number, currency: string = 'ARS'): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
  return formatter.format(value || 0);
}

export function formatSignedCurrency(value: number, currency: string = 'ARS'): string {
  const formatted = formatCurrency(Math.abs(value), currency);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateWithTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatAccountName(name: string, currency?: string | null): string {
  const normalized = name.trim();
  const symbol = (currency ?? 'ARS').toUpperCase();
  if (!normalized) {
    return symbol ? `(${symbol})` : '';
  }
  return symbol ? `${normalized} (${symbol})` : normalized;
}

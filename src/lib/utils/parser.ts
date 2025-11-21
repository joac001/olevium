import type { Iso8601DateTimeString } from '@/types';

type DateFormatOption = 'dd/mm/aaaa' | 'dd/mm/aa' | 'dd/mm' | 'dd Mes aaaa';

interface FormatParts {
  day: string;
  month: string;
  monthName: string;
  year: string;
  shortYear: string;
}

const MONTH_NAMES: Record<number, string> = {
  0: 'enero',
  1: 'febrero',
  2: 'marzo',
  3: 'abril',
  4: 'mayo',
  5: 'junio',
  6: 'julio',
  7: 'agosto',
  8: 'septiembre',
  9: 'octubre',
  10: 'noviembre',
  11: 'diciembre',
};

const formatParts = (date: Date): FormatParts => {
  const day = date.getDate().toString().padStart(2, '0');
  const monthIndex = date.getMonth();
  const month = (monthIndex + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const shortYear = year.slice(-2);

  return {
    day,
    month,
    monthName: MONTH_NAMES[monthIndex] ?? month,
    year,
    shortYear,
  };
};

export const formatDate = (
  value: Iso8601DateTimeString | string | Date | null | undefined,
  format: DateFormatOption
): string => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const parts = formatParts(date);

  switch (format) {
    case 'dd/mm/aaaa':
      return `${parts.day}/${parts.month}/${parts.year}`;
    case 'dd/mm/aa':
      return `${parts.day}/${parts.month}/${parts.shortYear}`;
    case 'dd/mm':
      return `${parts.day}/${parts.month}`;
    case 'dd Mes aaaa':
      return `${parts.day} ${parts.monthName} ${parts.year}`;
    default:
      return `${parts.day}/${parts.month}/${parts.year}`;
  }
};

export type { DateFormatOption };

export const formatAmount = (value: number, currency: string | null | undefined): string => {
  const normalized = currency && currency.length === 3 ? currency : undefined;
  return new Intl.NumberFormat('es-AR', {
    style: normalized ? 'currency' : 'decimal',
    currency: normalized ?? 'ARS',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDateToISO = (date: string): string => {
  // Handle dd/mm/yyyy format (from display input)
  const ddmmyyyyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const isoDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }
  }

  // Handle yyyy-mm-dd format (from native date input)
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (isoMatch) {
    const isoDate = new Date(`${date}T00:00:00Z`);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate.toISOString();
    }
  }

  // Fallback for other formats - try direct parsing
  const parsed = Date.parse(date);
  if (!Number.isNaN(parsed)) {
    const isoDate = new Date(parsed);
    isoDate.setUTCHours(0, 0, 0, 0);
    return isoDate.toISOString();
  }

  // If all parsing fails, return today's date ISO
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

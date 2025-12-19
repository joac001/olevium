export const EXPENSE_TYPE_ID = 1;
export const INCOME_TYPE_ID = 2;

/**
 * Normaliza el monto aplicando el signo según el tipo de transacción.
 * Devuelve valores negativos para egresos y positivos para ingresos.
 */
export function toSignedAmount(rawAmount: number, typeId?: number | null): number {
  const amount = Number(rawAmount ?? 0);
  if (!Number.isFinite(amount)) return 0;

  if (typeId === EXPENSE_TYPE_ID) return -Math.abs(amount);
  if (typeId === INCOME_TYPE_ID) return Math.abs(amount);

  return amount;
}

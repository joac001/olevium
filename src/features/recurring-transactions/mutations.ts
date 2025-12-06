import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, parseErrorMessage } from '@/lib/http';
import type { RecurringTransaction, CreateRecurringTransactionPayload, UpdateRecurringTransactionPayload } from '@/lib/types';

async function postRecurringTransaction(payload: CreateRecurringTransactionPayload): Promise<RecurringTransaction> {
  const response = await apiRequest('/api/recurring-transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la transacción recurrente (status ${response.status})`);
  }
  return (await response.json()) as RecurringTransaction;
}

async function putRecurringTransaction(
  recurringTransactionId: string,
  payload: UpdateRecurringTransactionPayload
): Promise<RecurringTransaction> {
  const response = await apiRequest(`/api/recurring-transactions/${recurringTransactionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la transacción recurrente (status ${response.status})`);
  }
  return (await response.json()) as RecurringTransaction;
}

async function deleteRecurringTransaction(recurringTransactionId: string): Promise<void> {
  const response = await apiRequest(`/api/recurring-transactions/${recurringTransactionId}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la transacción recurrente (status ${response.status})`);
  }
}

export const useCreateRecurringTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

export const useUpdateRecurringTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringTransactionPayload }) =>
      putRecurringTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

export const useDeleteRecurringTransactionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
  });
};

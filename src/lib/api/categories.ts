import { apiRequest, parseErrorMessage } from '@/lib/http';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/lib/types';
import type { ApiCollectionResult } from './types';

const normalizeCategory = (raw: any): Category => ({
  category_id: String(raw.category_id ?? raw.id ?? ''),
  user_id: raw.user_id ? String(raw.user_id) : null,
  type_id: Number(raw.type_id ?? 0),
  description: String(raw.description ?? ''),
  color: raw.color ?? null,
  icon: raw.icon ?? null,
  created_at: raw.created_at ? String(raw.created_at) : undefined,
  is_default: Boolean(raw.is_default ?? false),
  is_active: raw.is_active !== false,
});

export async function getCategories(): Promise<ApiCollectionResult<Category[]>> {
  const response = await apiRequest('/categories/');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeCategory) };
}

export async function postCategory(payload: CreateCategoryPayload): Promise<Category> {
  const response = await apiRequest('/categories/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function putCategory(categoryId: string, payload: UpdateCategoryPayload): Promise<Category> {
  const response = await apiRequest(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await apiRequest(`/categories/${categoryId}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo eliminar la categoría (status ${response.status})`);
  }
}

export async function getActiveCategories(): Promise<ApiCollectionResult<Category[]>> {
  const response = await apiRequest('/categories/active');
  if (!response.ok) {
    return { data: [] };
  }
  const raw = (await response.json()) as unknown[];
  return { data: raw.map(normalizeCategory) };
}

export async function deactivateCategory(categoryId: string): Promise<Category> {
  const response = await apiRequest(`/categories/${categoryId}/deactivate`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo desactivar la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function reactivateCategory(categoryId: string): Promise<Category> {
  const response = await apiRequest(`/categories/${categoryId}/reactivate`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo reactivar la categoría (status ${response.status})`);
  }
  const raw = await response.json();
  return normalizeCategory(raw);
}

export async function getCategoryTransactionCount(categoryId: string): Promise<number> {
  const response = await apiRequest(`/categories/${categoryId}/transactions/count`);
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo obtener el conteo (status ${response.status})`);
  }
  const data = await response.json();
  return data.count ?? 0;
}

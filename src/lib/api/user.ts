import { apiRequest } from '@/lib/http';
import type { ApiCollectionResult } from './types';

export interface User {
  user_id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<ApiCollectionResult<User>> {
  const response = await apiRequest('/users/me/');
  if (!response.ok) {
    throw new Error(`No se pudo obtener la información del usuario (status ${response.status})`);
  }
  const raw = await response.json();
  const normalized: User = {
    user_id: String(raw.user_id ?? raw.userId ?? ''),
    email: String(raw.email ?? ''),
    username: String(raw.username ?? raw.name ?? raw.first_name ?? ''),
    created_at: String(raw.created_at ?? raw.createdAt ?? ''),
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ''),
  };
  return { data: normalized };
}

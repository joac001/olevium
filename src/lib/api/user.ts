import { apiRequest, parseErrorMessage } from '@/lib/http';
import type { ApiCollectionResult } from './types';

export type FeedbackPayload = {
  type: 'bug' | 'feature' | 'other';
  message: string;
  page_path: string;
  metadata?: Record<string, unknown>;
};

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

export async function postFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await apiRequest('/feedback/', {
    method: 'POST',
    body: JSON.stringify({
      type: payload.type,
      message: payload.message,
      page_path: payload.page_path,
      metadata: payload.metadata,
    }),
  });

  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo enviar el feedback (status ${response.status})`);
  }
}

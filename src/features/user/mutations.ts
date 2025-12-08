import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, parseErrorMessage } from '@/lib/http';
import type { StoredProfile } from '@/lib/auth';

type UpdateProfilePayload = {
  name?: string;
  email?: string;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

async function putProfile(payload: UpdateProfilePayload): Promise<StoredProfile> {
  const response = await apiRequest('/users/', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo actualizar el perfil (status ${response.status})`);
  }
  return (await response.json()) as StoredProfile;
}

async function putPassword(payload: ChangePasswordPayload): Promise<void> {
  const response = await apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo cambiar la contraseña (status ${response.status})`);
  }
}

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: putPassword,
  });
};

// Chat Token mutations
type ChatTokenResponse = {
  chat_token: string;
};

async function createChatToken(): Promise<ChatTokenResponse> {
  const response = await apiRequest('/auth/chat_token/create', {
    method: 'POST',
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo crear el token de chat (status ${response.status})`);
  }
  return (await response.json()) as ChatTokenResponse;
}

async function regenerateChatToken(): Promise<ChatTokenResponse> {
  const response = await apiRequest('/auth/chat_token/revoke', {
    method: 'POST',
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo regenerar el token de chat (status ${response.status})`);
  }
  return (await response.json()) as ChatTokenResponse;
}

export const useCreateChatTokenMutation = () => {
  return useMutation({
    mutationFn: createChatToken,
  });
};

export const useRegenerateChatTokenMutation = () => {
  return useMutation({
    mutationFn: regenerateChatToken,
  });
};

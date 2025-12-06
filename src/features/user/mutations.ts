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
  const response = await apiRequest('/api/users/', {
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
  const response = await apiRequest('/api/users/password', {
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

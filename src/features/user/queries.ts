import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/http';
import type { ApiCollectionResult } from '@/lib/api';
import type { StoredProfile } from '@/lib/auth';

async function getProfile(): Promise<ApiCollectionResult<StoredProfile>> {
  try {
    const response = await apiRequest('/users/me');
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }
    const raw = (await response.json()) as unknown;
    const profile = raw as StoredProfile;
    return { data: profile, isMock: false };
  } catch (error) {
    console.warn('[olevium] usando perfil de ejemplo', error);
    return { data: { name: 'Usuario de Olevium', email: 'user@olevium.com' }, isMock: true };
  }
}

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
};

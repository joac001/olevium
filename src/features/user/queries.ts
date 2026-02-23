import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api';
import type { User } from '@/types';

export const userKeys = {
  me: ['user', 'me'] as const,
};

type ProfileQueryOptions = Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>;

export const useProfileQuery = (options?: ProfileQueryOptions) => {
  return useQuery<User, Error>({
    queryKey: userKeys.me,
    queryFn: () => getCurrentUser().then(r => r.data),
    ...options,
  });
};

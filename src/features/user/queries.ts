import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getCurrentUser, getUserTasks } from '@/lib/api';
import type { User } from '@/types';
import type { UserTasks } from '@/lib/api/userTasks';

export const userKeys = {
  me: ['user', 'me'] as const,
  tasks: ['user', 'tasks'] as const,
};

type ProfileQueryOptions = Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>;

export const useProfileQuery = (options?: ProfileQueryOptions) => {
  return useQuery<User, Error>({
    queryKey: userKeys.me,
    queryFn: () => getCurrentUser().then(r => r.data),
    ...options,
  });
};

type UserTasksQueryOptions = Omit<UseQueryOptions<UserTasks, Error>, 'queryKey' | 'queryFn'>;

export const useUserTasksQuery = (options?: UserTasksQueryOptions) => {
  return useQuery<UserTasks, Error>({
    queryKey: userKeys.tasks,
    queryFn: getUserTasks,
    ...options,
  });
};

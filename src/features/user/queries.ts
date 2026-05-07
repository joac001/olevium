import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { getCurrentUser, getUserTasks, getUserSettings, patchUserSettings } from '@/lib/api';
import type { User } from '@/types';
import type { UserTasks } from '@/lib/api/userTasks';
import type { UserSettings } from '@/lib/api';

export const userKeys = {
  me: ['user', 'me'] as const,
  tasks: ['user', 'tasks'] as const,
  settings: ['user', 'settings'] as const,
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

export const useUserSettingsQuery = () => {
  return useQuery<UserSettings, Error>({
    queryKey: userKeys.settings,
    queryFn: getUserSettings,
  });
};

export const usePatchUserSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<UserSettings, 'language' | 'tracked_categories'>>) =>
      patchUserSettings(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.settings });
    },
  });
};

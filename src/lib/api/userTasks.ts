import { apiRequest, parseErrorMessage } from '@/lib/http';

export type UserTasks = {
  user_id: string;
  is_email_verified: boolean;
  is_tutorial_done: boolean;
};

export async function getUserTasks(): Promise<UserTasks> {
  const response = await apiRequest('/users/tasks/');
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo obtener las tareas del usuario (status ${response.status})`);
  }
  return (await response.json()) as UserTasks;
}

export async function completeTutorial(): Promise<UserTasks> {
  const response = await apiRequest('/users/tasks/tutorial/', {
    method: 'PATCH',
  });
  if (!response.ok) {
    const detail = await parseErrorMessage(response);
    throw new Error(detail ?? `No se pudo completar el tutorial (status ${response.status})`);
  }
  return (await response.json()) as UserTasks;
}

import { getCurrentUser } from '@/lib/api';

export async function getProfilePageData() {
  const userResult = await getCurrentUser();

  return {
    user: userResult.data,
  };
}

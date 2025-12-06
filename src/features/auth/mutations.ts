import { useMutation } from '@tanstack/react-query';
import { login, signup } from '@/lib/auth';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (credentials: Parameters<typeof login>) => login(...credentials),
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: (payload: Parameters<typeof signup>[0]) => signup(payload),
  });
};

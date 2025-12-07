import { useMutation } from '@tanstack/react-query';
import { login, signup, forgotPassword, resetPassword } from '@/lib/auth';

export { forgotPassword, resetPassword };

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

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
};

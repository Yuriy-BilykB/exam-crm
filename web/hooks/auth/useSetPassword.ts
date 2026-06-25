import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useSetPassword() {
  return useMutation({
    mutationFn: (vars: { token: string; password: string }) =>
      api.post('/auth/set-password', vars),
  });
}

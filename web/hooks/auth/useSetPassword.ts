import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface SetPasswordPayload {
  token: string;
  password: string;
}

export function useSetPassword() {
  return useMutation({
    mutationFn: (payload: SetPasswordPayload) =>
      api.post('/auth/set-password', payload),
  });
}

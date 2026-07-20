import { api, refreshAccessToken } from './client';
import {
  authStore,
  type LoginRequest,
  type LoginResponse,
  type User,
} from '../auth/auth-store';

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    authStore.setSession(data);
    return data.user;
  },

  async restoreSession(): Promise<User | null> {
    if (!authStore.getUser()) {return null;}

    try {
      await refreshAccessToken();
      return authStore.getUser();
    } catch {
      authStore.clear();
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      authStore.clear();
    }
  },
};

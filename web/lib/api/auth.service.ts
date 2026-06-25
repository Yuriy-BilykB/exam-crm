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
    authStore.setToken(data.accessToken);
    authStore.setUser(data.user);
    return data.user;
  },

  /**
   * Silent renew on app start: use the httpOnly refresh cookie to restore the
   * access token into memory. Returns the user, or null if there's no session.
   */
  async restoreSession(): Promise<User | null> {
    // No stored user means there's no session to restore — skip the request
    // so logged-out visitors don't fire a pointless /auth/refresh (401).
    if (!authStore.getUser()) return null;

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

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'manager';
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

/**
 * Access token lives only in memory: an XSS payload can read it while the tab
 * is open, but it can't *persist* a stolen token (it's gone on reload) and it's
 * short-lived. The refresh token stays in an httpOnly cookie the JS never sees.
 *
 * The `user` object is not a secret — we keep it in localStorage so the UI can
 * render instantly on reload while the silent refresh restores the access token.
 */

const USER_KEY = 'user';

let accessToken: string | null = null;

export const authStore = {
  getToken(): string | null {
    return accessToken;
  },

  setToken(token: string | null) {
    accessToken = token;
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  setUser(user: User | null) {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  clear() {
    accessToken = null;
    if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
  },
};

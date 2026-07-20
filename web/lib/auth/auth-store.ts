import { userSchema, type User } from '../validation/user.schema';

export type { User };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

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
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      const result = userSchema.safeParse(JSON.parse(raw));
      if (result.success) {
        return result.data;
      }
    } catch {
    }
    localStorage.removeItem(USER_KEY);
    return null;
  },

  setUser(user: User | null) {
    if (typeof window === 'undefined') {
      return;
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  setSession({ accessToken: token, user }: LoginResponse) {
    this.setToken(token);
    this.setUser(user);
  },

  clear() {
    accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },
};

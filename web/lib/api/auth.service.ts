import { api } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'manager';
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  storeAuthData(access_token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
};

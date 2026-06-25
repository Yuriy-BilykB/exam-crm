import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStore, type User } from '../auth/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Required so the httpOnly refresh cookie is sent on /auth/refresh.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the in-memory access token to every request.
api.interceptors.request.use(
  (config) => {
    const token = authStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

type RefreshResponse = { accessToken: string; user: User };

// Single in-flight refresh shared by all callers (silent renew + 401 retries),
// so a burst of 401s triggers exactly one /auth/refresh.
let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<RefreshResponse>('/auth/refresh')
      .then((res) => {
        authStore.setToken(res.data.accessToken);
        authStore.setUser(res.data.user);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isAuthEndpoint(url?: string): boolean {
  return !!url && (url.includes('/auth/refresh') || url.includes('/auth/login'));
}

// On 401, transparently refresh once and replay the original request.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const shouldRetry =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url);

    if (shouldRetry) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        // Refresh failed → the session is really gone.
        authStore.clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

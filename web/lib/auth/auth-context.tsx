'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { authService } from '../api/auth.service';
import { type LoginRequest, type User } from './auth-store';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;
    authService.restoreSession().then((restored) => {
      if (!active) {return;}
      setUser(restored);
      setStatus(restored ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const user = await authService.login(credentials);
    setUser(user);
    setStatus('authenticated');
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {throw new Error('useAuth must be used within AuthProvider');}
  return context;
}

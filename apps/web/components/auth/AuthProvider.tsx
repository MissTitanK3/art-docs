"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types';

export type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (args: { email: string; password: string; role?: User['role']; allowed_regions?: string[] }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize from storage on mount
  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    const uRaw = localStorage.getItem('auth_user');
    setToken(t);
    setUser(uRaw ? (JSON.parse(uRaw) as User) : null);
  }, []);

  // Keep tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        setToken(e.newValue);
      }
      if (e.key === 'auth_user') {
        setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Login failed');
    }
    const t: string | undefined = data?.token;
    const u: User | undefined = data?.user;
    if (t) {
      localStorage.setItem('auth_token', t);
      setToken(t);
    }
    if (u) {
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    }
  };

  const register = async (args: { email: string; password: string; role?: User['role']; allowed_regions?: string[] }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Registration failed');
    }
    const t: string | undefined = data?.token;
    const u: User | undefined = data?.user;
    if (t) {
      localStorage.setItem('auth_token', t);
      setToken(t);
    }
    if (u) {
      localStorage.setItem('auth_user', JSON.stringify(u));
      setUser(u);
    }
  };

  const logout = () => {
    // Clear client-side state; server cookie remains until expiry or a logout route
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  }), [token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

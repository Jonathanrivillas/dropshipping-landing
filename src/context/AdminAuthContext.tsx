import { createContext, useState, useCallback, type ReactNode } from 'react';
import { API_URL } from '../lib/api';

interface AdminAuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const TOKEN_KEY = 'admin_token';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Credenciales inválidas.');
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return (
    <AdminAuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, getAuthHeaders }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

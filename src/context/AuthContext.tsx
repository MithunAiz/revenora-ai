import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Role } from '../types';

export interface AuthUser {
  role: Role;
  email: string;
  displayName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: Role, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

interface DemoAccount {
  role: Role;
  email: string;
  password: string;
  displayName: string;
}

const AUTH_STORAGE_KEY = 'revenora.auth.user';

const demoAccounts: DemoAccount[] = [
  { role: 'Patient Portal', email: 'patient@revenora.ai', password: 'Patient123!', displayName: 'Avery Chen' },
  { role: 'Billing Staff Portal', email: 'billing@revenora.ai', password: 'Billing123!', displayName: 'Maya Patel' },
  { role: 'Administrator Portal', email: 'admin@revenora.ai', password: 'Admin123!', displayName: 'Sofia Khan' },
];

const roleRoutes: Record<Role, string> = {
  'Patient Portal': '/patient',
  'Billing Staff Portal': '/billing',
  'Administrator Portal': '/admin',
};

const AuthContext = createContext<AuthContextValue | null>(null);

const loadUser = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => loadUser());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    login: (role, email, password) => {
      const account = demoAccounts.find((entry) => entry.role === role);
      if (!account) {
        return { success: false, error: 'This portal is not configured.' };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      if (normalizedEmail !== account.email.toLowerCase() || normalizedPassword !== account.password) {
        return { success: false, error: 'Invalid credentials for this portal.' };
      }

      setUser({ role: account.role, email: account.email, displayName: account.displayName });
      return { success: true };
    },
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function getPortalRoute(role: Role) {
  return roleRoutes[role];
}

export const authDemoAccounts = demoAccounts;
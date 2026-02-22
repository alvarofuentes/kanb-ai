'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Session } from 'next-auth';
import { useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  // Derive isLoading from status instead of using useState
  const isLoading = status === 'loading';

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      // Auto-login after registration
      const loginResult = await login(email, password);
      return loginResult;
    } catch {
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  const value: AuthContextType = {
    user: session?.user ? { id: (session.user as any).id, name: session.user.name, email: session.user.email } : null,
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

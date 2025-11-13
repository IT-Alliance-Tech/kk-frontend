/**
 * Auth Context Provider
 * Provides authentication state to all components
 */

"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import type { User, LoginPayload } from '@/lib/types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<{ token: string; user: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Wraps the app to provide authentication state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context in components
 * 
 * Usage:
 * ```tsx
 * const { user, login, logout } = useAuthContext();
 * ```
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth Context Provider
 * Provides authentication state to all components
 */

"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { User, LoginPayload } from "@/lib/types/user";

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

  // Listen for auth update events to refresh user state immediately
  useEffect(() => {
    const onAuthUpdate = async () => {
      try {
        if (typeof auth.refreshUser === 'function') {
          await auth.refreshUser();
        }
      } catch (err) {
        // Silently handle errors to avoid breaking the UI
        console.error('auth:update failed', err);
      }
    };

    // Listen for custom auth:update event
    window.addEventListener('auth:update', onAuthUpdate);
    
    // Listen for storage events (cross-tab synchronization)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        onAuthUpdate();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('auth:update', onAuthUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, [auth.refreshUser]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
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
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

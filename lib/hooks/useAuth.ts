/**
 * Custom hook for authentication
 * Provides auth state and methods to components
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getProfile,
} from "@/lib/api/auth.api";
import type { User, LoginPayload } from "@/lib/types/user";

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<{ token: string; user: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 *
 * Usage:
 * ```tsx
 * const { user, token, login, logout } = useAuth();
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initAuth = () => {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      // Try to get token from localStorage
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);

        // Try to get cached user data
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setLoading(false);
          } catch (error) {
            console.error("Failed to parse cached user:", error);
            // Fetch fresh user data if cache is invalid
            fetchUserProfile();
          }
        } else {
          // No cached user, fetch from API
          fetchUserProfile();
        }
      } else {
        // No token, user is not logged in
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Fetch user profile from API
   */
  const fetchUserProfile = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        setUser(profile);
      } else {
        // Token might be invalid, clear it
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Clear invalid token
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user with credentials
   */
  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      // Call API login
      const { token: newToken, user: newUser } = await apiLogin(payload);

      // Update state
      setToken(newToken);
      setUser(newUser);

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      return { token: newToken, user: newUser };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user and clear state
   * Calls backend to invalidate session, clears all client storage, and forces page reload
   */
  const logout = useCallback(async () => {
    try {
      // Attempt to call backend logout endpoint (best effort)
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || localStorage.getItem('accessToken'))
        : null;
      
      if (token) {
        try {
          // Try to notify backend (ignore errors - logout should always succeed)
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }).catch(() => {});
        } catch (e) {
          // Silently handle - backend call is optional
        }
      }
    } catch (e) {
      // Continue with client-side logout even if backend fails
    }

    // Clear all client-side session data
    apiLogout();

    // Clear state immediately
    setToken(null);
    setUser(null);
    
    // Force a hard navigation to ensure clean state
    if (typeof window !== 'undefined') {
      // Use window.location to force a full page reload and clear any stale state
      window.location.href = '/login';
    }
  }, []);

  /**
   * Refresh user profile from API
   */
  const refreshUser = useCallback(async () => {
    setLoading(true);
    await fetchUserProfile();
  }, []);

  return {
    user,
    token,
    loading,
    login,
    logout,
    refreshUser,
  };
}

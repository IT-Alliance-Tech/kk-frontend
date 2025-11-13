/**
 * Custom hook for authentication
 * Provides auth state and methods to components
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getProfile } from '@/lib/api/auth.api';
import type { User, LoginPayload } from '@/lib/types/user';

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
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Try to get token from localStorage
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setToken(storedToken);

        // Try to get cached user data
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setLoading(false);
          } catch (error) {
            console.error('Failed to parse cached user:', error);
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear invalid token
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return { token: newToken, user: newUser };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user and clear state
   */
  const logout = useCallback(() => {
    // Call API logout (clears localStorage)
    apiLogout();

    // Clear state
    setToken(null);
    setUser(null);
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

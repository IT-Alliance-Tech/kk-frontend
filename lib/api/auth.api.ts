/**
 * Authentication API client
 * Handles login, logout, and profile fetching
 */

import { apiFetch } from '@/lib/api';
import type { User, LoginPayload, LoginResponse } from '@/lib/types/user';
import { normalizeAuthResponse, normalizeUserResponse } from '@/lib/adapters/auth.adapter';

/**
 * Login user with email/phone and password/OTP
 * Tries multiple endpoint variations to handle different backend setups
 * 
 * @param payload - Login credentials (email or phone + password or OTP)
 * @returns Object with token and user data
 * @throws Error if login fails
 */
export async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  // Validate payload has required fields
  const hasEmailOrPhone = payload.email || payload.phone;
  const hasPasswordOrOTP = payload.password || payload.otp;
  
  if (!hasEmailOrPhone || !hasPasswordOrOTP) {
    throw new Error('Email/phone and password/OTP are required');
  }

  // Try multiple endpoints - some backends use /auth/login, others /login
  const endpoints = ['/auth/login', '/login'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiFetch<LoginResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // ADAPTER: Normalize response using adapter
      const normalized = normalizeAuthResponse(response);

      // Store token in localStorage for subsequent requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', normalized.token);
      }

      return normalized;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Login request failed');
      // Continue to next endpoint
      continue;
    }
  }

  // If all endpoints failed, throw the last error
  throw lastError || new Error('Login failed - all endpoints unreachable');
}

/**
 * Logout user by clearing token from localStorage
 * No API call needed - token-based auth is stateless
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear cached user data too
  }
}

/**
 * Get current user profile from the API
 * Tries multiple endpoint variations
 * 
 * @returns User object or null if not authenticated
 */
export async function getProfile(): Promise<User | null> {
  // Try multiple endpoints - some backends use /auth/me, others /me or /auth/profile
  const endpoints = ['/auth/me', '/me', '/auth/profile', '/profile'];

  for (const endpoint of endpoints) {
    try {
      const response = await apiFetch<any>(endpoint, {
        method: 'GET',
      });

      // ADAPTER: Normalize response using adapter
      const user = normalizeUserResponse(response);

      if (user) {
        // Cache user data in localStorage for faster subsequent loads
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
      }
    } catch (error) {
      // Continue to next endpoint
      continue;
    }
  }

  // No endpoint succeeded - user is not authenticated or endpoints don't exist
  return null;
}

/**
 * Register a new user (optional - for future use)
 * 
 * @param payload - Registration data
 * @returns Object with token and user data
 */
export async function register(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const endpoints = ['/auth/register', '/register', '/auth/signup', '/signup'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiFetch<LoginResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // ADAPTER: Normalize response using adapter
      const normalized = normalizeAuthResponse(response);

      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', normalized.token);
      }

      return normalized;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Registration failed');
      continue;
    }
  }

  throw lastError || new Error('Registration failed - all endpoints unreachable');
}

/**
 * Request an OTP to be sent to the user's email
 * @param email - User's email address
 * @param purpose - Purpose of OTP: 'login', 'signup', or 'forgot'
 * @returns Response with message and OTP record ID
 */
export async function requestOtp(
  email: string,
  purpose: 'login' | 'signup' | 'forgot' = 'login'
): Promise<{ message?: string; id?: string }> {
  try {
    // Direct backend URL for integration testing
    // TODO: In production, revert to using apiFetch (proxy-based) for security
    const response = await fetch('http://localhost:5001/api/auth/request-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, purpose }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request OTP';
    throw new Error(message);
  }
}

/**
 * Verify the OTP code and authenticate the user
 * @param payload - Verification payload with email, code, purpose, and optional name
 * @returns Authentication response with token and user data
 */
export async function verifyOtp(
  payload: {
    email: string;
    code: string;
    purpose?: 'login' | 'signup' | 'forgot';
    name?: string;
    redirectTo?: string;
  }
): Promise<{ token: string; user: any }> {
  try {
    const { email, code, purpose = 'login', name } = payload;
    
    const response = await apiFetch<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose, name }),
    });

    // Normalize response: handle both { access } and { token } shapes
    const token = response.access || response.token || response.data?.access;
    const user = response.user || response.data?.user || response.data;

    if (!token) {
      throw new Error('No authentication token received from server');
    }

    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }

    return { token, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    throw new Error(message);
  }
}

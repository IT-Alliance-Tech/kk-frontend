/**
 * Authentication API client
 * Handles login, logout, and profile fetching
 */

import { apiGet, apiPost } from "@/lib/api";
import type { User, LoginPayload, LoginResponse } from "@/lib/types/user";
import { normalizeAuthResponse, normalizeUserResponse } from "@/lib/adapters/auth.adapter";

/**
 * Login user with email/phone and password/OTP
 * @param payload - Login credentials (email or phone + password or OTP)
 * @returns Object with token and user data
 */
export async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  const hasEmailOrPhone = payload.email || payload.phone;
  const hasPasswordOrOTP = payload.password || payload.otp;

  if (!hasEmailOrPhone || !hasPasswordOrOTP) {
    throw new Error("Email/phone and password/OTP are required");
  }

  const endpoints = ["/auth/login", "/login"];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiPost<LoginResponse>(endpoint, payload);
      const normalized = normalizeAuthResponse(response);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalized.token);
      }

      return normalized;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Login request failed");
      continue;
    }
  }

  throw lastError || new Error("Login failed - all endpoints unreachable");
}

/**
 * Logout user by clearing token from localStorage
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

/**
 * Get current user profile from the API
 * @returns User object or null if not authenticated
 */
export async function getProfile(): Promise<User | null> {
  const endpoints = ["/auth/me", "/me", "/auth/profile", "/profile"];

  for (const endpoint of endpoints) {
    try {
      const response = await apiGet<any>(endpoint);
      const user = normalizeUserResponse(response);

      if (user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user));
        }
        return user;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Register a new user
 * @param payload - Registration data
 * @returns Object with token and user data
 */
export async function register(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const endpoints = ["/auth/register", "/register", "/auth/signup", "/signup"];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await apiPost<LoginResponse>(endpoint, payload);
      const normalized = normalizeAuthResponse(response);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", normalized.token);
      }

      return normalized;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Registration failed");
      continue;
    }
  }

  throw lastError || new Error("Registration failed - all endpoints unreachable");
}

/**
 * Request an OTP to be sent to the user's email
 */
export async function requestOtp(
  email: string,
  purpose: "login" | "signup" | "forgot" = "login"
): Promise<{ message?: string; id?: string }> {
  try {
    const response = await apiPost<{ message?: string; id?: string }>(
      "/auth/request-otp",
      { email, purpose }
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request OTP";
    throw new Error(message);
  }
}

/**
 * Verify the OTP code and authenticate the user
 */
export async function verifyOtp(payload: {
  email: string;
  code: string;
  purpose?: "login" | "signup" | "forgot";
  name?: string;
  redirectTo?: string;
}): Promise<{ token: string; user: any }> {
  try {
    const { email, code, purpose = "login", name } = payload;

    const response = await apiPost<any>("/auth/verify-otp", {
      email,
      code,
      purpose,
      name,
    });

    const token = response.access || response.token || response.data?.access;
    const user = response.user || response.data?.user || response.data;

    if (!token) {
      throw new Error("No authentication token received from server");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return { token, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    throw new Error(message);
  }
}

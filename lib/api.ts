/**
 * Shared API fetch utility for making HTTP requests to the backend API
 * Works in both server and client components
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiFetchOptions extends RequestInit {
  token?: string;
}

/**
 * Generic fetch wrapper with automatic JSON parsing and error handling
 * @param path - API endpoint path (e.g., '/brands' or '/brands/nike')
 * @param opts - Fetch options including optional token override
 * @returns Parsed JSON response
 * @throws Error if response is not ok
 */
export async function apiFetch<T = any>(
  path: string,
  opts: ApiFetchOptions = {}
): Promise<T> {
  const { token, headers = {}, ...restOpts } = opts;

  // Get token from localStorage if in browser and not provided
  let authToken = token;
  if (typeof window !== 'undefined' && !authToken) {
    authToken = localStorage.getItem('token') || undefined;
  }

  // Construct headers
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add authorization header if token exists
  if (authToken) {
    reqHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Make the request
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...restOpts,
    headers: reqHeaders,
  });

  // Parse JSON response
  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response from ${url}`);
  }

  // Handle error responses
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

/**
 * Helper to construct query parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiGet(path: string) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

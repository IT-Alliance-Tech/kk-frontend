/**
 * Authentication utility functions for token management
 * Supports multiple token key names for flexibility with various backend responses
 */

/**
 * Get access token from localStorage or cookies
 * Checks multiple common token key names in order:
 * - 'accessToken'
 * - 'access'
 * - 'token'
 * Also falls back to cookie parsing if not found in localStorage
 * 
 * @returns The access token string or null if not found
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try localStorage with common key names
  const storageKeys = ['accessToken', 'access', 'token'];
  
  for (const key of storageKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  // Fallback: try parsing cookies
  try {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // Check common cookie names
    return cookies.accessToken || cookies.access || cookies.token || null;
  } catch (error) {
    console.warn('Failed to parse cookies for token:', error);
    return null;
  }
}

/**
 * Save access token to localStorage
 * Stores under multiple key names for compatibility:
 * - 'accessToken' (primary)
 * - 'access' (alternate)
 * 
 * @param token - The access token to save
 */
export function saveAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Store under both common key names for maximum compatibility
    localStorage.setItem('accessToken', token);
    localStorage.setItem('access', token);
    // Also keep 'token' for backward compatibility with existing code
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Failed to save access token:', error);
  }
}

/**
 * Clear access token from localStorage
 * Removes all common token key names
 */
export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access');
    localStorage.removeItem('token');
    // Also clear user data
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Failed to clear access token:', error);
  }
}

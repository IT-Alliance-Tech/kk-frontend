/**
 * Authentication Response Adapter
 * Normalizes backend auth responses to frontend-expected shapes
 * Generated: 2025-11-10
 */

export interface NormalizedAuthResponse {
  token: string;
  user: any;
}

/**
 * Normalize backend auth response to frontend expected shape
 * Backend returns: { access, refresh, user }
 * Frontend expects: { token, user }
 */
export function normalizeAuthResponse(response: any): NormalizedAuthResponse {
  // Handle various response shapes from backend
  
  // Shape 1: { access, refresh, user }
  if (response && 'access' in response) {
    return {
      token: response.access,
      user: response.user,
    };
  }
  
  // Shape 2: { token, user } (already normalized)
  if (response && 'token' in response && 'user' in response) {
    return {
      token: response.token,
      user: response.user,
    };
  }
  
  // Shape 3: { success: true, data: { token, user } }
  if (response && 'success' in response && 'data' in response) {
    const data = response.data;
    return {
      token: data.access || data.token,
      user: data.user,
    };
  }
  
  throw new Error('Invalid auth response format');
}

/**
 * Normalize user profile response
 * Handles various backend response wrapping patterns
 */
export function normalizeUserResponse(response: any): any {
  // Direct user object
  if (response && '_id' in response) {
    return response;
  }
  
  // Wrapped in data
  if (response && 'data' in response) {
    return response.data;
  }
  
  // Wrapped in user
  if (response && 'user' in response) {
    return response.user;
  }
  
  return response;
}

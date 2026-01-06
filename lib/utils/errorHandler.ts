/**
 * Error handling utilities for safe error message extraction
 * Prevents [object Object] from being displayed to users
 */

/**
 * Safely extract error message from any error object
 * Priority: error.message → error.error?.message → error.error → fallback
 * 
 * @param error - Any error object (Error, ApiError, Response, or plain object)
 * @param fallback - Default message if extraction fails
 * @returns Clean, user-friendly error message
 */
export function getErrorMessage(error: any, fallback: string = "Something went wrong. Please try again."): string {
  // Null or undefined
  if (!error) {
    return fallback;
  }

  // String error (already a message)
  if (typeof error === 'string') {
    return error.trim() || fallback;
  }

  // Error object with message
  if (error.message && typeof error.message === 'string') {
    return error.message.trim() || fallback;
  }

  // Backend envelope error: { error: { message: "..." } }
  if (error.error && typeof error.error === 'object' && error.error.message) {
    return String(error.error.message).trim() || fallback;
  }

  // Backend envelope error: { error: "..." }
  if (error.error && typeof error.error === 'string') {
    return error.error.trim() || fallback;
  }

  // Response or fetch error
  if (error.statusText && typeof error.statusText === 'string') {
    return error.statusText.trim() || fallback;
  }

  // Last resort: return fallback
  return fallback;
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;

  // Check status code
  if (error.status === 401 || error.statusCode === 401) {
    return true;
  }

  // Check message content
  const message = getErrorMessage(error, '').toLowerCase();
  return (
    message.includes('not authenticated') ||
    message.includes('invalid user') ||
    message.includes('log in') ||
    message.includes('token') ||
    message.includes('unauthorized')
  );
}

/**
 * Check if error is a permission error (403)
 */
export function isPermissionError(error: any): boolean {
  if (!error) return false;

  // Check status code
  if (error.status === 403 || error.statusCode === 403) {
    return true;
  }

  // Check message content
  const message = getErrorMessage(error, '').toLowerCase();
  return (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('access denied')
  );
}

/**
 * Format error for display in UI with proper styling context
 */
export function formatErrorForDisplay(error: any): { message: string; type: 'auth' | 'permission' | 'general' } {
  if (isAuthError(error)) {
    return {
      message: getErrorMessage(error, 'Your session has expired. Please log in again.'),
      type: 'auth'
    };
  }

  if (isPermissionError(error)) {
    return {
      message: getErrorMessage(error, 'You do not have permission to perform this action.'),
      type: 'permission'
    };
  }

  return {
    message: getErrorMessage(error),
    type: 'general'
  };
}

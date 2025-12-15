// normalize base (remove trailing slashes)
export const API_BASE_RAW = process.env.NEXT_PUBLIC_API_URL || "https://kk-backend-5c11.onrender.com";
export const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

/**
 * buildUrl(path)
 * - If `path` is already an absolute URL -> return it unchanged.
 * - Else join API_BASE and path safely:
 *    * If API_BASE ends with '/api' and path begins with 'api/' or '/api/', strip the leading 'api' from path.
 *    * If API_BASE does not end with '/api' and path begins with '/api/', keep path intact.
 * - Always ensure a single slash between parts.
 */
export function buildUrl(path = ""): string {
  if (!path) return API_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  // remove leading slashes
  let normalizedPath = path.replace(/^\/+/, "");
  if (API_BASE.toLowerCase().endsWith("/api")) {
    // remove leading "api/" if present so we don't end up with /api/api
    normalizedPath = normalizedPath.replace(/^api\/?/i, "");
    return `${API_BASE}/${normalizedPath}`;
  } else {
    return `${API_BASE}/${normalizedPath}`;
  }
}

// -------------------- UNIFIED API WRAPPER - UNWRAPS BACKEND ENVELOPE --------------------

/**
 * ApiError class for structured error handling
 * Thrown when API requests fail with detailed error information
 */
export class ApiError extends Error {
  status: number;
  details?: any;
  
  constructor(message: string, status = 500, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Unwraps backend envelope { statusCode, success, error, data }
 * Throws ApiError when success === false (preserve details).
 * Returns the unwrapped `data` for success === true.
 * If `body` is not an envelope, returns the body directly.
 */
export function unwrapEnvelope(body: any): any {
  if (!body || typeof body !== "object") return body;
  if (body.statusCode !== undefined || body.success !== undefined) {
    // treat as envelope
    if (!body.success) {
      const msg = body.error?.message || body.message || `Request failed (${body.statusCode})`;
      throw new ApiError(msg, body.statusCode || 500, body.error?.details ?? null);
    }
    return body.data;
  }
  return body;
}

/**
 * For list endpoints, ensure returned value is always an array.
 * - If payload is array -> return it
 * - If payload is object containing known keys (items, list, products, categories, rows) -> return first array found
 * - If payload.data is array -> return it
 * - Else return []
 */
export function normalizeListResponse(payload: any, knownKeys: string[] = []): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  
  // If payload is envelope-like, unwrap automatically
  const maybe = typeof payload === "object" && (payload.statusCode !== undefined || payload.success !== undefined)
    ? unwrapEnvelope(payload)
    : payload;
    
  if (Array.isArray(maybe)) return maybe;

  const keys = [...knownKeys, "items", "list", "rows", "products", "categories", "brands"];
  const obj = (typeof maybe === "object" && maybe) ? maybe : payload;
  
  for (const k of keys) {
    if (Array.isArray(obj?.[k])) return obj[k];
  }
  
  // pick any single array in object if exactly one exists
  const arrProps = Object.keys(obj || {}).filter(p => Array.isArray(obj[p]));
  if (arrProps.length === 1) return obj[arrProps[0]];
  
  return [];
}

/**
 * Alias for normalizeListResponse with explicit name for user request compatibility
 * ensureArray(payload, knownKeys) - ensures any payload becomes an array
 */
export function ensureArray(payload: any, knownKeys: string[] = ["items", "data", "products", "categories", "brands"]): any[] {
  return normalizeListResponse(payload, knownKeys);
}

/**
 * apiFetch: universal fetch wrapper that understands backend envelope format:
 * { statusCode, success, error, data }
 * 
 * Returns `data` for successful responses, throws ApiError for failures.
 * Preserves backward compatibility with non-envelope responses.
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    // Parse response body
    const text = await res.text().catch(() => null);
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch (e) {
      body = text;
    }

    // Handle backend envelope format: { statusCode, success, error, data }
    if (body && typeof body === "object" && ("statusCode" in body || "success" in body)) {
      const statusCode = body.statusCode ?? res.status;
      const okFlag = body.success === true;

      if (!okFlag) {
        // Extract error message from envelope
        const errMsg =
          (body.error && (body.error.message || JSON.stringify(body.error))) ||
          body.message ||
          body.error ||
          `Request failed with status ${statusCode}`;
        const details = body.error?.details ?? body.details ?? null;
        throw new ApiError(errMsg, statusCode, details);
      }

      // Success: return inner data property (preserve nulls)
      return body.data as T;
    }

    // Handle non-envelope responses (backward compatibility)
    if (res.ok) {
      return body as T;
    }

    // Fallback: non-ok response without envelope
    const fallbackMsg =
      (body && (body.message || JSON.stringify(body))) ||
      res.statusText ||
      `HTTP ${res.status}`;
    throw new ApiError(fallbackMsg, res.status, body);
  } catch (err) {
    // Re-throw ApiError as-is
    if (err instanceof ApiError) {
      throw err;
    }
    
    // Wrap network errors
    console.error("❌ Network error in apiFetch:", err);
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
      err
    );
  }
}

/**
 * Convenience helper: GET request with envelope unwrapping
 */
export async function apiGet<T = any>(path: string, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { method: "GET", ...opts });
}

/**
 * Convenience helper: POST request with envelope unwrapping
 */
export async function apiPost<T = any>(path: string, body?: any, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: body != null ? JSON.stringify(body) : undefined,
    ...opts,
  });
}

/**
 * Convenience helper: PUT request with envelope unwrapping
 */
export async function apiPut<T = any>(path: string, body?: any, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: body != null ? JSON.stringify(body) : undefined,
    ...opts,
  });
}

/**
 * Convenience helper: DELETE request with envelope unwrapping
 */
export async function apiDelete<T = any>(path: string, opts?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE", ...opts });
}

export function buildQueryString(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "")
      sp.append(k, String(v));
  });
  return sp.toString() ? `?${sp.toString()}` : "";
}

// -------------------- AUTHENTICATED API HELPERS --------------------
/**
 * Get auth token from localStorage (admin or user token)
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
}

/**
 * Authenticated GET request with envelope unwrapping
 */
export async function apiGetAuth<T = any>(path: string): Promise<T> {
  const url = buildUrl(path);
  const token = getAuthToken();
  
  const res = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });

  // Parse response body
  const text = await res.text().catch(() => null);
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }

  // Handle backend envelope format
  if (body && typeof body === "object" && ("statusCode" in body || "success" in body)) {
    const statusCode = body.statusCode ?? res.status;
    const okFlag = body.success === true;

    if (!okFlag) {
      const errMsg =
        (body.error && (body.error.message || JSON.stringify(body.error))) ||
        body.message ||
        body.error ||
        `Request failed with status ${statusCode}`;
      const details = body.error?.details ?? body.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    return body.data as T;
  }

  // Fallback for non-envelope responses
  if (!res.ok) {
    const errMsg = (body && (body.message || JSON.stringify(body))) || res.statusText || `GET ${path} failed (${res.status})`;
    throw new ApiError(errMsg, res.status, body);
  }

  return body as T;
}

/**
 * Authenticated POST request with envelope unwrapping
 */
export async function apiPostAuth<T = any>(path: string, body: any): Promise<T> {
  const url = buildUrl(path);
  const token = getAuthToken();
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  // Parse response body
  const text = await res.text().catch(() => null);
  let responseBody: any = null;
  try {
    responseBody = text ? JSON.parse(text) : null;
  } catch (e) {
    responseBody = text;
  }

  // Handle backend envelope format
  if (responseBody && typeof responseBody === "object" && ("statusCode" in responseBody || "success" in responseBody)) {
    const statusCode = responseBody.statusCode ?? res.status;
    const okFlag = responseBody.success === true;

    if (!okFlag) {
      const errMsg =
        (responseBody.error && (responseBody.error.message || JSON.stringify(responseBody.error))) ||
        responseBody.message ||
        responseBody.error ||
        `Request failed with status ${statusCode}`;
      const details = responseBody.error?.details ?? responseBody.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    return responseBody.data as T;
  }

  // Fallback for non-envelope responses
  if (!res.ok) {
    const errMsg = (responseBody && (responseBody.message || JSON.stringify(responseBody))) || res.statusText || `POST ${path} failed (${res.status})`;
    throw new ApiError(errMsg, res.status, responseBody);
  }

  return responseBody as T;
}

/**
 * Authenticated PUT request with envelope unwrapping
 */
export async function apiPutAuth<T = any>(path: string, body: any): Promise<T> {
  const url = buildUrl(path);
  const token = getAuthToken();
  
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  // Parse response body
  const text = await res.text().catch(() => null);
  let responseBody: any = null;
  try {
    responseBody = text ? JSON.parse(text) : null;
  } catch (e) {
    responseBody = text;
  }

  // Handle backend envelope format
  if (responseBody && typeof responseBody === "object" && ("statusCode" in responseBody || "success" in responseBody)) {
    const statusCode = responseBody.statusCode ?? res.status;
    const okFlag = responseBody.success === true;

    if (!okFlag) {
      const errMsg =
        (responseBody.error && (responseBody.error.message || JSON.stringify(responseBody.error))) ||
        responseBody.message ||
        responseBody.error ||
        `Request failed with status ${statusCode}`;
      const details = responseBody.error?.details ?? responseBody.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    return responseBody.data as T;
  }

  // Fallback for non-envelope responses
  if (!res.ok) {
    const errMsg = (responseBody && (responseBody.message || JSON.stringify(responseBody))) || res.statusText || `PUT ${path} failed (${res.status})`;
    throw new ApiError(errMsg, res.status, responseBody);
  }

  return responseBody as T;
}

/**
 * Authenticated DELETE request with envelope unwrapping
 */
export async function apiDeleteAuth<T = any>(path: string): Promise<T> {
  const url = buildUrl(path);
  const token = getAuthToken();
  
  const res = await fetch(url, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });

  // Parse response body
  const text = await res.text().catch(() => null);
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }

  // Handle backend envelope format
  if (body && typeof body === "object" && ("statusCode" in body || "success" in body)) {
    const statusCode = body.statusCode ?? res.status;
    const okFlag = body.success === true;

    if (!okFlag) {
      const errMsg =
        (body.error && (body.error.message || JSON.stringify(body.error))) ||
        body.message ||
        body.error ||
        `Request failed with status ${statusCode}`;
      const details = body.error?.details ?? body.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    return body.data as T;
  }

  // Fallback for non-envelope responses
  if (!res.ok) {
    const errMsg = (body && (body.message || JSON.stringify(body))) || res.statusText || `DELETE ${path} failed (${res.status})`;
    throw new ApiError(errMsg, res.status, body);
  }

  return body as T;
}
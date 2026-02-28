// -------------------- AUTH --------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "";

// Enhanced auth wrappers with better error handling and credential management
// Unwraps backend envelope format: { statusCode, success, error, data }
async function apiFetchAuth(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' } as Record<string, string>;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',      // CRITICAL: sends HttpOnly adminToken cookie
    headers,
    ...opts,
  });

  const status = res.status;
  const json = await res.json().catch(() => null);
  
  // Accept any 2xx status as success (200, 201, etc.)
  const isSuccess = status >= 200 && status < 300;
  
  if (!isSuccess) {
    const err = new Error(json?.message || json?.error || `Request failed: ${status}`);
    (err as any).status = status;
    throw err;
  }
  
  // Unwrap backend envelope: { statusCode, success, error, data }
  if (json && typeof json === 'object' && ('statusCode' in json || 'success' in json)) {
    // Backend envelope detected
    if (json.success === false) {
      const errMsg = json.error?.message || json.message || 'Request failed';
      const err = new Error(errMsg);
      (err as any).status = json.statusCode || status;
      throw err;
    }
    // Return the data directly (may be array or object)
    if (json.data !== undefined) {
      return json.data;
    }
    return json;
  }
  
  return json;
}

export function apiGetAuth(path: string) { return apiFetchAuth(path, { method: 'GET' }); }
export function apiPostAuth(path: string, data?: any) { return apiFetchAuth(path, { method: 'POST', body: JSON.stringify(data) }); }
export function apiPutAuth(path: string, data?: any) { return apiFetchAuth(path, { method: 'PUT', body: JSON.stringify(data) }); }
export function apiPatchAuth(path: string, data?: any) { return apiFetchAuth(path, { method: 'PATCH', body: JSON.stringify(data) }); }
export function apiDeleteAuth(path: string) { return apiFetchAuth(path, { method: 'DELETE' }); }

/**
 * Ensure any payload becomes an array
 * Checks known keys: items, data, products, categories, brands
 */
function ensureArray(payload: any, knownKeys: string[] = ['items', 'data', 'products', 'categories', 'brands']): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  
  // Check known keys for array data
  for (const key of knownKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }
  
  // If payload has data property that's an array
  if (payload.data && Array.isArray(payload.data)) {
    return payload.data;
  }
  
  return [];
}

async function callLogin(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ Enable cookie storage
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Login failed (${res.status})`);
  }
  return res.json();
}

export async function adminLogin(email: string, password: string) {
  const payload = { email, password };
  const backendRoot = API_BASE.replace(/\/api\/?$/, "");
  const attempts = [
    `${backendRoot}/api/admin/login`,
    `${API_BASE}/admin/login`,
  ];
  for (const url of attempts) {
    try {
      const result = await callLogin(url, payload);
      return result;
    } catch (err) {
      // try next
    }
  }
  throw new Error("Admin login failed: unable to reach backend login endpoint");
}

export async function adminLogout() {
  try {
    // Call backend to clear cookies
    await apiPostAuth("/admin/logout", {});
  } catch (e) {
    // Continue with client-side cleanup even if backend fails
    console.warn('Backend logout failed:', e);
  }
  
  // Clear all admin tokens and session data from localStorage
  if (typeof window !== 'undefined') {
    const keysToRemove = [
      'adminToken', 'admin_token', 'adminUser',
      'token', 'accessToken', 'access', 'user'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });

    // Clear cookies
    const cookieNames = ['adminToken', 'accessToken', 'token'];
    cookieNames.forEach(name => {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      document.cookie = `${name}=; path=/admin; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    });

    // Force navigation to login
    window.location.href = '/admin/login';
  }
}

// -------------------- PRODUCTS --------------------
export async function getAdminProducts(params?: { 
  page?: number; 
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  priceMin?: string;
  priceMax?: string;
}) {
  // For backward compatibility: if no params, request a very high limit to get all products
  const effectiveParams = params || { page: 1, limit: 9999 };
  
  // Build query parameters
  const queryParams: Record<string, string> = {
    page: String(effectiveParams.page || 1),
    limit: String(effectiveParams.limit || 9999)
  };
  
  // Add filter parameters if provided
  if (effectiveParams.search) {
    queryParams.search = effectiveParams.search;
  }
  if (effectiveParams.category) {
    queryParams.category = effectiveParams.category;
  }
  if (effectiveParams.brand) {
    queryParams.brand = effectiveParams.brand;
  }
  if (effectiveParams.priceMin) {
    queryParams.priceMin = effectiveParams.priceMin;
  }
  if (effectiveParams.priceMax) {
    queryParams.priceMax = effectiveParams.priceMax;
  }
  
  const queryString = '?' + new URLSearchParams(queryParams).toString();
  
  const data = await apiGetAuth(`/admin/products${queryString}`);
  
  // If no params provided (backward compatibility), extract products array
  if (!params) {
    return ensureArray(data?.products || data, ['items', 'products', 'data']);
  }
  
  // Backend now returns: { products, total, page, totalPages, limit, hasNextPage, hasPrevPage }
  // Return the full response for pagination info
  return data;
}

export function getSingleProduct(id: string) {
  return apiGetAuth(`/admin/products/${id}`);
}

export async function createProduct(data: any) {
  try {
    const result = await apiPostAuth("/admin/products", data);
    // Handle different response structures defensively
    const product = result?.product ?? result?.data?.product ?? result?.data ?? null;
    return {
      ok: true,
      success: true,
      product,
      data: result
    };
  } catch (err: any) {
    return {
      ok: false,
      success: false,
      error: err.message || 'Creation failed',
      message: err.message || 'Creation failed'
    };
  }
}

export function updateProduct(id: string, data: any) {
  return apiPutAuth(`/admin/products/${id}`, data);
}

export function deleteProduct(id: string) {
  return apiDeleteAuth(`/admin/products/${id}`);
}

// -------------------- USERS --------------------
export async function getAdminUsers() {
  const data = await apiGetAuth("/admin/users");
  return ensureArray(data, ['items', 'users', 'data']);
}

// -------------------- BRANDS --------------------
export async function getBrands() {
  const res = await fetch(`${API_BASE}/brands`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch brands (${res.status})`);
  }
  const json = await res.json();
  
  // Unwrap envelope if present
  const data = (json && (json.statusCode !== undefined || json.success !== undefined)) 
    ? (json.data ?? json) 
    : json;
  
  return ensureArray(data, ['items', 'brands', 'data']);
}

export async function getAdminBrands(params?: { 
  page?: number; 
  limit?: number;
  search?: string;
  status?: string;
}) {
  // For backward compatibility: if no params, request a very high limit to get all brands
  const effectiveParams = params || { page: 1, limit: 9999 };
  
  // Build query parameters
  const queryParams: Record<string, string> = {
    page: String(effectiveParams.page || 1),
    limit: String(effectiveParams.limit || 9999)
  };
  
  // Add filter parameters if provided
  if (effectiveParams.search) {
    queryParams.search = effectiveParams.search;
  }
  if (effectiveParams.status) {
    queryParams.status = effectiveParams.status;
  }
  
  const queryString = '?' + new URLSearchParams(queryParams).toString();
  
  const data = await apiGetAuth(`/brands/all${queryString}`);
  
  // If no params provided (backward compatibility), extract brands array
  if (!params) {
    return ensureArray(data?.brands || data, ['items', 'brands', 'data']);
  }
  
  // Backend now returns: { brands, total, page, totalPages, limit, hasNextPage, hasPrevPage }
  // Return the full response for pagination info
  return data;
}

export function getSingleBrand(id: string) {
  return apiGetAuth(`/brands/${id}`);
}

export function createBrand(data: any) {
  return apiPostAuth("/brands", data);
}

export function updateBrand(id: string, data: any) {
  return apiPutAuth(`/brands/${id}`, data);
}

export function deleteBrand(id: string) {
  return apiDeleteAuth(`/brands/${id}`);
}

export function disableBrand(id: string) {
  return apiPatchAuth(`/brands/${id}/disable`, {});
}

export function enableBrand(id: string) {
  return apiPatchAuth(`/brands/${id}/enable`, {});
}

// -------------------- CATEGORIES --------------------
export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }
  const json = await res.json();
  
  // Unwrap envelope if present
  const data = (json && (json.statusCode !== undefined || json.success !== undefined)) 
    ? (json.data ?? json) 
    : json;
  
  return ensureArray(data, ['items', 'categories', 'data']);
}

export async function getAdminCategories(params?: { 
  page?: number; 
  limit?: number;
  search?: string;
  status?: string;
}) {
  // For backward compatibility: if no params, request a very high limit to get all categories
  const effectiveParams = params || { page: 1, limit: 9999 };
  
  // Build query parameters
  const queryParams: Record<string, string> = {
    page: String(effectiveParams.page || 1),
    limit: String(effectiveParams.limit || 9999)
  };
  
  // Add filter parameters if provided
  if (effectiveParams.search) {
    queryParams.search = effectiveParams.search;
  }
  if (effectiveParams.status) {
    queryParams.status = effectiveParams.status;
  }
  
  const queryString = '?' + new URLSearchParams(queryParams).toString();
  
  const data = await apiGetAuth(`/categories/all${queryString}`);
  
  // If no params provided (backward compatibility), extract categories array
  if (!params) {
    return ensureArray(data?.categories || data, ['items', 'categories', 'data']);
  }
  
  // Backend now returns: { categories, total, page, totalPages, limit, hasNextPage, hasPrevPage }
  // Return the full response for pagination info
  return data;
}

export function getSingleCategory(id: string) {
  return apiGetAuth(`/categories/${id}`);
}

export function createCategory(data: any) {
  return apiPostAuth("/categories", data);
}

export function updateCategory(id: string, data: any) {
  return apiPutAuth(`/categories/${id}`, data);
}

export function deleteCategory(id: string) {
  return apiDeleteAuth(`/categories/${id}`);
}

export function disableCategory(id: string) {
  return apiPatchAuth(`/categories/${id}/disable`, {});
}

export function enableCategory(id: string) {
  return apiPatchAuth(`/categories/${id}/enable`, {});
}

// -------------------- CONTACT SUBMISSIONS --------------------
export async function getAdminContactSubmissions(params?: { page?: number; limit?: number }) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const data = await apiGetAuth(`/admin/contact-submissions?page=${page}&limit=${limit}`);
  // Return the full response with pagination info
  return data;
}

// -------------------- HOMEPAGE MANAGEMENT --------------------
export async function getAdminHomepageBrands() {
  const data = await apiGetAuth("/admin/homepage/brands");
  return ensureArray(data, ['items', 'brands', 'data']);
}

export async function getAdminHomepageCategories() {
  const data = await apiGetAuth("/admin/homepage/categories");
  return ensureArray(data, ['items', 'categories', 'data']);
}

export async function getAdminTopPicksConfig() {
  const data = await apiGetAuth("/admin/homepage/top-picks");
  return data?.data || { pinnedProductIds: [], pinnedProducts: [] };
}

export async function updateAdminTopPicks(pinnedProductIds: string[]) {
  return apiPutAuth("/admin/homepage/top-picks", { pinnedProductIds });
}

export async function searchProductsForTopPicks(search: string = '', limit: number = 20) {
  const data = await apiGetAuth(`/admin/homepage/products-search?search=${encodeURIComponent(search)}&limit=${limit}`);
  return ensureArray(data, ['items', 'products', 'data']);
}

export async function browseProductsForTopPicks(page: number = 1, limit: number = 10) {
  const data = await apiGetAuth(`/admin/homepage/products-search?browse=true&page=${page}&limit=${limit}`);
  return {
    products: ensureArray(data, ['items', 'products', 'data']),
    pagination: data?.pagination || { page: 1, totalPages: 1, hasNext: false, hasPrev: false, totalCount: 0 }
  };
}

// -------------------- AUTH --------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

// Enhanced auth wrappers with better error handling and credential management
async function apiFetchAuth(path: string, opts: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' } as Record<string, string>;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',      // CRITICAL: sends HttpOnly adminToken cookie
    headers,
    ...opts,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || `Request failed: ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }
  return json;
}

export function apiGetAuth(path: string) { return apiFetchAuth(path, { method: 'GET' }); }
export function apiPostAuth(path: string, data?: any) { return apiFetchAuth(path, { method: 'POST', body: JSON.stringify(data) }); }
export function apiPutAuth(path: string, data?: any) { return apiFetchAuth(path, { method: 'PUT', body: JSON.stringify(data) }); }
export function apiDeleteAuth(path: string) { return apiFetchAuth(path, { method: 'DELETE' }); }

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
    `${backendRoot}/admin/login`,
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

export function adminLogout() {
  return apiPostAuth("/admin/logout", {});
}

// -------------------- PRODUCTS --------------------
export function getAdminProducts() {
  return apiGetAuth("/admin/products");
}

export function getSingleProduct(id: string) {
  return apiGetAuth(`/admin/products/${id}`);
}

export function createProduct(data: any) {
  return apiPostAuth("/admin/products", data);
}

export function updateProduct(id: string, data: any) {
  return apiPutAuth(`/admin/products/${id}`, data);
}

export function deleteProduct(id: string) {
  return apiDeleteAuth(`/admin/products/${id}`);
}

// -------------------- USERS --------------------
export function getAdminUsers() {
  return apiGetAuth("/admin/users");
}

// -------------------- BRANDS --------------------
export async function getBrands() {
  const res = await fetch(`${API_BASE}/brands`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch brands (${res.status})`);
  }
  return res.json();
}

export function getAdminBrands() {
  return apiGetAuth("/brands");
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

// -------------------- CATEGORIES --------------------
export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }
  return res.json();
}

export function getAdminCategories() {
  return apiGetAuth("/categories");
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

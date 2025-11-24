import { apiGet, apiPost, apiPut, apiDelete, apiGetAuth, apiPostAuth, apiPutAuth, apiDeleteAuth } from "@/lib/api";

// -------------------- AUTH --------------------
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api";

async function callLogin(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

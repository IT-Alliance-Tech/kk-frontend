import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

// -------------------- AUTH --------------------
export function adminLogin(email: string, password: string) {
  return apiPost("/admin/login", { email, password });
}

export function adminLogout() {
  return apiPost("/admin/logout", {});
}

// -------------------- PRODUCTS --------------------
export function getAdminProducts() {
  return apiGet("/admin/products");
}

export function getSingleProduct(id: string) {
  return apiGet(`/admin/products/${id}`);
}

export function createProduct(data: any) {
  return apiPost("/admin/products", data);
}

export function updateProduct(id: string, data: any) {
  return apiPut(`/admin/products/${id}`, data);
}

export function deleteProduct(id: string) {
  return apiDelete(`/admin/products/${id}`);
}

// -------------------- USERS --------------------
export function getAdminUsers() {
  return apiGet("/admin/users");
}

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api";

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
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

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`❌ API request failed: ${res.status} ${url}`, errText);
      throw new Error(`API ${path} failed (${res.status})`);
    }

    return (await res.json().catch(() => ({}))) as T;
  } catch (err) {
    console.error("❌ Network error in apiFetch:", err);
    throw err;
  }
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`❌ API GET failed ${res.status} ${url}`, body);
      throw new Error(`GET ${path} failed (${res.status})`);
    }

    return (await res.json().catch(() => ({}))) as T;
  } catch (err) {
    console.error("❌ Network error in apiGet:", err);
    throw err;
  }
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error(`❌ API POST failed ${res.status} ${url}`, msg);
      throw new Error(`POST ${path} failed (${res.status})`);
    }

    return (await res.json().catch(() => ({}))) as T;
  } catch (err) {
    console.error("❌ Network error in apiPost:", err);
    throw err;
  }
}

export async function apiPut<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`PUT ${path} failed (${res.status})`);
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, { 
    method: "DELETE", 
    credentials: "include",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`DELETE ${path} failed (${res.status})`);
  return res.json();
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
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

export async function apiGetAuth<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${path} failed (${res.status})`);
  }
  return res.json().catch(()=>({}));
}

export async function apiPostAuth<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE}${path}`;
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
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `POST ${path} failed (${res.status})`);
  }
  return res.json().catch(()=>({}));
}

export async function apiPutAuth<T = any>(path: string, body: any): Promise<T> {
  const url = `${API_BASE}${path}`;
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
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `PUT ${path} failed (${res.status})`);
  }
  return res.json().catch(()=>({}));
}

export async function apiDeleteAuth<T = any>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `DELETE ${path} failed (${res.status})`);
  }
  return res.json().catch(()=>({}));
}

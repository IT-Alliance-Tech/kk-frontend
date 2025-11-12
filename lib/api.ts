// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api";

export async function apiGet(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      console.error(`❌ API GET failed: ${res.status} ${res.statusText} (${path})`);
      throw new Error(`GET ${path} failed`);
    }
    return await res.json();
  } catch (err) {
    console.error("❌ Network error in apiGet:", err);
    throw err;
  }
}

export async function apiPost(path: string, body: any) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`❌ API POST failed: ${res.status} ${res.statusText} (${path})`);
      throw new Error(`POST ${path} failed`);
    }
    return await res.json();
  } catch (err) {
    console.error("❌ Network error in apiPost:", err);
    throw err;
  }
}

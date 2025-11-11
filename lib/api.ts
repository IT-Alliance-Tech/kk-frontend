// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiGet(path: string) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

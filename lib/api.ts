export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // if empty, same-origin proxy (/api)

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), "accept": "application/json" } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

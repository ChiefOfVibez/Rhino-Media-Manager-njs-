export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; // if empty, same-origin proxy (/api)

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), "accept": "application/json" } });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'accept': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  try { return await res.json(); } catch { return undefined as unknown as T; }
}

// Base URL: empty in dev (uses Vite proxy), backend URL in production
const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
  if (!path) return path;
  // If it's already a full URL (http:// or https://), leave it alone
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}
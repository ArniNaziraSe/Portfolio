// Shared helpers buat semua tab admin

export const API_BASE = "http://localhost:5000";
export const PUBLIC_ABOUT_URL = "http://localhost:5173/about";

// Gabungin path gambar dari backend (cth: /uploads/projects/abc.jpg) jadi URL lengkap.
// Tetap dukung URL eksternal lama (yang udah berupa http://...).
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// Fetch dengan auto-fallback: kalau gagal, return fallback value (gak throw).
// Ini biar 1 endpoint error gak nge-crash semua data lain di dashboard.
export async function safeFetch(endpoint, fallback) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[safeFetch] ${endpoint} gagal, pakai fallback. Error:`, err.message);
    return fallback;
  }
}
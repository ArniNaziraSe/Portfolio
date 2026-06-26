import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/**
 * Hook ini auto-track kunjungan ke halaman publik (non-admin).
 * - Cuma fire sekali per session (pakai sessionStorage flag), gak setiap reload.
 * - Skip otomatis kalau lagi di halaman /admin (biar Serena sendiri gak nge-bias counter).
 * - Pakai keepalive: true biar request tetap kirim walau user langsung close tab.
 */
export default function useTrackVisit() {
  useEffect(() => {
    // Skip kalau di admin
    if (window.location.pathname.startsWith("/admin")) return;

    // Skip kalau session ini udah pernah track
    if (sessionStorage.getItem("visit_tracked") === "true") return;

    fetch(`${API_BASE}/api/track-visit`, {
      method: "POST",
      keepalive: true,
    })
      .then(() => sessionStorage.setItem("visit_tracked", "true"))
      .catch((err) => console.warn("Track visit gagal (skip):", err.message));
  }, []);
}
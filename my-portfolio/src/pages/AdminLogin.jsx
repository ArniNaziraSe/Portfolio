import { useState } from "react";
import "./AdminLogin.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem("admin_logged_in", "true");
        sessionStorage.setItem("admin_token", data.token); // simpan JWT
        onSuccess();
      } else {
        setErrorMsg(data.message || "Password salah!");
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server. Cek koneksi.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        <div className="login-icon">🔐</div>
        <h1>Admin Console</h1>
        <p className="login-subtitle">Restricted access — admin only</p>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter admin password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {errorMsg && <p className="login-error-msg">⚠️ {errorMsg}</p>}

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer-note">
          Lupa password? Cek file <code>.env</code> di backend.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
import React from "react";

function SidebarAdmin({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="admin-sidebar-nav">
      <div className="sidebar-brand">
        <div className="sidebar-brand-avatar">AN</div>
        <div className="sidebar-brand-text">
          <strong>Dashboard</strong>
          <span>admin</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          <span>🏠</span> Overview
        </button>
        <button
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          <span>▦</span> Projects
        </button>
        <button
          className={activeTab === "about" ? "active" : ""}
          onClick={() => setActiveTab("about")}
        >
          <span>👤</span> About
        </button>
      </nav>

      <div className="sidebar-footer">
        <a href="/" target="_blank" rel="noreferrer">← Back to site</a>
        <button onClick={onLogout} className="admin-logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;
import React from "react";

function SidebarAdmin({ activeTab, setActiveTab }) {
  return (
    <aside className="admin-sidebar-nav">
      <div className="sidebar-brand">
        <h2>Portfolio Admin</h2>
        <span>System Controller</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          💻 Projects
        </button>
        <button
          className={activeTab === "about" ? "active" : ""}
          onClick={() => setActiveTab("about")}
        >
          👤 About Me
        </button>
      </nav>

      <div className="sidebar-logout-wrapper">
        <button onClick={() => window.location.href = "/"} className="admin-logout-btn">
          🚪 Exit
        </button>
      </div>
   </aside>
  );
}

export default SidebarAdmin;

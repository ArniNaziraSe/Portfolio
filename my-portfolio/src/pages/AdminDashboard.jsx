import { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import AdminLogin from "./AdminLogin";
import DashboardTab from "./tabs/DashboardTab";
import ProjectsTab from "./tabs/ProjectsTab";
import AboutTab from "./tabs/AboutTab";
import "./AdminDashboard.css";

function AdminDashboard() {
  // Auth check: pas mount, cek dari sessionStorage.
  // sessionStorage = otomatis ke-clear pas browser ditutup, tapi tetap ada
  // selama tab aktif. Cocok buat admin dashboard yang gak butuh persistent login.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("admin_logged_in") === "true"
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  // Logout handler — dipanggil dari tombol Exit di SidebarAdmin
  const handleLogout = () => {
    if (window.confirm("Yakin mau logout dari admin console?")) {
      sessionStorage.removeItem("admin_logged_in");
      setIsAuthenticated(false);
    }
  };

  // Kalau belum login, render halaman login dulu
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Udah login → render dashboard
  return (
    <div className="admin-container">
      <SidebarAdmin
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="admin-main-workspace">
        <HeaderAdmin notifications={notifications} />

        <div className="workspace-scroll-content">
          {activeTab === "dashboard" && (
            <DashboardTab
              projectsCount={projectsCount}
              skillsCount={skillsCount}
              onNotificationsUpdate={setNotifications}
            />
          )}

          {activeTab === "projects" && <ProjectsTab onCountChange={setProjectsCount} />}

          {activeTab === "about" && <AboutTab onSkillsCountChange={setSkillsCount} />}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
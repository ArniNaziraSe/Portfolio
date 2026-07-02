import { useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import AdminLogin from "./AdminLogin";
import DashboardTab from "./tabs/DashboardTab";
import ProjectsTab from "./tabs/ProjectsTab";
import AboutTab from "./tabs/AboutTab";
import "./AdminDashboard.css";

const TAB_TITLES = {
  dashboard: "Overview",
  projects: "Projects",
  about: "Profile",
};

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("admin_logged_in") === "true"
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  const handleLogout = () => {
    if (window.confirm("Yakin mau logout dari admin console?")) {
      sessionStorage.removeItem("admin_logged_in");
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="admin-container">
      <SidebarAdmin
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="admin-main-workspace">
        <HeaderAdmin title={TAB_TITLES[activeTab] || "Dashboard"} />

        <div className="workspace-scroll-content">
          {activeTab === "dashboard" && (
            <DashboardTab
              projectsCount={projectsCount}
              skillsCount={skillsCount}
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
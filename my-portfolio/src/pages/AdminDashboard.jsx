import { useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import DashboardTab from "./tabs/DashboardTab";
import ProjectsTab from "./tabs/ProjectsTab";
import AboutTab from "./tabs/AboutTab";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Notifikasi diangkat ke level container biar bisa dishow di HeaderAdmin
  const [notifications, setNotifications] = useState([]);

  // Count buat ditampilin di metric card Dashboard
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  return (
    <div className="admin-container">
      <SidebarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />

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
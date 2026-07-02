import { useEffect, useState } from "react";
import { safeFetch } from "./apiClient";

// Format tanggal buat label chart: "18", "19", "20", dst
function formatDay(dateStr) {
  const d = new Date(dateStr);
  return String(d.getDate()).padStart(2, "0");
}

function DashboardTab() {
  const [overview, setOverview] = useState({
    totalVisits: 0,
    thisWeek: 0,
    projectViews: 0,
    projectsCount: 0,
    topProjects: [],
  });
  const [daily, setDaily] = useState([]);

  useEffect(() => {
    // Ambil overview & daily parallel biar cepat
    Promise.all([
      safeFetch("/api/analytics/overview", {}),
      safeFetch("/api/analytics/daily-visits", []),
    ]).then(([overviewData, dailyData]) => {
      if (overviewData) setOverview(overviewData);
      if (dailyData) setDaily(dailyData);
    });
  }, []);

  // Max value buat scaling bar chart (biar bar terpanjang jadi ~90% dari tinggi container)
  const maxVisit = Math.max(...daily.map((d) => d.count), 1);
  const maxProjectView = Math.max(...(overview.topProjects || []).map((p) => p.views || 0), 1);

  return (
    <div className="tab-view">
      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Visits"
          value={overview.totalVisits}
          sub={`+${overview.thisWeek} this week`}
          icon="👁"
        />
        <StatCard
          title="This Week"
          value={overview.thisWeek}
          sub="last 7 days"
          icon="📈"
        />
        <StatCard
          title="Project Views"
          value={overview.projectViews}
          sub="across all projects"
          icon="👥"
        />
        <StatCard
          title="Projects"
          value={overview.projectsCount}
          sub="published"
          icon="📁"
        />
      </div>

      {/* Chart + Top Projects */}
      <div className="overview-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Website Visits</div>
            <div className="chart-card-sub">Last 14 days</div>
          </div>

          <div className="chart-bars">
            {daily.map((d, idx) => {
              const heightPct = (d.count / maxVisit) * 100;
              const isLast = idx === daily.length - 1;
              return (
                <div
                  key={idx}
                  className={`chart-bar ${isLast ? "active" : ""}`}
                  title={`${d.count} visits`}
                >
                  <div
                    className="chart-bar-fill"
                    style={{ height: `${Math.max(heightPct, 3)}%` }}
                  />
                  <div className="chart-bar-label">{formatDay(d.day)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="top-projects-card">
          <h3>Top Projects</h3>
          {overview.topProjects && overview.topProjects.length > 0 ? (
            overview.topProjects.map((p) => {
              const pct = ((p.views || 0) / maxProjectView) * 100;
              return (
                <div className="top-project-item" key={p.id}>
                  <div className="top-project-header">
                    <span className="top-project-name">{p.title}</span>
                    <span className="top-project-count">{p.views || 0}</span>
                  </div>
                  <div className="top-project-bar">
                    <div
                      className="top-project-bar-fill"
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Belum ada data view.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-value">{value.toLocaleString()}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}

export default DashboardTab;
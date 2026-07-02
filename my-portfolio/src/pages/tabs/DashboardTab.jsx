import { useEffect, useState, useRef } from "react";
import { safeFetch } from "./apiClient";

const REFRESH_INTERVAL_MS = 15000; // Auto-refresh tiap 15 detik

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
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    const [overviewData, dailyData] = await Promise.all([
      safeFetch("/api/analytics/overview", {}),
      safeFetch("/api/analytics/daily-visits", []),
    ]);
    if (overviewData) setOverview(overviewData);
    if (dailyData) setDaily(dailyData);
    setLastUpdate(new Date());
    setIsLive(true);
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh — data ke-update tanpa reload page.
    // clearInterval on unmount biar gak leak.
    intervalRef.current = setInterval(fetchData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const maxVisit = Math.max(...daily.map((d) => d.count), 1);
  const maxProjectView = Math.max(...(overview.topProjects || []).map((p) => p.views || 0), 1);

  return (
    <div className="tab-view">
      {/* Live indicator */}
      <div className="live-indicator">
        <span className={`live-dot ${isLive ? "on" : ""}`}></span>
        <span>Live · updates every {REFRESH_INTERVAL_MS / 1000}s</span>
        {lastUpdate && (
          <span className="last-update">
            (last: {lastUpdate.toLocaleTimeString()})
          </span>
        )}
      </div>

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
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
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
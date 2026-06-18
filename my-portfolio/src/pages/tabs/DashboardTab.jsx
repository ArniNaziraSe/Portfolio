import { useEffect, useState } from "react";
import { safeFetch } from "./apiClient";

function DashboardTab({ projectsCount, skillsCount, onNotificationsUpdate }) {
  const [analytics, setAnalytics] = useState({ totalVisits: 0, liveNow: 0, notifications: [] });
  const [timeseries, setTimeseries] = useState([]);

  useEffect(() => {
    // Fetch independen — kalau salah satu gagal, yang lain tetap kebaca
    safeFetch("/api/analytics/overview", { totalVisits: 0, liveNow: 0, notifications: [] }).then((data) => {
      setAnalytics(data);
      if (onNotificationsUpdate) onNotificationsUpdate(data.notifications || []);
    });
    safeFetch("/api/analytics/timeseries", []).then(setTimeseries);
  }, [onNotificationsUpdate]);

  return (
    <div className="tab-view animate-fade">
      <div className="view-header">
        <h1>Live Overview</h1>
        <p>Real-time system behavior and traffic metrics dashboard report.</p>
      </div>

      <div className="metrics-summary-grid">
        <div className="metric-glass-card active-now">
          <span>Live Now</span>
          <h3>{analytics.liveNow}</h3>
          <p className="trend-up">Active in last hour</p>
        </div>
        <div className="metric-glass-card">
          <span>Total Visits</span>
          <h3>{analytics.totalVisits.toLocaleString()}</h3>
          <p>Database logs trace counts</p>
        </div>
        <div className="metric-glass-card">
          <span>Unique Projects</span>
          <h3>{projectsCount}</h3>
          <p>Active repository stack</p>
        </div>
        <div className="metric-glass-card">
          <span>Skill Categories</span>
          <h3>{skillsCount}</h3>
          <p>Technical segments listed</p>
        </div>
      </div>

      <div className="chart-analytics-card">
        <h4>Live Visitor Report</h4>
        <p className="chart-subtitle">
          Total {timeseries.reduce((s, p) => s + p.count, 0)} visits in the last 24 hours
        </p>
        <VisitorChart data={timeseries} />
      </div>
    </div>
  );
}

// ============================================================
// VISITOR CHART — area chart yang nampilin 24 jam terakhir
// ============================================================
function VisitorChart({ data }) {
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 32, left: 36 };

  if (!data || data.length === 0) {
    return <p className="chart-empty">Belum ada data kunjungan dalam 24 jam terakhir.</p>;
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const niceMax = Math.ceil(maxCount / 5) * 5 || 5;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.count / niceMax) * chartHeight;
    return { x, y, count: d.count, hour: d.hour };
  });

  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `Q ${cx} ${prev.y} ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const yTicks = [0, 1, 2, 3, 4].map((i) => {
    const value = Math.round((niceMax / 4) * (4 - i));
    const y = padding.top + (i / 4) * chartHeight;
    return { y, value };
  });

  const xTickIndexes = [0, Math.floor(data.length / 3), Math.floor((data.length * 2) / 3), data.length - 1];

  function formatHour(isoString) {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, "0")}:00`;
  }

  return (
    <div className="visitor-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="visitor-chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#765469" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#765469" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="#eceef0"
              strokeWidth="1"
              strokeDasharray={i === yTicks.length - 1 ? "0" : "3 3"}
            />
            <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" className="chart-axis-label">
              {tick.value}
            </text>
          </g>
        ))}

        {xTickIndexes.map((idx, i) => (
          <text
            key={i}
            x={points[idx].x}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            className="chart-axis-label"
          >
            {formatHour(data[idx].hour)}
          </text>
        ))}

        <path d={areaPath} fill="url(#chartFillGradient)" />
        <path d={linePath} fill="none" stroke="#765469" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) =>
          p.count > 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#765469" strokeWidth="2">
              <title>{`${formatHour(p.hour)} — ${p.count} visits`}</title>
            </circle>
          ) : null
        )}
      </svg>
    </div>
  );
}

export default DashboardTab;
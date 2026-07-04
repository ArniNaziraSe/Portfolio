import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TechIcon from "./TechIcon";
import "./TechIcon.css";
import "./MainContent.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6,
  july: 7, august: 8, october: 10, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

// Sort key: year*100 + month. Kalau month kosong, monthNum=0.
function getProjectSortKey(p) {
  const year = parseInt(p.year || "0") || 0;
  const monthText = String(p.month || "").toLowerCase();
  let monthNum = 0;
  for (const [name, num] of Object.entries(MONTHS)) {
    if (monthText.includes(name)) {
      monthNum = num;
      break;
    }
  }
  // Cek juga apakah bulan ditulis pake angka (1-12)
  if (monthNum === 0) {
    const asNum = parseInt(monthText);
    if (asNum >= 1 && asNum <= 12) monthNum = asNum;
  }
  return year * 100 + monthNum;
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function MainContent() {
  const [featured, setFeatured] = useState([]);
  const [profile, setProfile] = useState(null);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/projects`).then((r) => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/profile`).then((r) => r.json()).catch(() => null),
    ]).then(([projectsData, profileData]) => {
      // Sort by newest (month+year) descending
      const sorted = [...projectsData].sort((a, b) => getProjectSortKey(b) - getProjectSortKey(a));
      setProjectsCount(sorted.length);
      setFeatured(sorted.slice(0, 3));
      setProfile(profileData);
      setLoading(false);
    });
  }, []);

  return (
    <main className="home-main">
      <section className="hero-block">
        <span className="status-pill">
          <span className="status-dot" /> Available for new projects
        </span>

        <h1 className="hero-name">{profile?.full_name || "Arni Nazira"}</h1>

        <div className="hero-desc">
          <p>Informatics Engineering graduate focused on software development and data analytics.</p>
        </div>

        <div className="hero-buttons">
          {profile?.cv_url && (
            <a href={profile.cv_url} className="btn-primary" target="_blank" rel="noreferrer">
              ⬇ Download CV
            </a>
          )}
          <Link to="/projects" className="btn-outline">View Projects</Link>
        </div>

        <div className="hero-stats">
          <div className="stat-block">
            <span className="stat-num">{projectsCount || "0"}+</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-block">
            <span className="stat-num">{profile?.focus || "Web·Mobile"}</span>
            <span className="stat-label">Focus</span>
          </div>
          <div className="stat-block">
            <span className="stat-num">{profile?.graduation_year || "2025"}</span>
            <span className="stat-label">Graduated</span>
          </div>
        </div>
      </section>

      <section className="featured-block">
        <div className="section-heading">
          <div>
            <span className="section-label">SELECTED WORK</span>
            <h2>Featured Projects</h2>
          </div>
          <Link to="/projects" className="section-see-all">See all →</Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        ) : (
          <div className="featured-grid">
            {featured.map((p, idx) => (
              <FeaturedCard key={p.id} project={p} idx={idx + 1} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function FeaturedCard({ project, idx }) {
  const [imgError, setImgError] = useState(false);
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const numStr = String(idx).padStart(2, "0");
  const showImage = imgUrl && !imgError;

  return (
    <Link to={`/projects/${project.slug}`} className="featured-card">
      <div className="number-placeholder">
        {showImage ? (
          <img src={imgUrl} alt={project.title} onError={() => setImgError(true)} />
        ) : (
          <span className="number-placeholder-num">{numStr}</span>
        )}
        {project.category && (
          <span className="card-category-label">{project.category}</span>
        )}
      </div>

      <div className="featured-card-body">
        <h3>{project.title}</h3>
        <p>{project.short_description || "—"}</p>

        <div className="tech-pills">
          {techList.slice(0, 5).map((t) => (
            <span key={t} className="tech-pill-icon">
              <TechIcon name={t} size={12} />
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default MainContent;
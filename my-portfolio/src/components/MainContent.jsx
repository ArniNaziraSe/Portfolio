import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TechIcon from "./TechIcon";
import "./TechIcon.css";
import "../pages/MainContent.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

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
      setProjectsCount(projectsData.length);
      setFeatured(projectsData.slice(0, 3));
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
          {profile?.bio ? (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: profile.bio }} />
          ) : (
            <p>Informatics Engineering graduate focused on web & mobile development.</p>
          )}
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
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const numStr = String(idx).padStart(2, "0");

  return (
    <Link to={`/projects/${project.slug}`} className="featured-card">
      <div className="number-placeholder">
        {imgUrl ? (
          <img src={imgUrl} alt={project.title} onError={(e) => (e.target.style.display = "none")} />
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
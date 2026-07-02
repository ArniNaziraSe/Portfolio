import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TechIcon from "../components/TechIcon";
import "../components/TechIcon.css";
import "../components/RichTextEditor.css";
import "./ProjectDetail.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [projectIdx, setProjectIdx] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/projects`);
        const data = await res.json();
        const idx = data.findIndex((p) => p.slug === slug);
        if (idx === -1) {
          setNotFound(true);
          return;
        }
        setProject(data[idx]);
        setProjectIdx(idx + 1);

        // Track view sekali per session
        const viewKey = `viewed_${slug}`;
        if (!sessionStorage.getItem(viewKey)) {
          fetch(`${API_BASE}/api/projects/${slug}/track-view`, {
            method: "POST",
            keepalive: true,
          })
            .then(() => sessionStorage.setItem(viewKey, "true"))
            .catch(() => {});
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <main className="pd-main">
          <p style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
            Loading...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="home-page">
        <Header />
        <main className="pd-main">
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h1>Project Not Found</h1>
            <Link to="/projects" className="btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
              Back to projects
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const featuresList = project.features
    ? project.features.split("\n").map((f) => f.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const numStr = String(projectIdx).padStart(2, "0");

  return (
    <div className="home-page">
      <Header />

      <main className="pd-main">
        <Link to="/projects" className="pd-back-link">← Back to projects</Link>

        <div className="pd-header">
          <div className="pd-meta-line">
            <span className="pd-category">{project.category || "Project"}</span>
            <span className="pd-dot">·</span>
            <span className="pd-year">{project.year || ""}</span>
          </div>

          <h1>{project.title}</h1>

          {project.short_description && <p className="pd-short">{project.short_description}</p>}

          <div className="pd-buttons">
            {project.github_link && (
              <a href={project.github_link} target="_blank" rel="noreferrer" className="pd-btn-dark">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                View on GitHub
              </a>
            )}
            {project.demo_link && (
              <a href={project.demo_link} target="_blank" rel="noreferrer" className="btn-outline">
                ↗ Live Demo
              </a>
            )}
          </div>
        </div>

        {/* HERO IMAGE / NUMBER PLACEHOLDER */}
        <div className="pd-hero-img number-placeholder">
          {imgUrl ? (
            <img src={imgUrl} alt={project.title} onError={(e) => (e.target.style.display = "none")} />
          ) : (
            <span className="number-placeholder-num">{numStr}</span>
          )}
        </div>

        {/* CONTENT */}
        <div className="pd-content-grid">
          <div className="pd-left">
            {project.description && (
              <div className="pd-section">
                <span className="section-label">OVERVIEW</span>
                <div
                  className="rich-content pd-desc"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>
            )}

            {featuresList.length > 0 && (
              <div className="pd-section">
                <span className="section-label">HIGHLIGHTS</span>
                <ul className="pd-features">
                  {featuresList.map((f, i) => (
                    <li key={i}>
                      <span className="pd-feature-diamond">◆</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="pd-right">
            <div className="pd-details-card">
              <span className="section-label">DETAILS</span>

              {project.role && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Role</span>
                  <strong>{project.role}</strong>
                </div>
              )}

              {project.year && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Year</span>
                  <strong>{project.year}</strong>
                </div>
              )}

              {techList.length > 0 && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Tech Stack</span>
                  <div className="pd-tech-pills">
                    {techList.map((t) => (
                      <span key={t} className="pd-tech-pill">
                        <TechIcon name={t} size={12} />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProjectDetail;
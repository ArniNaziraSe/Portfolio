import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TechIcon from "../components/TechIcon";
import "../components/TechIcon.css";
import "../components/RichTextEditor.css";
import "./ProjectDetail.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/projects`);
        const data = await res.json();
        const found = data.find((p) => p.slug === slug);
        if (!found) { setNotFound(true); return; }
        setProject(found);

        const viewKey = `viewed_${slug}`;
        if (!sessionStorage.getItem(viewKey)) {
          fetch(`${API_BASE}/api/projects/${slug}/track-view`, { method: "POST", keepalive: true })
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
            <Link to="/#projects" className="btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
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
  const categoriesJoined = project.category
    ? project.category.split(",").map((c) => c.trim()).filter(Boolean).join(" · ")
    : "Project";

  return (
    <div className="home-page">
      <Header />

      <main className="pd-main">
        <Link to="/#projects" className="pd-back-link">← Back to projects</Link>

        <div className="pd-header">
          <div className="pd-meta-line">
            <span className="pd-category">{categoriesJoined}</span>
            {project.year && (
              <>
                <span className="pd-dot">·</span>
                <span className="pd-year">
                  {project.month ? `${project.month} ` : ""}{project.year}
                </span>
              </>
            )}
          </div>

          <h1>{project.title}</h1>

          {project.short_description && <p className="pd-short">{project.short_description}</p>}
        </div>

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

            {project.impact && (
              <div className="pd-section">
                <span className="section-label">IMPACT</span>
                <p className="pd-impact">{project.impact}</p>
              </div>
            )}
          </div>

          <aside className="pd-right">
            <div className="pd-details-card">
              <span className="section-label">DETAILS</span>

              {project.project_type && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Project Type</span>
                  <strong>{project.project_type}</strong>
                </div>
              )}

              {project.role && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Role</span>
                  <strong>{project.role}</strong>
                </div>
              )}

              {project.year && (
                <div className="pd-detail-row">
                  <span className="pd-detail-label">Year</span>
                  <strong>
                    {project.month ? `${project.month} ` : ""}{project.year}
                  </strong>
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
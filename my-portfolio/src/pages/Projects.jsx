import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Projects.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Ambil unique categories dari data project, sisipkan "All" di depan
  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => { if (p.category) set.add(p.category); });
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  return (
    <div className="home-page">
      <Header />

      <main className="projects-page-main">
        <div className="projects-page-header">
          <span className="section-label">PORTFOLIO</span>
          <h1>All Projects</h1>
          <p className="projects-count">{filtered.length} projects</p>
        </div>

        {categories.length > 1 && (
          <div className="filter-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-pill ${activeCategory === c ? "active" : ""}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            Loading...
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((p, idx) => (
              <ProjectCard key={p.id} project={p} idx={idx + 1} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProjectCard({ project, idx }) {
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const numStr = String(idx).padStart(2, "0");

  return (
    <Link to={`/projects/${project.slug}`} className="project-card">
      <div className="number-placeholder">
        {imgUrl ? (
          <img src={imgUrl} alt={project.title} onError={(e) => (e.target.style.display = "none")} />
        ) : (
          <span className="number-placeholder-num">{numStr}</span>
        )}
      </div>

      <div className="project-card-body">
        <div className="project-card-title-row">
          <h3>{project.title}</h3>
          <span className="project-card-year">{project.year || ""}</span>
        </div>

        <p>{project.short_description || "—"}</p>

        <div className="tech-pills">
          {techList.slice(0, 5).map((t) => (
            <span key={t} className="tech-pill-mini">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default Projects;
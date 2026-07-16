import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TechIcon from "../components/TechIcon";
import "../components/TechIcon.css";
import "./Projects.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const MONTHS = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6,
  july: 7, august: 8, october: 10, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function getProjectSortKey(p) {
  const year = parseInt(p.year || "0") || 0;
  const monthText = String(p.month || "").toLowerCase();
  let monthNum = 0;
  for (const [name, num] of Object.entries(MONTHS)) {
    if (monthText.includes(name)) { monthNum = num; break; }
  }
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

function ImagePlaceholderIcon() {
  return (
    <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
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

  const categories = useMemo(() => {
    const fixed = ["All", "Web App", "Mobile App", "Dashboard", "Admin/Data"];
    const fromData = new Set();
    projects.forEach((p) => {
      (p.category || "").split(",").forEach((c) => {
        const trimmed = c.trim();
        if (trimmed && !fixed.includes(trimmed)) fromData.add(trimmed);
      });
    });
    return [...fixed, ...Array.from(fromData)];
  }, [projects]);

  const filtered = useMemo(() => {
    const base = activeCategory === "All"
      ? projects
      : projects.filter((p) => {
          const cats = (p.category || "").split(",").map((c) => c.trim());
          return cats.includes(activeCategory);
        });
    return [...base].sort((a, b) => getProjectSortKey(b) - getProjectSortKey(a));
  }, [projects, activeCategory]);

  return (
    <div className="home-page">
      <Header />

      <main className="projects-page-main">
        <div className="projects-page-header">
          <h1>PROJECTS</h1>
          <p className="projects-count">{filtered.length} projects</p>
        </div>

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

        {isLoading ? (
          <p style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            Loading...
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ProjectCard({ project }) {
  const [imgError, setImgError] = useState(false);
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const imgUrl = getImageUrl(project.image_url);
  const showImage = imgUrl && !imgError;

  return (
    <Link to={`/projects/${project.slug}`} className="project-card">
      <div className="number-placeholder">
        {showImage ? (
          <img src={imgUrl} alt={project.title} onError={() => setImgError(true)} />
        ) : (
          <ImagePlaceholderIcon />
        )}
      </div>

      <div className="project-card-body">
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

export default Projects;
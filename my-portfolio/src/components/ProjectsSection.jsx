import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import TechIcon from "./TechIcon";
import "./TechIcon.css";
import "./ProjectsSection.css";

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

function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/api/projects`)
      .then((r) => r.json())
      .then((data) => { setProjects(data); setIsLoading(false); })
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
    <div className="projects-section-inner">
      <div className="section-heading-block">
        <h2>PROJECTS</h2>
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
        <p style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          Loading...
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
          Belum ada project di kategori ini.
        </p>
      ) : (
        <div className="projects-grid-noimg">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  const techList = project.tech_stack
    ? project.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const firstCategory = project.category
    ? project.category.split(",")[0].trim()
    : "Project";
  const period = [project.month, project.year].filter(Boolean).join(" ");

  return (
    <Link to={`/projects/${project.slug}`} className="project-card-noimg">
      <div className="project-card-top">
        <span className="project-card-badge">{firstCategory}</span>
        {period && <span className="project-card-year mono">{period}</span>}
      </div>

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
    </Link>
  );
}

export default ProjectsSection;